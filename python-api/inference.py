# -*- coding: utf-8 -*-
import os
import json
import pickle
import math
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Optional

# --- Global Model State ---
xgb_model = None
lgb_model = None
graph_model = None
meta_learner = None
meta_config = None
dataset_meta = None
sdk_behavioral_model = None

# Track mana model yang berhasil di-load
_model_status: dict = {
    "xgboost": False,
    "lightgbm": False,
    "graph_ml": False,
    "meta_learner": False,
    "sdk_behavioral": False,
}

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")


# --- Model Loading ---
def load_models():
    global xgb_model, lgb_model, graph_model, meta_learner, meta_config, dataset_meta, sdk_behavioral_model, _model_status

    print("[FraudGuard] Loading model metadata...")
    with open(os.path.join(MODELS_DIR, "dataset_metadata.json"), "r") as f:
        dataset_meta = json.load(f)

    with open(os.path.join(MODELS_DIR, "ensemble_config.json"), "r") as f:
        meta_config = json.load(f)

    # XGBoost
    print("[FraudGuard] Loading XGBoost binary pipeline...")
    try:
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            with open(os.path.join(MODELS_DIR, "fraud_binary_ibm_pipeline.pkl"), "rb") as f:
                xgb_model = pickle.load(f)
        _model_status["xgboost"] = True
        print("[FraudGuard] OK XGBoost loaded")
    except Exception as e:
        print(f"[FraudGuard] FAIL XGBoost: {e}")

    # LightGBM (mungkin diblokir oleh Windows App Control)
    print("[FraudGuard] Loading LightGBM multiclass model...")
    try:
        with open(os.path.join(MODELS_DIR, "fraud_multiclass_lgb.pkl"), "rb") as f:
            lgb_model = pickle.load(f)
        _model_status["lightgbm"] = True
        print("[FraudGuard] OK LightGBM loaded")
    except Exception as e:
        print(f"[FraudGuard] FAIL LightGBM blocked: {type(e).__name__}")
        print("[FraudGuard]   -> LightGBM will use interpolation from XGBoost score")

    # Graph ML / GNN
    print("[FraudGuard] Loading Graph ML (GNN) classifier...")
    try:
        with open(os.path.join(MODELS_DIR, "graph_aml_ibm_classifier.pkl"), "rb") as f:
            graph_model = pickle.load(f)
        _model_status["graph_ml"] = True
        print("[FraudGuard] OK Graph ML loaded")
    except Exception as e:
        print(f"[FraudGuard] FAIL Graph ML: {type(e).__name__}")

    # Meta-Learner
    print("[FraudGuard] Loading Meta-Learner (Ensemble stacker)...")
    try:
        with open(os.path.join(MODELS_DIR, "meta_learner_ibm.pkl"), "rb") as f:
            meta_learner = pickle.load(f)
        _model_status["meta_learner"] = True
        print("[FraudGuard] OK Meta-Learner loaded")
    except Exception as e:
        print(f"[FraudGuard] FAIL Meta-Learner: {type(e).__name__}")

    # Behavioral SDK Model (LightGBM tuned by teammate)
    print("[FraudGuard] Loading Behavioral SDK Model (Mobile Telemetry)...")
    try:
        with open(os.path.join(MODELS_DIR, "sdk_behavioral_model.pkl"), "rb") as f:
            sdk_behavioral_model = pickle.load(f)
        _model_status["sdk_behavioral"] = True
        print("[FraudGuard] OK Behavioral SDK Model loaded")
    except Exception as e:
        print(f"[FraudGuard] FAIL Behavioral SDK Model: {type(e).__name__}")

    loaded_count = sum(_model_status.values())
    print(f"[FraudGuard] {loaded_count}/5 models loaded!")
    if _model_status["xgboost"]:
        print(f"[FraudGuard]   Ensemble threshold: {meta_config['threshold']:.4f}")
        print(f"[FraudGuard]   F1-Score: {meta_config['f1_score']:.4f}")


def is_loaded() -> bool:
    return xgb_model is not None


def get_model_info() -> dict:
    if not is_loaded():
        return {"loaded": False}
    return {
        "loaded": True,
        "threshold": meta_config.get("threshold", 0.5),
        "f1_score": meta_config.get("f1_score", 0.0),
        "models_used": meta_config.get("models_used", []),
        "fraud_types": dataset_meta.get("fraud_types", {}),
        "feature_count": len(dataset_meta.get("feature_cols", [])),
        "model_status": _model_status,
    }


# --- Feature Engineering ---
# Mapping kategorikal -> integer encoding (sesuai training data IBM AML)
PAYMENT_FORMAT_MAP = {
    "SWIFT": 0, "ACH": 1, "Cheque": 2, "Credit Card": 3, "Wire": 4,
    "Bitcoin": 5, "Reinvestment": 6, "Crypto": 7,
}
BANK_MAP = {
    "BNI": 0, "BCA": 1, "Mandiri": 2, "BRI": 3, "CIMB": 4,
    "Danamon": 5, "Permata": 6, "BTN": 7, "Maybank": 8, "HSBC": 9,
    "Standard Chartered": 10, "Deutsche Bank": 11, "Bank of America": 12,
    "Chase": 13, "Wells Fargo": 14, "Unknown": 15,
}
CURRENCY_MAP = {
    "IDR": 0, "USD": 1, "EUR": 2, "GBP": 3, "SGD": 4,
    "MYR": 5, "JPY": 6, "AUD": 7, "CNY": 8,
}


def _encode(mapping: dict, value, default: int = 0) -> int:
    """Safely encode a categorical value. Handles None."""
    if value is None:
        return default
    return mapping.get(str(value), default)


def _val(tx: dict, key: str, default):
    """
    Safely get a value from tx dict.
    Handles case where Pydantic sends None for Optional fields
    instead of omitting the key entirely.
    """
    v = tx.get(key)
    return default if v is None else v


def build_feature_vector(tx: dict) -> pd.DataFrame:
    """
    Membangun feature vector 44-dimensi dari dict transaksi input.
    Semua fitur yang tidak tersedia diinisialisasi ke nilai default representatif.
    """
    amount_paid = float(_val(tx, "amount_paid", 0.0))
    _amount_received_raw = _val(tx, "amount_received", None)
    amount_received = float(_amount_received_raw) if _amount_received_raw is not None else amount_paid

    # Timestamp parsing
    try:
        ts_raw = _val(tx, "timestamp", None)
        ts = datetime.fromisoformat(ts_raw) if ts_raw else datetime.now()
    except Exception:
        ts = datetime.now()

    hour_of_day = ts.hour
    is_weekend = int(ts.weekday() >= 5)
    is_night = int(hour_of_day < 6 or hour_of_day >= 22)
    is_month_end = int(ts.day >= 28)

    # Amount features
    amount_ratio = (amount_received / amount_paid) if amount_paid > 0 else 1.0
    amount_log = math.log1p(amount_paid)
    amount_diff = amount_paid - amount_received

    # Categorical encoding
    payment_format_enc = _encode(PAYMENT_FORMAT_MAP, _val(tx, "payment_format", "Wire"))
    sender_bank_enc = _encode(BANK_MAP, _val(tx, "sender_bank", "Unknown"))
    receiver_bank_enc = _encode(BANK_MAP, _val(tx, "receiver_bank", "Unknown"))
    payment_currency_enc = _encode(CURRENCY_MAP, _val(tx, "currency", "IDR"))
    receiving_currency_enc = _encode(CURRENCY_MAP, _val(tx, "receiving_currency", _val(tx, "currency", "IDR")))

    # Velocity & Temporal features
    time_since_last_tx = float(_val(tx, "time_since_last_tx", 3600.0))   # default: 1 jam
    is_rapid_tx = int(time_since_last_tx < 60)
    daily_tx_count = float(_val(tx, "daily_tx_count", 2.0))
    time_since_last_rx = float(_val(tx, "time_since_last_rx", 7200.0))

    # Sender profile features
    sender_tx_rank = float(_val(tx, "sender_tx_rank", 500.0))
    sender_total_tx = float(_val(tx, "sender_total_tx", 50.0))
    sender_mean_amount = float(_val(tx, "sender_mean_amount", amount_paid * 0.8 or 1_000_000.0))
    sender_std_amount = float(_val(tx, "sender_std_amount", sender_mean_amount * 0.3))
    sender_max_amount = float(_val(tx, "sender_max_amount", sender_mean_amount * 3.0))

    # Receiver profile features
    receiver_total_tx = float(_val(tx, "receiver_total_tx", 30.0))
    receiver_mean_amount = float(_val(tx, "receiver_mean_amount", amount_received * 0.9 or 800_000.0))
    receiver_std_amount = float(_val(tx, "receiver_std_amount", receiver_mean_amount * 0.4))
    receiver_max_amount = float(_val(tx, "receiver_max_amount", receiver_mean_amount * 2.5))

    # Statistical anomaly features
    amount_zscore = (
        (amount_paid - sender_mean_amount) / (sender_std_amount + 1e-9)
        if sender_std_amount > 0 else 0.0
    )
    amount_vs_sender_mean = amount_paid / (sender_mean_amount + 1e-9)
    amount_vs_receiver_mean = amount_received / (receiver_mean_amount + 1e-9)
    is_round_amount = int(amount_paid % 100_000 == 0 and amount_paid >= 1_000_000)
    amount_change_from_last = float(_val(tx, "amount_change_from_last", 0.0))
    amount_change_pct = float(_val(tx, "amount_change_pct", 0.0))

    # Account & relationship features
    sender_account_age_days = float(_val(tx, "sender_account_age_days", 365.0))
    is_new_receiver_for_sender = int(_val(tx, "is_new_receiver_for_sender", 1))
    pair_tx_count = float(_val(tx, "pair_tx_count", 1.0))

    # Graph / Network features (GNN signals)
    sender_degree = float(_val(tx, "sender_degree", 5.0))
    receiver_indegree = float(_val(tx, "receiver_indegree", 3.0))
    fan_out_ratio = float(_val(tx, "fan_out_ratio", 0.2))
    fan_in_ratio = float(_val(tx, "fan_in_ratio", 0.1))
    is_high_fan_out = int(fan_out_ratio > 0.5)
    is_high_fan_in = int(fan_in_ratio > 0.5)
    hub_to_hub_transfer = int(sender_degree > 20 and receiver_indegree > 20)

    # Assemble feature vector sesuai urutan dataset_metadata.json
    row = {
        "amount_received": amount_received,
        "amount_paid": amount_paid,
        "hour_of_day": hour_of_day,
        "is_weekend": is_weekend,
        "is_night": is_night,
        "amount_ratio": amount_ratio,
        "amount_log": amount_log,
        "amount_diff": amount_diff,
        "payment_format_enc": payment_format_enc,
        "sender_bank_enc": sender_bank_enc,
        "receiver_bank_enc": receiver_bank_enc,
        "payment_currency_enc": payment_currency_enc,
        "receiving_currency_enc": receiving_currency_enc,
        "time_since_last_tx": time_since_last_tx,
        "is_rapid_tx": is_rapid_tx,
        "daily_tx_count": daily_tx_count,
        "time_since_last_rx": time_since_last_rx,
        "sender_tx_rank": sender_tx_rank,
        "sender_total_tx": sender_total_tx,
        "sender_mean_amount": sender_mean_amount,
        "sender_std_amount": sender_std_amount,
        "sender_max_amount": sender_max_amount,
        "receiver_total_tx": receiver_total_tx,
        "receiver_mean_amount": receiver_mean_amount,
        "receiver_std_amount": receiver_std_amount,
        "receiver_max_amount": receiver_max_amount,
        "amount_zscore": amount_zscore,
        "amount_vs_sender_mean": amount_vs_sender_mean,
        "amount_vs_receiver_mean": amount_vs_receiver_mean,
        "is_round_amount": is_round_amount,
        "amount_change_from_last": amount_change_from_last,
        "amount_change_pct": amount_change_pct,
        "is_month_end": is_month_end,
        "sender_account_age_days": sender_account_age_days,
        "is_new_receiver_for_sender": is_new_receiver_for_sender,
        "pair_tx_count": pair_tx_count,
        "sender_degree": sender_degree,
        "receiver_indegree": receiver_indegree,
        "fan_out_ratio": fan_out_ratio,
        "fan_in_ratio": fan_in_ratio,
        "is_high_fan_out": is_high_fan_out,
        "is_high_fan_in": is_high_fan_in,
        "hub_to_hub_transfer": hub_to_hub_transfer,
    }

    feature_cols = dataset_meta["feature_cols"]
    return pd.DataFrame([{col: row.get(col, 0.0) for col in feature_cols}])


# --- Behavioral ML Prediction (SDK Model) ---
def predict_behavior(behavior_data: dict) -> dict:
    """
    Prediksi behavioral bot / anomaly dari Mobile SDK menggunakan sdk_behavioral_model.pkl
    """
    if sdk_behavioral_model is None:
        return {"is_bot": False, "bot_score": 0.0}

    features = [
        'dwell_avg', 'flight_avg', 'traj_avg',
        'cpm', 'error_rate', 'touch_pressure',
        'tilt_axis_x', 'tilt_axis_y', 'scroll_y'
    ]

    X_array = np.array([[float(behavior_data.get(f, 0.0)) for f in features]])

    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        bot_proba = float(sdk_behavioral_model.predict_proba(X_array)[:, 1][0])

    threshold = float(meta_config.get("threshold", 0.3374)) if meta_config else 0.3374
    is_bot = bool(bot_proba >= threshold)

    return {
        "is_bot": is_bot,
        "bot_score": round(bot_proba * 100, 2)
    }


# --- Prediction ---
def predict_transaction(tx_dict: dict) -> dict:
    """
    Ensemble inference dengan graceful fallback:
    - LightGBM/Graph ML -> interpolasi dari XGBoost jika diblokir App Control
    - Meta-Learner -> weighted average jika tidak tersedia
    - Behavioral SDK Model -> evaluasi telemetri biometrik mobile SDK
    """
    if not is_loaded():
        raise RuntimeError("Models not loaded. Call load_models() first.")

    X_df = build_feature_vector(tx_dict)

    # 1. XGBoost (Binary) -- selalu ada
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        xgb_proba_arr = xgb_model.predict_proba(X_df)[:, 1]
    xgb_proba = float(xgb_proba_arr[0])

    # 2. LightGBM (Multiclass) -- fallback ke XGBoost jika diblokir
    lgb_proba_max = xgb_proba
    lgb_proba_fraud_sum = xgb_proba
    predicted_fraud_type = "Unknown"

    if lgb_model is not None:
        lgb_preds = lgb_model.predict_proba(X_df)
        lgb_proba_max = float(np.max(lgb_preds, axis=1)[0])
        try:
            legit_idx = list(lgb_model.classes_).index("Legitimate")
        except (ValueError, AttributeError):
            legit_idx = 0
        lgb_proba_fraud_sum = float(1.0 - lgb_preds[0, legit_idx])
        predicted_class_idx = int(np.argmax(lgb_preds[0]))
        try:
            FRAUD_TYPES = {0: "Legitimate", 1: "Account Takeover", 2: "Money Mule", 3: "Aggregation Fraud", 4: "Identity Theft"}
            class_val = lgb_model.classes_[predicted_class_idx]
            if isinstance(class_val, (int, np.integer)):
                predicted_fraud_type = FRAUD_TYPES.get(int(class_val), f"Fraud Type {class_val}")
            else:
                predicted_fraud_type = str(class_val)
        except Exception:
            predicted_fraud_type = "Unknown"
    else:
        # Interpolasi nama fraud type dari XGBoost score
        if xgb_proba > 0.7:
            predicted_fraud_type = "Account Takeover"
        elif xgb_proba > 0.5:
            predicted_fraud_type = "Aggregation Fraud"
        else:
            predicted_fraud_type = "Legitimate"

    # 3. Graph ML / GNN -- fallback ke interpolasi
    graph_proba = xgb_proba * 0.85 + lgb_proba_fraud_sum * 0.15

    if graph_model is not None:
        graph_feature_keywords = [
            "sender_degree", "fan_out", "amount_ratio", "amount_zscore",
            "receiver_indegree", "fan_in", "hub_to_hub"
        ]
        graph_cols = [c for c in X_df.columns
                      if any(kw in c for kw in graph_feature_keywords)]
        X_graph = X_df[graph_cols] if graph_cols else X_df.iloc[:, :5]
        try:
            graph_proba = float(graph_model.predict_proba(X_graph)[:, 1][0])
        except Exception:
            pass  # keep interpolated fallback

    # 4. Behavioral SDK Model Evaluator
    behavioral_score = 0.0
    is_bot = False
    if "behavioral_data" in tx_dict and tx_dict["behavioral_data"]:
        b_res = predict_behavior(tx_dict["behavioral_data"])
        behavioral_score = b_res["bot_score"]
        is_bot = b_res["is_bot"]

    # 5. Final Ensemble
    threshold = float(meta_config.get("threshold", 0.5))

    if meta_learner is not None:
        meta_features = np.column_stack([
            [xgb_proba],
            [lgb_proba_max],
            [lgb_proba_fraud_sum],
            [graph_proba],
        ])
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            final_proba = float(meta_learner.predict_proba(meta_features)[:, 1][0])
    else:
        # Weighted average fallback dari ensemble_config weights
        weights = meta_config.get("weights", {})
        w_xgb = abs(weights.get("XGBoost", 9.77))
        w_lgb_max = abs(weights.get("LightGBM (Max)", 5.11))
        w_lgb_sum = abs(weights.get("LightGBM (Fraud Sum)", 4.16))
        w_graph = abs(weights.get("Graph ML", 2.74))
        total_w = w_xgb + w_lgb_max + w_lgb_sum + w_graph
        final_proba = (
            w_xgb * xgb_proba +
            w_lgb_max * lgb_proba_max +
            w_lgb_sum * lgb_proba_fraud_sum +
            w_graph * graph_proba
        ) / total_w

    # Fuse behavioral bot score into final ensemble decision if behavioral anomaly detected
    if is_bot or behavioral_score > 33.7:
        final_proba = max(final_proba, behavioral_score / 100.0)
        if predicted_fraud_type == "Legitimate":
            predicted_fraud_type = "Behavioral Telemetry Anomaly (Bot/Remote Access)"

    is_fraud = bool(final_proba >= threshold)

    fraud_type_label = (
        predicted_fraud_type if is_fraud and predicted_fraud_type != "Legitimate"
        else "Legitimate"
    )

    return {
        "is_fraud": is_fraud,
        "risk_score": round(final_proba * 100, 2),
        "threshold_used": round(threshold * 100, 2),
        "fraud_type": fraud_type_label,
        "model_scores": {
            "xgboost": round(xgb_proba * 100, 2),
            "lightgbm_max": round(lgb_proba_max * 100, 2),
            "lightgbm_fraud_sum": round(lgb_proba_fraud_sum * 100, 2),
            "graph_gnn": round(graph_proba * 100, 2),
            "sdk_behavioral": round(behavioral_score, 2),
            "ensemble_final": round(final_proba * 100, 2),
        },
        "models_active": _model_status,
    }

