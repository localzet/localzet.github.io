"""Historical benchmark must intersect all model hours before scoring."""
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/"scripts"))
import historical

class HistoricalTests(unittest.TestCase):
    def test_common_valid_times_and_winner(self):
        start=datetime(2026,5,1,tzinfo=timezone.utc)
        times=[start+timedelta(hours=6*i) for i in range(120)]
        obs={t:10 for t in times}
        preds={model:{day:{t:10+error for t in times} for day in historical.LEADS}
               for model,error in [("ecmwf_default",1),("gfs_default",2),("icon_default",3)]}
        result=historical.calculate(obs,preds)
        self.assertEqual(result["24"]["best_model"],"ecmwf_default")
        self.assertEqual(result["24"]["models"]["ecmwf_default"]["mae_c"],1)
        del preds["gfs_default"][1][times[0]]
        result=historical.calculate(obs,preds)
        self.assertEqual(result["24"]["models"]["ecmwf_default"]["samples"],119)

    def test_incomplete_provider_set_is_not_ranked(self):
        start=datetime(2026,5,1,tzinfo=timezone.utc)
        forecast={"ecmwf_default":{day:{start:12} for day in historical.LEADS}}
        result=historical.calculate({start:11},forecast)
        self.assertIsNone(result["24"]["best_model"])
        self.assertEqual(result["24"]["models"]["ecmwf_default"]["samples"],0)

if __name__=="__main__":
    unittest.main()
