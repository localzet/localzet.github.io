#!/usr/bin/env python3
"""Record forecast snapshots for later operational backtesting.

The timestamp captured_at means a forecast was already available when fetched.
The API does not necessarily expose the NWP model's exact issued_at.
"""

import gzip
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

CITIES = {
    "rostov": (47.2357, 39.7015),
    "ekaterinburg": (56.8389, 60.6057),
    "severouralsk": (60.1533, 59.9524),
    "karpinsk": (59.7624, 60.0025),
    "krasnoturyinsk": (59.7666, 60.2086),
}

PROVIDERS = {
    "ecmwf_default": "https://api.open-meteo.com/v1/ecmwf",
    "gfs_default": "https://api.open-meteo.com/v1/gfs",
    "icon_default": "https://api.open-meteo.com/v1/dwd-icon",
}


def make_url(endpoint, lat, lon):
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "temperature_2m,precipitation",
        "forecast_days": 5,
        "timezone": "UTC",
    }
    return endpoint + "?" + urlencode(params)


def fetch_json(url, retries=2):
    last_error = None
    for attempt in range(retries + 1):
        try:
            request = Request(url, headers={
                "Accept": "application/json",
                "User-Agent": "localzet-weather-research/0.1",
            })
            with urlopen(request, timeout=22) as response:
                if int(response.headers.get("Content-Length", "0") or 0) > 400_000:
                    raise ValueError("Unexpectedly large response")
                body = response.read(400_001)
                if len(body) > 400_000:
                    raise ValueError("Forecast response too large")
            data = json.loads(body)
            hourly = data.get("hourly", {})
            fields = ("time", "temperature_2m", "precipitation")
            if data.get("error") or not all(key in hourly for key in fields):
                raise ValueError("Invalid forecast response")
            count = len(hourly["time"])
            if count < 24 or any(len(hourly[key]) != count for key in fields):
                raise ValueError("Inconsistent hourly forecast")
            return {
                "time": hourly["time"],
                "temperature_2m": hourly["temperature_2m"],
                "precipitation": hourly["precipitation"],
                "units": data.get("hourly_units", {}),
                "grid_lat": data.get("latitude"),
                "grid_lon": data.get("longitude"),
                "grid_elevation_m": data.get("elevation"),
            }
        except (HTTPError, URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
            last_error = exc
            if attempt < retries:
                time.sleep(2 * (attempt + 1))
    raise RuntimeError(str(last_error))


def collect(now=None):
    now = now or datetime.now(timezone.utc)
    result = {
        "schema_version": 1,
        "captured_at": now.isoformat(timespec="seconds"),
        "description": "Operational snapshots; model initialization is not verified",
        "entries": [],
        "errors": [],
    }
    for provider, endpoint in PROVIDERS.items():
        for city, (lat, lon) in CITIES.items():
            try:
                forecast = fetch_json(make_url(endpoint, lat, lon))
                result["entries"].append({
                    "provider": provider, "city": city, "forecast": forecast
                })
            except RuntimeError as exc:
                result["errors"].append({
                    "provider": provider, "city": city, "message": str(exc)[:240]
                })
    return result


def save(snapshot, root):
    captured = datetime.fromisoformat(snapshot["captured_at"])
    path = root / "weather/archive" / captured.strftime("%Y/%m/%d/%H.json.gz")
    path.parent.mkdir(parents=True, exist_ok=True)
    body = json.dumps(snapshot, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    with path.open("wb") as destination:
        with gzip.GzipFile(fileobj=destination, mode="wb", mtime=0, filename="") as writer:
            writer.write(body)
    return path


def main():
    snapshot = collect()
    if not snapshot["entries"]:
        print("No forecasts received; skipping empty archive", file=sys.stderr)
        return 1
    path = save(snapshot, Path.cwd())
    print(f"Stored {len(snapshot['entries'])} forecasts and {len(snapshot['errors'])} errors at {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
