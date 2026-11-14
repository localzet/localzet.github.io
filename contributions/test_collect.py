import unittest
from collect import review_status, reply_signal, ci_status

class TestStatuses(unittest.TestCase):
    def test_review(self):
        self.assertEqual(review_status([{"user":{"login":"a"},"state":"CHANGES_REQUESTED"}]), "changes")
        self.assertEqual(review_status(None), "unknown")
    def test_reply(self):
        self.assertTrue(reply_signal([{"user":{"login":"other"},"created_at":"2026-01-01"}]))
        self.assertIsNone(reply_signal(None))
        self.assertFalse(reply_signal([{"user":{"login":"bot[bot]"},"created_at":"2026-01-01"}]))
    def test_ci(self):
        checks = [{"id":1,"name":"test","status":"completed","conclusion":"failure"},
                  {"id":2,"name":"test","status":"completed","conclusion":"success"}]
        self.assertEqual(ci_status(checks, {"total_count":0}), "passed")
        self.assertEqual(ci_status(None, {}), "unknown")
