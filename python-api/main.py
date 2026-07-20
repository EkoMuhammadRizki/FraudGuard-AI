"""
FraudGuard-AI — Python ML Inference Server
FastAPI + Uvicorn

Cara menjalankan:
  cd python-api
  pip install -r requirements.txt
  uvicorn main:app --reload --host 0.0.0.0 --port 8000

Swagger UI: http://localhost:8000/docs
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import datetime
import traceback
import inference

# ─── App Initialization ───────────────────────────────────────────────────────
app = FastAPI(
    title="FraudGuard-AI Inference API",
    description="Real-time fraud detection using XGBoost + LightGBM + GNN ensemble",
    version="2.0.0",
)

# CORS — izinkan Next.js dev server (localhost:3000) mengakses API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response Schemas ───────────────────────────────────────────────
class TransactionRequest(BaseModel):
    timestamp: str = Field(
        default_factory=lambda: datetime.datetime.now().isoformat(),
        description="ISO 8601 timestamp transaksi"
    )
    sender_account: str = Field(..., description="Nomor rekening pengirim")
    receiver_account: str = Field(..., description="Nomor rekening penerima")
    amount_paid: float = Field(..., gt=0, description="Nominal yang didebet dari pengirim (IDR)")
    amount_received: Optional[float] = Field(None, description="Nominal yang diterima (default = amount_paid)")
    payment_format: str = Field(default="Wire", description="Format pembayaran (Wire, ACH, SWIFT, dll.)")
    currency: str = Field(default="IDR", description="Mata uang pengirim")
    receiving_currency: Optional[str] = Field(None, description="Mata uang penerima")
    sender_bank: str = Field(default="Unknown", description="Bank pengirim")
    receiver_bank: str = Field(default="Unknown", description="Bank penerima")

    # Optional enriched fields — jika tidak diberikan, akan diisi default
    time_since_last_tx: Optional[float] = Field(None, description="Detik sejak transaksi terakhir pengirim")
    daily_tx_count: Optional[float] = Field(None, description="Jumlah transaksi hari ini")
    sender_account_age_days: Optional[float] = Field(None, description="Umur akun pengirim dalam hari")
    is_new_receiver_for_sender: Optional[int] = Field(None, description="1 jika pengirim belum pernah kirim ke penerima ini")
    sender_degree: Optional[float] = Field(None, description="Jumlah koneksi unik pengirim (graph degree)")
    receiver_indegree: Optional[float] = Field(None, description="Jumlah pengirim unik ke penerima (graph indegree)")


class PredictionResponse(BaseModel):
    transaction_id: str
    timestamp: str
    final_decision: str          # "BLOCKED" | "APPROVED"
    is_fraud: bool
    risk_score: float             # 0-100
    threshold_used: float         # 0-100
    fraud_type: str
    model_scores: dict            # breakdown per model
    processing_time_ms: float


# ─── Startup: Load Models ─────────────────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    print("[FraudGuard] Starting ML Inference Server v2.0...")
    try:
        inference.load_models()
    except Exception as e:
        print(f"[FraudGuard] ✗ CRITICAL: Failed to load models: {e}")
        traceback.print_exc()


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    """Cek status server dan apakah model sudah dimuat."""
    model_info = inference.get_model_info()
    return {
        "status": "ok" if model_info["loaded"] else "degraded",
        "model_loaded": model_info["loaded"],
        "server": "FraudGuard-AI Inference API v2.0",
        "timestamp": datetime.datetime.now().isoformat(),
        **({k: v for k, v in model_info.items() if k != "loaded"} if model_info["loaded"] else {}),
    }


# ─── Main Predict Endpoint ────────────────────────────────────────────────────
@app.post("/api/v1/predict", response_model=PredictionResponse)
async def predict_fraud(tx: TransactionRequest):
    """
    Endpoint utama deteksi fraud.
    
    Menjalankan full ensemble inference:
    - XGBoost binary classifier (pipeline)
    - LightGBM multiclass (Account Takeover, Money Mule, Aggregation Fraud, Identity Theft)
    - Graph ML / GNN proxy classifier
    - Meta-Learner ensemble stacker
    
    Returns keputusan final BLOCKED/APPROVED beserta breakdown score per model.
    """
    if not inference.is_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model belum dimuat. Tunggu beberapa saat dan coba lagi."
        )

    import time
    start_time = time.time()

    try:
        tx_dict = tx.dict()

        # Isi amount_received jika tidak diberikan
        if tx_dict.get("amount_received") is None:
            tx_dict["amount_received"] = tx_dict["amount_paid"]

        # Isi receiving_currency jika tidak diberikan
        if tx_dict.get("receiving_currency") is None:
            tx_dict["receiving_currency"] = tx_dict["currency"]

        # Jalankan ensemble prediction
        result = inference.predict_transaction(tx_dict)

        processing_ms = round((time.time() - start_time) * 1000, 2)

        # Generate transaction ID
        import hashlib
        tx_id_raw = f"{tx.sender_account}-{tx.receiver_account}-{tx.amount_paid}-{tx.timestamp}"
        tx_id = "TXN-" + hashlib.md5(tx_id_raw.encode()).hexdigest()[:8].upper()

        return PredictionResponse(
            transaction_id=tx_id,
            timestamp=datetime.datetime.now().isoformat(),
            final_decision="BLOCKED" if result["is_fraud"] else "APPROVED",
            is_fraud=result["is_fraud"],
            risk_score=result["risk_score"],
            threshold_used=result["threshold_used"],
            fraud_type=result["fraud_type"],
            model_scores=result["model_scores"],
            processing_time_ms=processing_ms,
        )

    except Exception as e:
        print(f"[FraudGuard] Prediction error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


# ─── Model Info Endpoint ──────────────────────────────────────────────────────
@app.get("/api/v1/model-info")
def get_model_info():
    """Mengembalikan informasi tentang model yang sedang aktif."""
    info = inference.get_model_info()
    if not info["loaded"]:
        raise HTTPException(status_code=503, detail="Model belum dimuat")
    return info


# ─── Run directly ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
