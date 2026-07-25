# 🛡️ FraudGuard-AI (Amankan Fraud AI)

> **Next-Gen Financial Fraud Detection System (FDS) Engine**  
> *Sistem Deteksi Fraud Real-Time Bertenaga Multi-Model Machine Learning Ensemble, Graph Neural Network (GNN), & Mobile Biometric Telemetry.*

---

## 📌 Masalah yang Di-solve (Problem Statement)

Industri perbankan digital dan fintech di Indonesia menghadapi lonjakan serangan siber finansial yang semakin kompleks:

1. **Social Engineering & Remote Desktop Malware**: Pengambilalihan perangkat nasabah melalui aplikasi unduhan (APK bodong kurir/undangan) dan kontrol jarak jauh seperti **AnyDesk** atau **TeamViewer**.
2. **Account Takeover (ATO)**: Peretasan akun yang ditandai dengan pergantian PIN/Password secara mendadak lalu diikuti transfer dana nominal besar dalam hitungan detik.
3. **Sindikat Rekening Penampung (Money Mule Ring)**: Pencucian uang jaringan melalui pecahan transaksi kecil berulang ke puluhan rekening keledai.
4. **FDS Tradisional Berbasis Aturan (Rule-Based FDS)**: Memiliki *False Positive Rate (FPR)* sangat tinggi sehingga sering membekukan transaksi nasabah sah dan menurunkan reputasi perbankan.
5. **Masalah Black-Box AI**: Model machine learning konvensional sulit dijelaskan alur keputusannya, sehingga menyulitkan kebutuhan audit regulasi **POJK No. 39/POJK.03/2019** dan **UU PDP**.

---

## 🎯 Tujuan Dibuatnya Produk (Product Objective)

**FraudGuard-AI** hadir untuk memberikan solusi proteksi siber perbankan tanpa celah:

* **Pencegahan Pre-Transaction**: Menghentikan indikasi kejahatan di perangkat ponsel nasabah sebelum transaksi terkirim (*sub-30ms latency*) via **Mobile Telemetry SDK**.
* **Presisi Skoring Tinggi**: Menurunkan False Positive Rate hingga **0.54%** dengan akurasi F1-Score **81.48%** menggunakan **Multi-Model Ensemble Engine (XGBoost, LightGBM, GNN)**.
* **Transparansi & Explainable AI (XAI)**: Menyajikan nilai atribut kontributor risiko menggunakan **SHAP & LIME** untuk akuntabilitas audit hukum.
* **Compliance Regulasi 1-Klik**: Menghasilkan Laporan Audit PDF resmi berstandar **OJK, Bank Indonesia, PPATK, dan UU PDP**.

---

## ⚡ Fitur Utama Platform

| Fitur Utama | Deskripsi & Keunggulan |
| :--- | :--- |
| **📊 Ringkasan Dasbor Real-Time** | Monitoring kesehatan operasional server, grafik tren ancaman 24 jam, akurasi model ML, & live alert feed. |
| **🔎 Ruang Investigasi & XAI** | Forensik mendalam indikator risiko (ATO, Mule Ring), grafik topologi GNN, & *Action Engine* pembekuan rekening. |
| **⚡ Streaming Transaksi Live** | Audit arus data transaksi finansial real-time berbasis **Apache Kafka & MongoDB Atlas Cloud** (&gt;10.000 TPS). |
| **🧪 Sandbox Simulasi Transaksi** | Pengujian skenario fraud kustom (ATO, Money Mule, AnyDesk) untuk menguji sensitivitas pipeline AI. |
| **📱 Mobile SDK Telemetry** | Pengujian telemetri biometrik perilaku (*dwell time, flight time, touch pressure, tilt*) & deteksi AnyDesk. |
| **📄 Laporan Audit PDF 1-Klik** | Ekspor laporan audit resmi yang compliant dengan **POJK No. 39/2019** & **UU Perlindungan Data Pribadi**. |
| **🤖 REMI AI Chatbot Assistant** | Asisten AI melayang berbasis Multi-Model (**Gemini 3.6 Flash / 2.5 Pro** & **Groq Llama 3.3 70B**) untuk konsultasi 24/7. |

---

## 🚀 Cara Penggunaan & Panduan Memulai (Getting Started)

### 1. Prasyarat Sistem
* **Node.js**: v18.0 atau lebih baru
* **Python**: v3.10 atau v3.14
* **Database**: MongoDB Atlas Cloud (Otomatis terhubung via fallback seed)

### 2. Instalasi & Jalankan Server Next.js Frontend
```bash
# Clone repository
git clone https://github.com/EkoMuhammadRizki/FraudGuard-AI.git
cd FraudGuard-AI

# Install dependencies Node.js
npm install

# Jalankan server Next.js (Development Mode)
npm run dev
```
Aplikasi Web dapat diakses di browser pada URL: `http://localhost:3000`

### 3. Jalankan Python ML Inference Server
```bash
# Buka terminal baru dan masuk ke direktori python-api
cd python-api

# Install dependencies Python
pip install -r requirements.txt

# Jalankan server FastAPI Uvicorn
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```
Swagger UI Dokumentasi API Python dapat diakses di: `http://localhost:8000/docs`

---

## 🔑 Akun Pintas Demo (Credentials)

Untuk pengujian login cepat di halaman `http://localhost:3000/login`, Anda dapat mengklik tombol pintas atau memasukkan kredensial berikut:

| Username | Password | Role |
| :--- | :--- | :--- |
| **eko** | `eko123` | Lead Developer |
| **juri** | `juri123` | Dewan Juri FDS Evaluator |
| **ihya** | `ihya123` | FDS Analyst |
| **ibin** | `ibin123` | Security Specialist |
| **reza** | `reza123` | ML Engineer |

---

## 📁 Struktur Direktori Project

```
FraudGuard-AI/
├── python-api/                # FastAPI ML Inference Server (XGBoost, LightGBM, GNN)
├── src/
│   ├── app/                   # Next.js App Router (Dasbor, Login, Simulasi, Panduan)
│   ├── komponen/              # Reusable UI Components (Sidebar, REMI AI, Modal)
│   └── pustaka/               # Database Connection & Utility Libraries
├── sdk/                       # Mobile Telemetry SDK (React Native / Android / iOS)
├── public/                    # Assets, Logos, and Media
├── .env.local                 # Local Environment Configurations
└── README.md                  # Dokumentasi Utama Repository
```

---

## 📜 Kepatuhan Regulasi (Compliance)

Sistem ini dirancang khusus memenuhi regulasi keamanan finansial Indonesia:
* **POJK No. 39/POJK.03/2019**: Penerapan Strategi Anti Fraud Bagi Bank Umum.
* **UU No. 27 Tahun 2022**: Perlindungan Data Pribadi (UU PDP).
* **Standar IASC & PPATK**: Pelaporan Transaksi Keuangan Mencurigakan (TKM).

---

© 2026 **FraudGuard-AI Team**. All Rights Reserved.
