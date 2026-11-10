"""Regression tests for NOAA measurements and forecast time alignment."""
import importlib.util
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "bench.py"
spec = importlib.util.spec_from_file_location("weather_bench", SCRIPT)
bench = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = bench
spec.loader.exec_module(bench)
UTC = timezone.utc
NOW = datetime(2026, 10, 1, tzinfo=UTC)

class WeatherBenchTests(unittest.TestCase):
    def test_no_station_substitution(self):
        rows=("GHCN_ID,LATITUDE,LONGITUDE,WMO_ID,NAME\n"
              "RSM00034730,47.263,39.812,34730,Rostov\n"
              "RSM00028033,0,0,28033,Incorrect\n")
        found=bench.station_crosswalk(rows)
        self.assertIn("rostov",found)
        self.assertNotIn("karpinsk",found)

    def test_quality_flags_and_units(self):
        rows=("Year|Month|Day|Hour|Minute|temperature|temperature_Quality_Code\n"
              "2026|10|01|00|20|2.4|1\n"
              "2026|10|01|01|00|40|3\n"
              "2026|10|01|02|00|999|1\n")
        readings=bench.observations_from_psv(rows)
        self.assertEqual(len(readings),1)
        self.assertEqual(bench.nearest_reading(readings,NOW),2.4)
        self.assertIsNone(bench.nearest_reading(readings,NOW+timedelta(hours=2)))

    def test_no_future_leakage(self):
        forecast={"time":[(NOW-timedelta(hours=1)).isoformat()],"temperature_2m":[5]}
        self.assertIsNone(bench.prediction(forecast,NOW,24))

    def test_common_valid_time_and_all_models(self):
        valid=NOW+timedelta(hours=24)
        entries=[{"provider":model,"city":"rostov","forecast":{"time":[valid.isoformat()],"temperature_2m":[12]}}
                 for model in bench.MODELS]
        snap={"captured_at":NOW.isoformat(),"entries":entries}
        stations={"rostov":{"status":"matched","name":"Rostov","wmo_id":"34730"}}
        observations={"rostov":{valid:10}}
        output=bench.build([snap],stations,observations)
        self.assertEqual(output["cities"]["rostov"]["horizons"]["24"]["models"]["ecmwf_default"]["samples"],1)
        self.assertIsNone(output["cities"]["rostov"]["horizons"]["24"]["best_model"])
        output2=bench.build([{"captured_at":NOW.isoformat(),"entries":entries[:-1]}],stations,observations)
        self.assertEqual(output2["cities"]["rostov"]["horizons"]["24"]["models"]["ecmwf_default"]["samples"],0)

    def test_statistics_gate(self):
        self.assertEqual(bench.metric([(NOW,2)]*2)["status"],"insufficient_samples")
        rows=[(NOW+timedelta(days=i//4),(-1)**i*2) for i in range(20)]
        result=bench.metric(rows)
        self.assertEqual(result["mae_c"],2)
        self.assertEqual(result["bias_c"],0)
        self.assertEqual(result["rmse_c"],2)

if __name__=="__main__":
    unittest.main()
