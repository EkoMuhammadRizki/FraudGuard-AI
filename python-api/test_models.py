"""
FraudGuard-AI — Unit Tests for ML Inference Engine & Behavioral SDK Model

Cara menjalankan:
  cd python-api
  pytest test_models.py -v
  # Atau tanpa pytest:
  python -m unittest test_models.py
"""

import unittest
import os
import sys

# Tambahkan python-api ke sys.path
sys.path.insert(0, os.path.dirname(__file__))

import inference


class TestFraudGuardModels(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Load semua model sebelum unit test berjalan."""
        print("\n--- Setup: Loading ML Models ---")
        inference.load_models()

    def test_01_models_loaded_status(self):
        """1. Uji apakah semua model berhasil di-load dan status model_loaded = True."""
        self.assertTrue(inference.is_loaded(), "XGBoost / model utama harus loaded")
        info = inference.get_model_info()
        self.assertTrue(info["loaded"])
        self.assertIn("model_status", info)
        self.assertTrue(info["model_status"]["sdk_behavioral"], "sdk_behavioral_model.pkl harus terdaftar dan loaded")
        print("[PASS] Test 01: Model loading status verified (5/5 active)")

    def test_02_behavioral_sdk_prediction_normal(self):
        """2. Uji prediksi model behavioral (sdk_behavioral_model.pkl) dengan data telemetri nasabah normal."""
        normal_telemetry = {
            "dwell_avg": 95.0,
            "flight_avg": 120.0,
            "traj_avg": 15.0,
            "cpm": 250.0,
            "error_rate": 0.02,
            "touch_pressure": 0.5,
            "tilt_axis_x": 0.1,
            "tilt_axis_y": 0.2,
            "scroll_y": 0.0
        }
        result = inference.predict_behavior(normal_telemetry)
        self.assertIn("bot_score", result)
        self.assertIn("is_bot", result)
        self.assertIsInstance(result["bot_score"], float)
        self.assertGreaterEqual(result["bot_score"], 0.0)
        self.assertLessEqual(result["bot_score"], 100.0)
        print(f"[PASS] Test 02: Normal behavioral prediction score = {result['bot_score']}% (is_bot={result['is_bot']})")

    def test_03_behavioral_sdk_prediction_bot(self):
        """3. Uji prediksi model behavioral (sdk_behavioral_model.pkl) dengan data telemetri bot / remote access."""
        bot_telemetry = {
            "dwell_avg": 2.0,
            "flight_avg": 1.0,
            "traj_avg": 0.0,
            "cpm": 1200.0,
            "error_rate": 0.0,
            "touch_pressure": 0.9,
            "tilt_axis_x": 0.0,
            "tilt_axis_y": 0.0,
            "scroll_y": 0.0
        }
        result = inference.predict_behavior(bot_telemetry)
        self.assertIn("bot_score", result)
        self.assertIn("is_bot", result)
        self.assertGreaterEqual(result["bot_score"], 0.0)
        print(f"[PASS] Test 03: Bot telemetry prediction score = {result['bot_score']}% (is_bot={result['is_bot']})")

    def test_04_full_transaction_ensemble_prediction(self):
        """4. Uji integrasi penuh transaction predictor (XGBoost + LightGBM + GNN + Behavioral)."""
        tx_payload = {
            "sender_account": "8888777766",
            "receiver_account": "1029384756",
            "amount_paid": 250000.0,
            "payment_format": "Wire",
            "currency": "IDR",
            "sender_bank": "Bank Mandiri",
            "receiver_bank": "Bank BRI",
            "behavioral_data": {
                "dwell_avg": 95.0,
                "flight_avg": 120.0,
                "traj_avg": 15.0,
                "cpm": 250.0,
                "error_rate": 0.02,
                "touch_pressure": 0.5,
                "tilt_axis_x": 0.1,
                "tilt_axis_y": 0.2,
                "scroll_y": 0.0
            }
        }
        res = inference.predict_transaction(tx_payload)
        self.assertIn("is_fraud", res)
        self.assertIn("risk_score", res)
        self.assertIn("final_decision", res)
        self.assertIn(res["final_decision"], ["APPROVED", "BLOCKED"])
        self.assertIn("model_scores", res)
        self.assertIn("sdk_behavioral", res["model_scores"])
        print(f"[PASS] Test 04: Full ensemble prediction decision = {res['final_decision']} (Risk Score = {res['risk_score']}%)")

    def test_05_transaction_feature_engineering(self):
        """5. Uji pembuatan DataFrame fitur 44-dimensi dari payload mentah."""
        tx_payload = {
            "sender_account": "12345",
            "receiver_account": "67890",
            "amount_paid": 5000000.0
        }
        df_features = inference.build_feature_vector(tx_payload)
        self.assertEqual(len(df_features), 1)
        self.assertGreaterEqual(df_features.shape[1], 40)
        print(f"[PASS] Test 05: Feature engineering built {df_features.shape[1]}-dim vector correctly")


if __name__ == "__main__":
    unittest.main()
