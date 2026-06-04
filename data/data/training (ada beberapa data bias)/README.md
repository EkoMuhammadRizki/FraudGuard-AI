# FraudGuard-AI Training Data Pack

Folder ini berisi dataset turunan dari `fraudguard_enriched_dataset.csv` untuk training beberapa jenis model.

## File Utama

- `training_manifest.json`: metadata, ukuran file, split, dan rekomendasi model.
- `fraudguard_enriched_clean.csv`: dataset enriched yang sudah dinormalisasi.
- `tabular_fraud_binary_training.csv`: untuk binary classifier dengan target `IsFraud`.
- `fraud_type_multiclass_training.csv`: untuk multiclass classifier dengan target `FraudClassTarget`.
- `anomaly_detection_training.csv`: untuk anomaly detection.
- `gnn_edges.csv`: edge list untuk model graph/GNN.
- `gnn_nodes.csv`: node feature table untuk graph/GNN.
- `geo_threat_training.csv`: agregasi wilayah untuk peta ancaman Indonesia.
- `case_management_feedback_seed.csv`: seed data case management dan feedback loop.
- `xai_shap_explanation_seed.csv`: seed explanation untuk dashboard XAI sebelum real SHAP tersedia.

## Rekomendasi Urutan Training

1. Binary fraud classifier dari `tabular_fraud_binary_training.csv`.
2. Fraud type classifier dari `fraud_type_multiclass_training.csv`.
3. Anomaly detector dari `anomaly_detection_training.csv`.
4. Graph baseline atau GNN dari `gnn_edges.csv` + `gnn_nodes.csv`.
5. Geo risk scoring dari `geo_threat_training.csv`.

Gunakan kolom `Split` yang sudah tersedia untuk train, validation, dan test.

