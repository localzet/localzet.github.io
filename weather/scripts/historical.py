#!/usr/bin/env python3
"""NOAA-observation backtest of fixed-lead Open-Meteo Previous Runs forecasts.

This is independent of the operational captured_at snapshot analysis.
It is not a reconstruction of individual model initialization times.
"""
import json
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from bench import BASE, WMO, get, station_crosswalk, observations_from_psv, nearest_reading, dt, metric
from collect import CITIES

API="https://previous-runs-api.open-meteo.com/v1/forecast"
MODELS={"ecmwf_default":"ecmwf_ifs025","gfs_default":"gfs_global","icon_default":"icon_global"}
LEADS=(1,2,3)
MIN_DAYS=20
MIN_PAIRS=100
ROOT=Path(__file__).resolve().parents[2]

def forecast_url(city, model, start, end):
    lat,lon=CITIES[city]
    params={"latitude":lat,"longitude":lon,"timezone":"UTC",
            "start_date":start.isoformat(),"end_date":end.isoformat(),
            "hourly":",".join(f"temperature_2m_previous_day{x}" for x in LEADS),
            "models":MODELS[model]}
    return API+"?"+urlencode(params)

def fetch_forecast(city, model, start, end):
    request=Request(forecast_url(city,model,start,end),
                    headers={"Accept":"application/json","User-Agent":"localzet-weather-research/0.2"})
    with urlopen(request,timeout=35) as response:
        raw=response.read(4_000_001)
    if len(raw)>4_000_000: raise ValueError("Historical API response too large")
    response=json.loads(raw)
    hourly=response.get("hourly") or {}
    if response.get("error") or not isinstance(hourly.get("time"),list):
        raise ValueError("Invalid Previous Runs response")
    times=hourly["time"]
    result={}
    for day in LEADS:
        key=f"temperature_2m_previous_day{day}"
        values=hourly.get(key)
        if not isinstance(values,list) or len(values)!=len(times):
            raise ValueError(f"Missing {key} from historical model")
        result[day]={dt(stamp):float(value) for stamp,value in zip(times,values)
                     if isinstance(value,(float,int)) and math.isfinite(value)}
    return result

def calculate(observations,predictions):
    output={}
    for day in LEADS:
        shared=(set.intersection(*(set(by_day[day]) for by_day in predictions.values()))
                if len(predictions)==len(MODELS) else set())
        common=[]
        for valid in sorted(shared):
            observed=nearest_reading(observations,valid)
            if observed is not None: common.append((valid,observed))
        models={}
        for model in MODELS:
            pairs=([(valid,predictions[model][day][valid]-observed) for valid,observed in common]
                   if model in predictions else [])
            score=metric(pairs)
            if score["status"]=="verified" and (score["samples"]<MIN_PAIRS or score["distinct_days"]<MIN_DAYS):
                score={"status":"insufficient_samples","samples":score["samples"],
                       "distinct_days":score["distinct_days"]}
            models[model]=score
        eligible={model:result for model,result in models.items() if result["status"]=="verified"}
        best=min(eligible,key=lambda key:eligible[key]["mae_c"]) if len(eligible)==len(MODELS) else None
        output[str(day*24)]={"models":models,"best_model":best}
    return output

def main():
    now=datetime.now(timezone.utc)
    end=(now-timedelta(days=3)).date()
    start=end-timedelta(days=89)
    stations=station_crosswalk(get(BASE+"/doc/ghcnh-station-list.csv",5_000_000))
    cities={}
    problems=[]
    successful_forecast_requests=0
    for city in CITIES:
        station=stations.get(city)
        if station is None:
            cities[city]={"station":{"wmo_id":WMO[city],"status":"not_found"},
                          "horizons":calculate({}, {})}
            continue
        measurements={}
        for year in range(start.year,end.year+1):
            url=f"{BASE}/access/by-year/{year}/psv/GHCNh_{station['ghcnh_id']}_{year}.psv"
            try:
                measurements.update(observations_from_psv(get(url)))
            except (HTTPError,URLError,ValueError,TimeoutError) as exc:
                problems.append(f"{city}: NOAA {year}: {exc}")
        forecasts={}
        if measurements:
            for model in MODELS:
                try:
                    forecasts[model]=fetch_forecast(city,model,start,end)
                    successful_forecast_requests+=1
                except (HTTPError,URLError,ValueError,TimeoutError) as exc:
                    problems.append(f"{city}: {model}: {exc}")
        station={**station,"status":"observations_available" if measurements else "no_quality_checked_observations",
                 "observation_count":len(measurements)}
        cities[city]={"station":station,"horizons":calculate(measurements,forecasts)}
    verified=any(city["horizons"][h]["best_model"] is not None
                 for city in cities.values() for h in ("24","48","72"))
    # External model API outage must never erase an existing, verified report.
    if successful_forecast_requests==0 and (ROOT/"weather/data/historical.json").exists():
        raise RuntimeError("No historical forecasts fetched; preserving previous report")
    report={"schema_version":1,"kind":"previous_runs_historical",
            "generated_at":now.isoformat(timespec="seconds"),"start_date":str(start),"end_date":str(end),
            "status":"verified" if verified else "insufficient_data",
            "minimum_samples":MIN_PAIRS,"minimum_distinct_days":MIN_DAYS,
            "methodology":"Open-Meteo fixed previous_day1/2/3 predictions at city coordinates, compared only with common quality-checked NOAA GHCNh station temperatures; stations can be outside the city",
            "observation_source":"NOAA NCEI GHCNh QC=1",
            "forecast_source":"Open-Meteo Previous Runs API",
            "cities":cities,"errors":problems[:25]}
    dest=ROOT/"weather/data/historical.json"
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(json.dumps(report,ensure_ascii=False,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    print(f"Historical backtest {start}..{end}: verified={verified}, model_requests={successful_forecast_requests}, errors={len(problems)}")

if __name__=="__main__":
    main()
