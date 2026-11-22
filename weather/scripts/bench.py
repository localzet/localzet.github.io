#!/usr/bin/env python3
"""Operational temperature verification. Observations: NOAA NCEI GHCNh, not reanalysis.

Forecast captured_at is availability/crawl time, not NWP initialization time.
Only temperature QC=1 reports are scored. No station substitution/interpolation.
"""
import csv
import gzip
import io
import json
import math
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.request import Request, urlopen

BASE = "https://www.ncei.noaa.gov/oa/global-historical-climatology-network/hourly"
WMO = {"rostov":"34730","ekaterinburg":"28440","severouralsk":"23919","karpinsk":"28033","krasnoturyinsk":"28041"}
COORDS = {"rostov":(47.2630,39.8123),"ekaterinburg":(56.8264,60.6310),"severouralsk":(60.2418,59.9845),"karpinsk":(59.7566,60.0112),"krasnoturyinsk":(59.7709,60.2118)}
MODELS = ("ecmwf_default","gfs_default","icon_default")
HORIZONS = (24,48,72)
ROOT = Path(__file__).resolve().parents[2]

def get(url, limit=20000000):
    request=Request(url,headers={"User-Agent":"localzet-weather/0.2 (NOAA verification)","Accept":"text/plain"})
    with urlopen(request, timeout=30) as response:
        if int(response.headers.get("Content-Length","0") or 0)>limit:
            raise ValueError("NOAA data exceeds size limit")
        body=response.read(limit+1)
        if len(body)>limit: raise ValueError("NOAA data exceeds size limit")
        return body.decode("utf-8-sig")

def dt(s):
    result=datetime.fromisoformat(s.replace("Z","+00:00"))
    return result.replace(tzinfo=timezone.utc) if result.tzinfo is None else result.astimezone(timezone.utc)

def station_crosswalk(source):
    result={}
    for row in csv.DictReader(io.StringIO(source)):
        wmo=(row.get("WMO_ID") or "").strip().zfill(5)
        city=next((c for c,id in WMO.items() if id==wmo),None)
        if city is None or city in result: continue
        try:
            lat,lon=float(row["LATITUDE"]),float(row["LONGITUDE"])
            rlat,rlon=COORDS[city]
            # Conservative rectangular sanity gate; never replace an absent station with a nearby one.
            if abs(lat-rlat)>0.35 or abs(lon-rlon)>0.65: continue
        except (ValueError,KeyError,TypeError): continue
        station_id=(row.get("GHCN_ID") or row.get("GHCNh_ID") or "").strip()
        if not station_id or not all(c.isalnum() or c in "_-" for c in station_id): continue
        result[city]={"ghcnh_id":station_id,"wmo_id":wmo,
                      "name":(row.get("NAME") or station_id).strip(),
                      "latitude":lat,"longitude":lon,"status":"matched"}
    return result

def observations_from_psv(source):
    records={}
    for row in csv.DictReader(io.StringIO(source),delimiter="|"):
        if (row.get("temperature_Quality_Code") or "").strip()!="1": continue
        try:
            value=float(row["temperature"])
            if not math.isfinite(value) or not -85<=value<=60: continue
            stamp=datetime(int(row["Year"]),int(row["Month"]),int(row["Day"]),int(row["Hour"]),int(row.get("Minute") or 0),tzinfo=timezone.utc)
            records[stamp]=value
        except (KeyError,ValueError,TypeError): continue
    return records

def nearest_reading(records, stamp):
    # Station observation timestamps are often not exact hours.
    candidates=[(abs(delta),records[stamp+timedelta(minutes=delta)]) for delta in range(-45,46)
                if stamp+timedelta(minutes=delta) in records]
    return min(candidates,key=lambda row:row[0])[1] if candidates else None

def prediction(forecast, captured, horizon):
    times=forecast.get("time",[])
    values=forecast.get("temperature_2m",[])
    if len(times)!=len(values): return None
    expected=captured+timedelta(hours=horizon)
    candidates=[]
    for timestamp,temperature in zip(times,values):
        if not isinstance(temperature,(int,float)) or not math.isfinite(temperature): continue
        try: valid=dt(timestamp)
        except ValueError: continue
        delta=abs((valid-expected).total_seconds())
        if delta<=31*60: candidates.append((delta,valid,float(temperature)))
    return min(candidates,key=lambda row:row[0])[1:] if candidates else None

def metric(rows):
    n=len(rows)
    days=len({stamp.date() for stamp,_ in rows})
    if n<20 or days<5: return {"status":"insufficient_samples","samples":n,"distinct_days":days}
    errors=[err for _,err in rows]
    absolute=sorted(abs(x) for x in errors)
    return {"status":"verified","samples":n,"distinct_days":days,
            "mae_c":round(sum(absolute)/n,3),
            "bias_c":round(sum(errors)/n,3),
            "rmse_c":round(math.sqrt(sum(x*x for x in errors)/n),3),
            "p95_abs_c":round(absolute[math.ceil(0.95*n)-1],3)}

def build(snapshots, stations, observations):
    errors=defaultdict(list)
    for snap in snapshots:
        try: captured=dt(snap["captured_at"])
        except (ValueError,KeyError): continue
        entries=defaultdict(dict)
        for item in snap.get("entries",[]):
            if item.get("city") in WMO and item.get("provider") in MODELS:
                entries[item["city"]][item["provider"]]=item.get("forecast",{})
        for city, models in entries.items():
            if set(models)!=set(MODELS) or city not in observations: continue
            for horizon in HORIZONS:
                candidates={name:prediction(series,captured,horizon) for name,series in models.items()}
                if any(x is None for x in candidates.values()): continue
                times={x[0] for x in candidates.values()}
                if len(times)!=1: continue
                valid=next(iter(times))
                measured=nearest_reading(observations[city],valid)
                if measured is None: continue
                for model,(_,temp) in candidates.items():
                    errors[city,horizon,model].append((valid,temp-measured))
    cities={}
    any_verified=False
    for city,wmo in WMO.items():
        horizons={}
        for horizon in HORIZONS:
            models={model:metric(errors[city,horizon,model]) for model in MODELS}
            eligible={name:val for name,val in models.items() if val["status"]=="verified"}
            best=min(eligible,key=lambda name:eligible[name]["mae_c"]) if len(eligible)==len(MODELS) else None
            if best: any_verified=True
            horizons[str(horizon)]={"models":models,"best_model":best}
        cities[city]={"station":stations.get(city,{"wmo_id":wmo,"status":"not_found"}),"horizons":horizons}
    return {"schema_version":1,"generated_at":datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "status":"verified" if any_verified else "insufficient_data",
            "snapshot_count":len(snapshots),"minimum_samples":20,"minimum_distinct_days":5,
            "observation_source":"NOAA NCEI GHCNh, temperature QC=1",
            "forecast_source":"Open-Meteo operational snapshots; captured_at != model initialized_at",
            "cities":cities}

def main():
    snapshots=[]
    for path in sorted((ROOT/"weather/archive").rglob("*.json.gz")):
        try:
            with gzip.open(path,"rt",encoding="utf-8") as file:
                snap=json.load(file)
            if isinstance(snap.get("entries"),list): snapshots.append(snap)
        except (OSError,ValueError,UnicodeError): pass
    stations={}; observations={}
    if snapshots:
        stations=station_crosswalk(get(BASE+"/doc/ghcnh-station-list.csv",5000000))
        years={dt(s["captured_at"]).year for s in snapshots if "captured_at" in s}
        for city,station in stations.items():
            values={}
            for year in sorted(years):
                url=f"{BASE}/access/by-year/{year}/psv/GHCNh_{station['ghcnh_id']}_{year}.psv"
                try: values.update(observations_from_psv(get(url)))
                except Exception as exc:
                    print(f"Observation data unavailable ({city}/{year}): {exc}",file=sys.stderr)
            if values:
                observations[city]=values
                station["status"]="observations_available"
                station["observation_count"]=len(values)
            else:
                station["status"]="no_quality_checked_observations"
    target=ROOT/"weather/data/accuracy.json"
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(build(snapshots,stations,observations),ensure_ascii=False,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    print(f"WeatherBench: {len(snapshots)} snapshots, {len(observations)} NOAA stations")
    return 0

if __name__=="__main__":
    sys.exit(main())
