# FraudGuard-AI Bias Remediation Report

## Masalah Utama Yang Diperbaiki

- Fitur leakage seperti `FraudScore_Probability_Seed` dan `RuleRiskScore` dibuang dari dataset training leak-free.
- Fitur hasil keputusan pasca-investigasi seperti `AnalystStatus` tidak boleh dipakai sebagai input model.
- Kolom split baru `Split_BiasAware` dibuat dengan distribusi target yang lebih terkontrol.
- Oversampling/augmentation hanya dibuat untuk subset train, bukan validation/test.

## Binary Fraud Dataset

- Rows: 2537
- Fraud count: 90
- Fraud rate: 3.5475%
- Leak-free feature count: 106

Distribusi `Split_BiasAware`:

```json
{
  "test": {
    "0": 367,
    "1": 14
  },
  "train": {
    "0": 1713,
    "1": 62
  },
  "validation": {
    "0": 367,
    "1": 14
  }
}
```

## Multiclass Fraud Type Dataset

- Rows: 2537
- Class count: 5
- Leak-free feature count: 106

Distribusi kelas:

```json
{
  "Legitimate": 2447,
  "Account Takeover (ATO)": 65,
  "Identity Theft": 17,
  "Phishing": 5,
  "Card Cloning": 3
}
```

Distribusi `Split_BiasAware`:

```json
{
  "test": {
    "Account Takeover (ATO)": 10,
    "Card Cloning": 1,
    "Identity Theft": 3,
    "Legitimate": 367,
    "Phishing": 1
  },
  "train": {
    "Account Takeover (ATO)": 45,
    "Card Cloning": 1,
    "Identity Theft": 11,
    "Legitimate": 1713,
    "Phishing": 3
  },
  "validation": {
    "Account Takeover (ATO)": 10,
    "Card Cloning": 1,
    "Identity Theft": 3,
    "Legitimate": 367,
    "Phishing": 1
  }
}
```

## Catatan Kritis

Split stratified membantu memastikan setiap kelas minoritas masuk ke test set, tetapi tidak menyelesaikan masalah jumlah sampel yang terlalu kecil.
Contoh: kalau `Card Cloning` hanya punya 3 sampel total, evaluasi test tetap sangat rapuh karena support maksimalnya hanya 1 sampel.
Solusi produksi tetap membutuhkan lebih banyak data historis atau data sintetis yang dibuat dengan skenario fraud yang lebih beragam.

## File Output

- `tabular_fraud_binary_bias_aware.csv`
- `fraud_type_multiclass_bias_aware.csv`
- `tabular_fraud_binary_leak_free.csv`
- `fraud_type_multiclass_leak_free.csv`
- `tabular_fraud_binary_train_augmented.csv`
- `fraud_type_multiclass_train_augmented.csv`
- `leakage_feature_policy.json`
- `bias_remediation_report.md`
