# FraudGuard Mobile SDK — Panduan Integrasi Cepat

> **Bank Indonesia — Divisi Sistem Pembayaran & Keamanan Digital**  
> Versi SDK: 2.4.1 | Tanggal Rilis: 21 Juli 2026

---

## 1. Arsitektur Sistem

```
                                    ┌─────────────────────────────────┐
                                    │     BANK INDONESIA              │
                                    │     FraudGuard FDS Engine       │
                                    │                                 │
                                    │  ┌──────────┐  ┌────────────┐  │
                                    │  │ XGBoost  │  │ LightGBM   │  │
                                    │  │ Binary   │  │ Multiclass │  │
                                    │  └────┬─────┘  └─────┬──────┘  │
                                    │       │              │         │
                                    │  ┌────▼──────────────▼──────┐  │
                                    │  │   Meta-Learner Stacker   │  │
                                    │  │   (Ensemble Decision)    │  │
                                    │  └────┬──────────────┬──────┘  │
                                    │       │   Graph GNN  │         │
                                    │       │   Analysis   │         │
                                    │  ┌────▼──────────────▼──────┐  │
                                    │  │   APPROVED / BLOCKED     │  │
                                    │  └──────────────────────────┘  │
                                    └──────────────▲─────────────────┘
                                                   │ REST API
                                                   │ /api/v1/predict
                                    ┌──────────────┴─────────────────┐
                                    │     CORE BANKING GATEWAY       │
                                    │     (Bank Mandiri/BRI/BNI/BTN) │
                                    └──────────────▲─────────────────┘
                                                   │ JWT Token
                                                   │ X-FraudGuard-Token
                                    ┌──────────────┴─────────────────┐
                                    │     MOBILE BANKING APP         │
                                    │     (FraudGuard SDK Embedded)  │
                                    │                                │
                                    │  ✓ Keystroke Dynamics          │
                                    │  ✓ Device Integrity Check     │
                                    │  ✓ Remote Access Detection    │
                                    │  ✓ Gyroscope & Touch Sensor   │
                                    └────────────────────────────────┘
```

## 2. Data yang Dikumpulkan SDK

SDK mengumpulkan **HANYA** data behavioral non-sensitif berikut:

| Data Point | Deskripsi | Contoh |
|-----------|-----------|--------|
| **Dwell Time** | Durasi penekanan tombol (key down → key up) | 95 ms |
| **Flight Time** | Jeda antar penekanan tombol (key up → next key down) | 120 ms |
| **Hesitation Score** | Tingkat keraguan pengguna (variasi flight time) | 8% |
| **Typing Consistency** | Konsistensi ritme mengetik (variasi dwell time) | 92% |
| **Device Integrity** | Status root/jailbreak, USB debugging | `rooted: false` |
| **Remote Access** | Deteksi AnyDesk/TeamViewer/screen sharing | `active: false` |
| **User Agent** | Browser dan platform (tanpa fingerprinting) | `Chrome (Android)` |
| **IP Address** | Alamat IP perangkat saat transaksi | `103.176.x.x` |

> **Penting**: SDK **TIDAK** membaca isi input field (nomor rekening, nominal, PIN), kontak, SMS, foto, atau data pribadi lainnya. Semua karakter keystroke di-mask menjadi `•`.

## 3. Integrasi Android (Kotlin)

### 3.1 Instalasi

```kotlin
// build.gradle (Module: app)
dependencies {
    implementation("id.go.bi.fraudguard:sdk-android:2.4.1")
}
```

### 3.2 Inisialisasi

```kotlin
// Application.kt atau Activity utama
import id.go.bi.fraudguard.FraudGuardSDK

class MyBankingApp : Application() {
    override fun onCreate() {
        super.onCreate()
        FraudGuardSDK.initialize(
            context = this,
            apiKey = "BI-MANDIRI-88391",  // API Key dari Bank Indonesia
            bankCode = "MANDIRI"
        )
    }
}
```

### 3.3 Evaluasi Transaksi

```kotlin
// TransferActivity.kt
class TransferActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        FraudGuardSDK.startTelemetry()
    }

    private fun onTransferClicked() {
        val result = FraudGuardSDK.evaluateTransaction(
            TransactionPayload(
                senderAccount = "80010E6F0",
                receiverAccount = "84DCA3150",
                amountPaid = 25_000_000.0,
                paymentFormat = "BI-FAST"
            )
        )

        when (result.finalDecision) {
            "APPROVED" -> proceedToOTP()
            "BLOCKED"  -> showBlockedDialog(result.fraudType)
        }
    }
}
```

## 4. Integrasi iOS (Swift)

### 4.1 Instalasi

```ruby
# Podfile
pod 'FraudGuardBI', '~> 2.4.1'
```

### 4.2 Inisialisasi & Penggunaan

```swift
import FraudGuardBI

class TransferViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        FraudGuardSDK.initialize(apiKey: "BI-BRI-77204", bankCode: "BRI")
        FraudGuardSDK.startTelemetry()
    }

    @IBAction func transferTapped(_ sender: UIButton) {
        let payload = TransactionPayload(
            senderAccount: senderField.text ?? "",
            receiverAccount: receiverField.text ?? "",
            amountPaid: Double(amountField.text ?? "0") ?? 0,
            paymentFormat: "BI-FAST"
        )

        FraudGuardSDK.evaluateTransaction(payload) { result in
            if result.finalDecision == .blocked {
                self.showAlert("Diblokir", message: result.fraudType)
            } else {
                self.proceedToOTP()
            }
        }
    }
}
```

## 5. API Endpoint

### POST `/api/v1/predict`

**Request Body:**

```json
{
    "timestamp": "2026-07-21T22:00:00.000Z",
    "sender_account": "80010E6F0",
    "receiver_account": "84DCA3150",
    "amount_paid": 25000000,
    "amount_received": 25000000,
    "payment_format": "BI-FAST",
    "currency": "IDR",
    "sender_bank": "Bank Mandiri",
    "receiver_bank": "Bank BRI",
    "sender_account_age_days": 730,
    "is_new_receiver_for_sender": 0,
    "daily_tx_count": 2,
    "sender_degree": 4,
    "receiver_indegree": 3
}
```

**Response Body:**

```json
{
    "transaction_id": "TXN-A1B2C3D4",
    "timestamp": "2026-07-21T22:00:01.123Z",
    "final_decision": "APPROVED",
    "is_fraud": false,
    "risk_score": 3.8,
    "threshold_used": 33.7,
    "fraud_type": "Legitimate",
    "model_scores": {
        "xgboost": 2.1,
        "lightgbm_max": 3.2,
        "lightgbm_fraud_sum": 1.8,
        "graph_gnn": 4.5,
        "ensemble_final": 3.8
    },
    "processing_time_ms": 12.45
}
```

## 6. Threshold & Sensitivitas

| Parameter | Nilai Default | Deskripsi |
|-----------|:------------:|-----------|
| **Risk Threshold** | 33.7% | Skor di atas nilai ini = `BLOCKED` |
| **Dwell Anomaly** | < 10ms | Indikasi bot/emulator |
| **Flight Anomaly** | < 5ms | Indikasi automated input |
| **Hesitation Alert** | > 60% | Indikasi social engineering |
| **Consistency Alert** | > 98% | Indikasi bot (terlalu konsisten) |

## 7. Kontak & Dukungan

- **Portal Developer**: https://developer.bi.go.id/fraudguard
- **Email Teknis**: fraudguard-sdk@bi.go.id
- **SLA Respon**: 1×24 jam (hari kerja)
