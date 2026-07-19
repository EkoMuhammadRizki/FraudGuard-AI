import os
import json
import pickle
import numpy as np
import pandas as pd

# Global variables untuk model
xgb_model = None
lgb_model = None
graph_model = None
meta_learner = None
meta_config = None
dataset_meta = None
sdk_behavioral_model = None  # NEW: Behavioral model

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

def load_models():
    global xgb_model, lgb_model, graph_model, meta_learner, meta_config, dataset_meta, sdk_behavioral_model
    
    # 1. Load Metadata & Config
    with open(os.path.join(MODELS_DIR, 'dataset_metadata.json'), 'r') as f:
        dataset_meta = json.load(f)
    
    with open(os.path.join(MODELS_DIR, 'ensemble_config.json'), 'r') as f:
        meta_config = json.load(f)
        
    # 2. Load Transactional Models (IBM AML)
    with open(os.path.join(MODELS_DIR, 'fraud_binary_ibm_pipeline.pkl'), 'rb') as f:
        xgb_model = pickle.load(f)
        
    with open(os.path.join(MODELS_DIR, 'fraud_multiclass_lgb.pkl'), 'rb') as f:
        lgb_model = pickle.load(f)
        
    with open(os.path.join(MODELS_DIR, 'graph_aml_ibm_classifier.pkl'), 'rb') as f:
        graph_model = pickle.load(f)
        
    with open(os.path.join(MODELS_DIR, 'meta_learner_ibm.pkl'), 'rb') as f:
        meta_learner = pickle.load(f)
        
    # 3. Load Behavioral Model (Mobile SDK)
    try:
        with open(os.path.join(MODELS_DIR, 'sdk_behavioral_model.pkl'), 'rb') as f:
            sdk_behavioral_model = pickle.load(f)
    except FileNotFoundError:
        print("Warning: sdk_behavioral_model.pkl belum ada. Fitur behavioral akan di-bypass.")

def is_loaded():
    return xgb_model is not None

# ==========================================
# 1. TRANSACTIONAL PIPELINE (IBM AML)
# ==========================================
def compute_features(tx_dict: dict) -> pd.DataFrame:
    feature_cols = dataset_meta['feature_cols']
    row_data = np.zeros(len(feature_cols))
    df_features = pd.DataFrame([row_data], columns=feature_cols)
    return df_features

def predict_transaction(tx_dict: dict) -> dict:
    if not is_loaded():
        raise Exception("Models not loaded yet!")
        
    X_df = compute_features(tx_dict)
    
    xgb_proba = xgb_model.predict_proba(X_df)[:, 1]
    lgb_preds = lgb_model.predict_proba(X_df)
    lgb_proba_max = np.max(lgb_preds, axis=1)
    
    try:
        legit_idx = list(lgb_model.classes_).index('Legitimate')
    except ValueError:
        legit_idx = 0
        
    lgb_proba_fraud_sum = 1.0 - lgb_preds[:, legit_idx]
    
    graph_cols = [c for c in X_df.columns if any(kw in c for kw in [
        'sender_degree', 'fan_out', 'amount_ratio', 'amount_zscore'
    ])]
    X_graph = X_df[graph_cols]
    
    try:
        graph_proba = graph_model.predict_proba(X_graph)[:, 1]
    except Exception:
        graph_proba = np.array([0.0])
    
    meta_features = np.column_stack([
        xgb_proba,
        lgb_proba_max,
        lgb_proba_fraud_sum,
        graph_proba
    ])
    
    final_proba = meta_learner.predict_proba(meta_features)[:, 1][0]
    threshold = meta_config.get('threshold', 0.5)
    is_fraud = bool(final_proba >= threshold)
    
    return {
        "is_fraud": is_fraud,
        "risk_score": round(final_proba * 100, 2)
    }

# ==========================================
# 2. BEHAVIORAL PIPELINE (BOT DETECTION)
# ==========================================
def predict_behavior(behavior_data: dict) -> dict:
    """
    Hanya dijalankan di RAM. Datanya tidak pernah disimpan ke DB.
    """
    if sdk_behavioral_model is None:
        return {"is_bot": False, "bot_score": 0.0}
        
    # Fitur harus sama urutannya dengan saat training di notebook 04
    features = [
        'dwell_avg', 'flight_avg', 'traj_avg', 
        'cpm', 'error_rate', 'touch_pressure', 
        'tilt_axis_x', 'tilt_axis_y', 'scroll_y'
    ]
    
    X_array = np.array([[behavior_data.get(f, 0.0) for f in features]])
    
    # Prediksi menggunakan LightGBM
    bot_proba = sdk_behavioral_model.predict_proba(X_array)[:, 1][0]
    
    # Threshold deteksi bot (misal > 75%)
    is_bot = bool(bot_proba > 0.75)
    
    return {
        "is_bot": is_bot,
        "bot_score": round(bot_proba * 100, 2)
    }
