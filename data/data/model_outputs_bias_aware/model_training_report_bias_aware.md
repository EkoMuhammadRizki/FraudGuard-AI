# Laporan Resmi Pelatihan Model FraudGuard-AI (Bias Remediation)

Dokumen ini merangkum metrik performa model setelah dilakukannya perbaikan bias dan pembersihan fitur leakage.

## 1. Performa Model Klasifikasi Biner (XGBoost vs RF)
Model biner dilatih menggunakan data bebas bias dengan threshold terbaik 0.38.

### XGBoost (Model Utama):
- **Test Accuracy**: 0.9869
- **Test Precision**: 0.8462
- **Test Recall**: 0.7857
- **Test F1-Score**: 0.8148
- **Test ROC-AUC**: 0.9984
- **Test PR-AUC**: 0.9604
- **False Positive Rate**: 0.0054

### Random Forest (Baseline):
- **Test Accuracy**: 0.9764
- **Test Precision**: 0.7778
- **Test Recall**: 0.5000
- **Test F1-Score**: 0.6087

## 2. Performa Klasifikasi Multiclass Modus Fraud (LightGBM)
- **Test Macro F1-Score**: 0.7223
- **Test Weighted F1-Score**: 0.9908

## 3. Performa Deteksi Anomali (Isolation Forest)
- **Test Recall**: 0.7143
- **Test F1-Score**: 0.4082
- **Test ROC-AUC**: 0.9478

## 4. Performa Deteksi Money Mule (Graph Analytics)
- **Test Accuracy**: 0.8766
- **Test ROC-AUC**: 0.7211
- **Test F1-Score**: 0.2564

## 5. Fitur Terpenting Bebas Leakage (Feature Importances)
1. **Location_Jayapura** (0.1071)
2. **ThreatIntelFlagInt** (0.0788)
3. **Location_Bekasi** (0.0634)
4. **TransactionAmount** (0.0596)
5. **TransactionHour** (0.0590)

## Interpretasi Metrik Penting:
Penurunan nilai metrik dari 1.00 ke tingkat yang lebih wajar membuktikan bahwa model lama mengandung bias data leakage yang berat. Performa model baru ini memberikan gambaran yang lebih objektif dan siap diuji coba.
