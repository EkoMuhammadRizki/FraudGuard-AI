# PROPOSAL SUBMISSION TAHAP 3 (FINAL SUBMISSION)
**ID Tim**: S0722  
**Nama Tim**: Amankan.ai FraudGuard  

---

## 1. Final Solution Title
> **Judul Solusi Terbaru**

**Amankan.ai FraudGuard: Platform Inteligensi & Pencegahan Fraud Transaksi Digital Real-Time Berbasis Mobile Behavioral Telemetry, Event Streaming Apache Kafka, Ensemble ML, GraphML, dan Regulatory Explainable AI.**

---

## 2. Classification & Problem Statement
- **Problem Statement**: Penguatan Ketahanan dan Inovasi Keuangan
- **Sub-Problem Statement**: Manajemen Risiko

---

## 3. Final Team Composition
> **Anggota Aktif Tim & Peran Utama**

1. **Muhammad Muhibin** *(Team Lead & Data Engineer)*  
   Mengarahkan visi produk, arsitektur data, integrasi live MongoDB Atlas Cloud, dan compliance regulasi.
2. **Muhammad Ihya Abdillah** *(Software Engineer & Data Engineer)*  
   Mengembangkan event streaming Apache Kafka, microservice backend, dan API Gateway.
3. **Eko Muhammad Rizki** *(Fullstack Developer)*  
   Mengembangkan Web Dashboard Risk Cockpit, visualisasi forensik Graph/SHAP interaktif, dan PDF compliance generator.
4. **Reza Asriano Maulana** *(Machine Learning Engineer)*  
   Merancang pipeline Multi-Model Ensemble (XGBoost, LightGBM, GraphML) serta fine-tuning GenAI Qwen 1.5B (LoRA Adapter).

*(Total Word Count: 80 / 100 kata)*

---

## 4. Final Solution Summary
> **Ringkasan Solusi Akhir**

Amankan.ai FraudGuard adalah platform pencegahan fraud end-to-end real-time berbasis client-side Mobile Telemetry SDK (<500KB) yang menangkap sinyal perilaku mikro (keystroke dynamics, device integrity, remote access AnyDesk), Event Streaming Apache Kafka Bus (<30ms latency), Ensemble Scoring Engine (XGBoost F1 81.48%, LightGBM, Random Forest, GraphML) yang dilatih pada 32 Juta Transaksi dataset benchmark IBM Transactions for Anti-Money Laundering (AML) Medium, 50.000 sampel data live MongoDB Atlas Cloud, serta Interactive Generative AI Chatbot Assistant & XAI berbasis Fine-Tuned Qwen 1.5B (LoRA) + SHAP. Chatbot ini menyajikan narasi otomatis dan jawaban konsultasi interaktif bagi analis berstandar regulasi perbankan Indonesia (UU PDP, POJK Anti-Fraud, APU-PPT, UU TPPU, & IASC).

*(Total Word Count: 104 / 150 kata)*

---

## 5. Progress and Change Log
> **Perkembangan & Perubahan Utama Sejak 2nd Submission**

Perubahan utama sejak 2nd submission:
1. **Interactive Generative AI Chatbot Assistant**: Mengintegrasikan chatbot interaktif berbasis Qwen 1.5B (LoRA) di Web Dashboard untuk membantu analis bertanya-jawab (interactive Q&A) mengenai rekomendasi hukum, investigasi kasus, dan draft pelaporan PPATK secara instan.
2. **Validasi Skala Masif (32 Juta Transaksi)**: Model Ensemble dilatih secara penuh menggunakan 32 Juta Transaksi dataset IBM AML Medium (F1 81.48%, PR-AUC 96.04%), disinkronkan dengan 50.000 sampel data live MongoDB Atlas Cloud.
3. **Event Streaming Apache Kafka Pipeline**: Menjadikan Apache Kafka sebagai event bus terdekoppel untuk menyalurkan telemetry stream real-time dengan throughput >10.000 TPS.
4. **Fine-Tuning Reguler GenAI**: Melatih ulang Qwen 1.5B (413 pasang ChatML) dengan 4 payung hukum nasional (UU PDP, POJK Anti-Fraud, APU-PPT, UU TPPU, UU ITE) & IASC.
5. **GraphML Topological Optimization**: Menggantikan Deep GNN yang berat dengan GraphML Topological Feature Extraction untuk latensi otorisasi sub-30ms.

*(Total Word Count: 138 / 150 kata)*

---

## 6. Validated User Problem and Evidence
> **Masalah Utama yang Diselesaikan & Bukti Nyata**

Penipuan transaksi digital pada mobile banking dan BI-FAST (seperti Account Takeover, Social Engineering/Phishing, Bot Attack, dan jaringan Money Mule) meningkat drastis. Berdasarkan data OJK dan laporan penipuan transaksi nasional, kerugian finansial akibat penipuan transaksi digital mencapai triliunan rupiah dengan tingkat pengembalian dana di bawah 5%.

Bukti nyata masalah perbankan saat ini:
1. **Blind Spot Sesi Mobile**: Solusi FDS konvensional hanya memproses data transaksi backend setelah dikirim, sehingga buta terhadap remote access software (AnyDesk/TeamViewer) dan skrip bot di perangkat nasabah sebelum transfer terjadi.
2. **Bottleneck Latensi & Konsensus**: Solusi berbasis Blockchain Consortium atau Deep GNN Heavy Retraining membutuhkan latensi >100ms hingga berdetik-detik, melanggar SLA BI-FAST/QRIS (<100ms) dan melanggar hak hapus data UU PDP No. 27/2022.
3. **Respon Reaktif Pasca-Insiden**: Solusi reaktif konvensional baru melakukan emergency freeze <30 detik setelah insiden terjadi—di mana dana sudah hilang dipindahkan penipu.
4. **Black-Box AI**: Tim fraud analyst kesulitan memberikan bukti hukum ke PPATK/OJK karena skor AI tidak disertai pasal regulasi.

Solusi kami divalidasi dengan melatih model pada 32 Juta Transaksi dari benchmark IBM AML Medium, disalurkan via Apache Kafka, menyajikan 50.000 data sampel live MongoDB Atlas Cloud, latensi skoring <30ms, serta menghadirkan Interactive GenAI Chatbot Assistant berpayung hukum nasional.

*(Total Word Count: 194 / 250 kata)*

---

## 7. End-to-End Use Case and Feature-to-Pain Mapping
> **Alur Penggunaan End-to-End & Pemetaan Fitur ke Masalah**

### Use Case End-to-End:
1. **Tahap Transaksi Nasabah**: Nasabah melakukan transfer via mobile banking. SDK ringan (<500KB) secara privacy-aware merekam telemetry perilaku mikro (keystroke dwell time, device integrity, remote access AnyDesk).
2. **Streaming & Ingress**: Payload dienkripsi JWT dan dikirim ke API Gateway, disalurkan via Apache Kafka Event Bus secara terdekoppel.
3. **Ensemble Scoring Sub-30ms**: Microservice FDS menjalankan skoring terpadu: XGBoost (anomali sinyal), LightGBM (klasifikasi jenis fraud), Random Forest (verifikasi), dan GraphML (indeks jaringan money mule). Transaksi dikategorikan: `APPROVE`, `HOLD`, atau `BLOCK`.
4. **Live Storage & Asynchronous XAI**: Data transaksi langsung tersimpan secara live di MongoDB Atlas Cloud (`fraud_detection.transactions`). Untuk transaksi berisiko tinggi, SHAP values memicu Gen AI Qwen 1.5B (LoRA Adapter) untuk menghasilkan narasi hukum Bahasa Indonesia.
5. **Action Analyst Cockpit & Interactive GenAI Chatbot**: Analis melihat feed real-time, peta GIS, visualisasi Graph Syndicate, dan berinteraksi secara langsung dengan Generative AI Chatbot (Qwen 1.5B) untuk konsultasi regulasi/kronologi kasus, lalu mengeksekusi penahanan atau membagikan bukti digital ke portal Indonesia Anti-Scam Centre (IASC).

### Feature-to-Pain Mapping:
- **Mobile Telemetry SDK** ➔ Mengatasi Blind Spot Remote Access & Bot Attack pada peranti nasabah.
- **Apache Kafka x Mongo Streaming** ➔ Mengatasi SLA Latensi BI-FAST <30ms.
- **GraphML Topological Analytics** ➔ Mengatasi Deteksi Sindikat Money Mule tanpa beban GPU berat.
- **Interactive Qwen 1.5B GenAI Chatbot & XAI** ➔ Mengatasi Masalah Black-Box AI & Mempercepat Konsultasi Regulasi/Audit Analis.

*(Total Word Count: 223 / 300 kata)*

---

## 8. Operational Context, Solution Boundary, and Adoption
> **Kondisi Operasional, Batas Penggunaan, & Skenario Adopsi**

- **Kondisi Operasional**: Amankan.ai FraudGuard beroperasi sebagai analytical & intelligence layer tambahan yang berdampingan dengan Core Banking Gateway, Payment Switch (BI-FAST/QRIS), dan aplikasi mobile banking tanpa menggantikan sistem transaksi utama.
- **Batas Penggunaan (Solution Boundary)**: Solusi ini fokus pada deteksi anomali perilaku sesi mobile, skoring risiko transaksi, dan analisis forensik hukum. Solusi tidak menyimpan dana nasabah atau mengeksekusi kliring akhir perbankan.
- **Skenario Adopsi**: Bank memasang SDK (<500KB) di aplikasi mobile dan mengintegrasikan REST API / Kafka consumer ke FDS Engine dalam waktu <2 minggu tanpa perlu mengubah arsitektur inti perbankan.

*(Total Word Count: 88 / 200 kata)*

---

## 9. Innovation Level
> **Tahap Perkembangan Solusi**

**Level 3** *(Functional Live Prototype)*

---

## 10. Current Technical Reality, Data, and Integration
> **Tingkat Kesiapan & Integrasi Teknis**

Solusi Amankan.ai FraudGuard saat ini berada pada **Level 3 (Functional Live Prototype)** yang terintegrasi secara end-to-end:
- **Pelatihan Model Skala Masif (32 Juta Transaksi)**: Model Ensemble (XGBoost, LightGBM, Random Forest, GraphML) dilatih langsung menggunakan 32 Juta Transaksi dari dataset benchmark dunia IBM Transactions for Anti-Money Laundering (AML) Medium.
- **Real-Time Event Streaming**: Apache Kafka Event Bus terintegrasi memproses transaction & telemetry stream dengan throughput >10.000 TPS.
- **Web Dashboard Live Cloud Data**: Web Dashboard menampilkan 50.000 sampel data transaksi terayaan live yang di-query dari MongoDB Atlas Cloud (`fraud_detection.transactions`), dilengkapi ID Transaksi 16-digit unik dan nomor rekening 16-digit berstandar ISO perbankan.
- **Model Metrics Teruji**: XGBoost Model pada test set mencapai F1-Score 81.48%, PR-AUC 96.04%, FPR 0.54%, dan Threshold Operasional 0.38. Multiclass LightGBM mencapai Macro F1 72.23%.
- **Interactive GenAI Chatbot Service**: API microservice berbasis FastAPI (`ai_service/app.py`) memuat model Qwen 1.5B Chat dengan LoRA Adapter yang di-fine-tune pada 413 pasang instruksi hukum (UU PDP, POJK Anti-Fraud, POJK APU-PPT, UU TPPU, UU ITE) untuk daya dukung chatbot interaktif & XAI.
- **Fullstack Web Dashboard**: Terhubung live menampilkan Operational Risk Cockpit, GIS Threat Map, Interactive Forensic Graph Explorer, Interactive GenAI Chatbot Window, dan Automated PDF Compliance Report.

*(Total Word Count: 194 / 300 kata)*

---

## 11. MVP Execution and Deployment Plan
> **Rencana Penggelaran MVP & Pilot (1–6 Bulan)**

- **Fase 1 (Bulan 1-2) — Sandbox & Shadow Pilot**: Menjalankan FDS Engine dalam Shadow Mode di lingkungan OJK Regulatory Sandbox bersama mitra Bank Umum Tier-2 dan Bank Pembangunan Daerah (BPD) untuk menguji throughput Kafka x MongoDB pada transaksi live shadow.
- **Fase 2 (Bulan 3-4) — SDK Integration & Beta Pilot**: Mengintegrasikan Mobile Telemetry SDK pada aplikasi mobile banking beta mitra untuk memvalidasi behavioral biometrics pada 100.000 pengguna aktif.
- **Fase 3 (Bulan 5-6) — Full Production & IASC Gateway**: Menghubungkan dashboard FDS secara penuh dengan API Gateway BI-FAST serta otomatisasi pelaporan bukti forensik ke portal Indonesia Anti-Scam Centre (IASC) OJK/BI.

*(Total Word Count: 109 / 250 kata)*

---

## 12. Problem and System Complexity
> **Kompleksitas Masalah & Sistem**

Masalah fraud digital tidak dapat diselesaikan dengan rule-based sederhana karena kejahatan modern bersifat dinamis: penipu menggunakan remote access software, skrip macro bot, serta jaringan money mule multi-hop yang memecah dana ke belasan rekening dalam hitungan detik (layering).

Kompleksitas sistem kami menangani hal ini melalui:
1. Pemrosesan sinyal perilaku mikro non-linear di mobile app,
2. Agregasi graph topology untuk melacak klaster rekening penampung pada dataset IBM AML 32 juta transaksi,
3. Arsitektur Apache Kafka event streaming menjaga latensi otorisasi sub-30ms pada ribuan TPS, dan
4. Penerjemahan matematis nilai SHAP menjadi narasi hukum Bahasa Indonesia serta penyediaan Interactive GenAI Chatbot Assistant berbasis Qwen 1.5B yang patuh UU PDP secara asynchronous.

*(Total Word Count: 108 / 200 kata)*

---

## 13. Processing Pipeline and Engineering Depth
> **Alur Pemrosesan & Kedalaman Rekayasa Teknis**

1. **Ingress & Telemetry**: Mobile SDK mengirimkan payload telemetry terenkripsi JWT ke API Ingress.
2. **Apache Kafka Event Streaming**: Apache Kafka menerima event pada topic `transaction-stream` dan `telemetry-behavioral` secara terdekoppel berkecepatan tinggi.
3. **Synchronous Ensemble Scoring**: Microservice FDS menarik data, mengeksekusi XGBoost (skor anomali teruji F1 81.48% dari 32 juta data IBM AML), LightGBM (klasifikasi fraud), Random Forest (verifikasi), dan GraphML (fitur topologi jaringan) dalam latensi <30ms untuk menghasilkan keputusan `APPROVE`/`HOLD`/`BLOCK`.
4. **Live MongoDB Ingestion**: Event transaksi disinkronisasikan secara live dengan 50.000 sampel dataset IBM AML di MongoDB Atlas Cloud untuk penayangan dashboard.
5. **Asynchronous GenAI XAI Pipeline & Interactive Chatbot**: Pada transaksi berisiko (`HOLD`/`BLOCK`), nilai SHAP dikirim ke Qwen 1.5B Chat (LoRA) untuk menghasilkan narasi kepatuhan regulasi, serta melayani sesi konsultasi tanya-jawab interaktif (Interactive Chatbot) bagi analis di Web Dashboard.

*(Total Word Count: 134 / 250 kata)*

---

## 14. Algorithm / Rule Quality and Decision Transparency
> **Kualitas Algoritma & Transparansi Keputusan (Explainable AI)**

Kualitas keputusan sistem dibangun di atas arsitektur multi-model dan Explainable AI (XAI) transparan:
- **Scoring Precision**: XGBoost yang dilatih langsung pada 32 Juta Transaksi dataset IBM AML Medium menghasilkan skor risiko binary dengan F1-Score 81.48% (mendekati 82%) dan FPR ultra-rendah (0.54%), meminimalkan false positive pada nasabah sah. LightGBM mengklasifikasikan jenis ancaman (ATO, Scam, Bot, Mule) dengan Macro F1 72.23%.
- **GraphML Intelligence**: Menggunakan ekstraksi fitur topologi graph (degree centrality, community detection) untuk mengidentifikasi sindikat rekening penampung secara cepat tanpa beban komputasi GNN.
- **Transparansi Keputusan (SHAP + Interactive GenAI Chatbot Qwen 1.5B)**: Nilai kontribusi fitur (SHAP values) diterjemahkan oleh Qwen 1.5B (LoRA Fine-Tuned) menjadi narasi eksplisit yang mengutip pasal regulasi resmi (UU PDP Pasal 25, POJK No. 39/2019, POJK APU-PPT No. 8/2023). Analis juga dapat melakukan tanya-jawab interaktif (interactive chatbot) dengan AI untuk menggali rekomendasi tindakan forensik. Hal ini mengeliminasi masalah Black-Box AI dan mempermudah audit hukum oleh OJK/PPATK.

*(Total Word Count: 149 / 300 kata)*

---

## 15. User Flow, Usability Testing, and Product Iteration
> **User Flow Analis & Hasil Pengujian**

### User Flow Analyst:
1. Analis membuka Web Dashboard Cockpit dan memantau Real-Time Transaction Feed serta GIS Threat Map.
2. Transaksi berisiko tinggi (`HOLD`/`FLAGGED`) secara otomatis masuk ke Manual Audit Queue.
3. Analis mengklik detail kasus untuk melihat Interactive Graph Syndicate Visualizer, SHAP Feature Waterfall Plot, dan narasi rekomendasi GenAI Qwen 1.5B.
4. Analis dapat membuka jendela Interactive GenAI Chatbot untuk mengajukan pertanyaan eksploratif mengenai pasal regulasi atau kronologi kasus.
5. Analis memilih eksekusi (Approve/Hold/Escalate) dan mengklik Generate PDF Audit Report untuk dikirim ke IASC/PPATK.

### Pengujian & Iterasi Produk:
Berdasarkan pengujian internal dan masukan simulasi operasional, kami melakukan iterasi:
1. Menyederhanakan visualisasi graph relasi agar mudah dipahami analis non-teknis,
2. Menambahkan jendela Interactive GenAI Chatbot berbasis Qwen 1.5B untuk mempercepat konsultasi regulasi,
3. Menambahkan tombol pembuatan laporan PDF otomatis 1-klik, dan
4. Mengoptimalkan respons API GenAI menjadi asynchronous out-of-band agar tidak mengganggu kecepatan feed.

*(Total Word Count: 143 / 250 kata)*

---

## 16. Team Capability and Execution Ownership
> **Komposisi & Tanggung Jawab Tim**

Komposisi tim Amankan.ai FraudGuard memiliki kapabilitas teknis yang lengkap dan pembagian tanggung jawab yang jelas:
- **Muhammad Muhibin** *(Team Lead & Data Engineer)*: Mengarahkan visi produk, merancang arsitektur pipeline data, integrasi live MongoDB Atlas Cloud, dan kepatuhan regulasi.
- **Muhammad Ihya Abdillah** *(Software Engineer & Data Engineer)*: Mengembangkan arsitektur event streaming Apache Kafka, microservice backend, dan integrasi API Gateway perbankan.
- **Eko Muhammad Rizki** *(Fullstack Developer)*: Mengembangkan Web Dashboard Risk Cockpit, visualisasi forensik interaktif (Graph & SHAP), antarmuka Generative AI Chatbot, serta generator laporan audit PDF.
- **Reza Asriano Maulana** *(ML Engineer)*: Merancang pipeline Multi-Model Ensemble (XGBoost, LightGBM, GraphML) serta fine-tuning GenAI Qwen 1.5B (LoRA Adapter) untuk XAI & Chatbot.

*(Total Word Count: 110 / 250 kata)*

---

## 17. Continuation Readiness
> **Kesiapan Keberlanjutan Solusi Pasca-Hackathon**

Tim siap melanjutkan pengembangan pasca-hackathon melalui kesiapan berikut:
1. **Kesiapan Prototipe**: Prototipe fungsional (Level 3) sudah berjalan penuh terhubung ke Apache Kafka & MongoDB Atlas Cloud dengan data teruji 32 juta transaksi IBM AML serta GenAI Chatbot interaktif dan siap diuji coba dalam skala terbatas.
2. **Rencana Lisensi & Sandbox**: Mengajukan pendaftaran ke OJK Regulatory Sandbox (Klaster RegTech/FDS) serta menjajaki kerja sama Pilot Partnership dengan Bank Pembangunan Daerah (BPD) dan Neobank.
3. **Komitmen Tim**: Tim berkomitmen penuh mendedikasikan waktu pengembangan untuk membawa prototipe ini menuju tahap Commercial Production MVP dalam kurun waktu 6 bulan.

*(Total Word Count: 94 / 200 kata)*

---

## 18. Quantified Value, Business Model, and ROI
> **Nilai Terukur, Model Bisnis, & Proyeksi ROI**

### Nilai Terukur (Quantified Value):
- Menekan kerugian finansial bank akibat fraud transaksi digital hingga 40-60%.
- Memangkas waktu investigasi analis risiko dari berjam-jam menjadi <2 menit via Interactive GenAI Chatbot Assistant & laporan PDF otomatis.
- Menjaga False Positive Rate di bawah 0.54%, mencegah potensi kerugian bisnis akibat pemblokiran nasabah sah.

### Model Bisnis & Skema Pendapatan:
1. **B2B API Licensing (SaaS/On-Premise)**: Skema berbasis volume transaksi (*pay-per-api-call*) untuk Bank Umum, BPD, Neobank, dan Fintech.
2. **SDK Enterprise Subscription**: Lisensi tahunan pemeliharaan & pembaruan Mobile Behavioral Telemetry SDK.
3. **Compliance & Audit Module Add-On**: Biaya lisensi tambahan untuk modul GenAI Chatbot & laporan otomatis IASC/PPATK.

### Estimasi ROI:
Bagi institusi bank dengan 1 juta transaksi harian, penghematan kerugian fraud dan efisiensi operasional analis memberikan estimasi **Return on Investment (ROI) positif dalam kurun waktu <8 bulan**.

*(Total Word Count: 132 / 300 kata)*

---

## 19. Adoption, Growth Strategy, and Competitive Moat
> **Strategi Pertumbuhan & Keunggulan Kompetitif Utama**

### Strategi Adopsi & Pertumbuhan:
- **Top-Down Regulatory Alignment**: Bermitra dengan Bank Indonesia dan OJK untuk menjadikan Amankan.ai FraudGuard sebagai penyedia FDS terstandar yang terhubung langsung dengan Indonesia Anti-Scam Centre (IASC).
- **Low-Friction Integration**: Menawarkan SDK ringan (<500KB) dan REST API yang dapat terpasang di core banking dalam <2 minggu tanpa mengubah infrastruktur utama.

### Competitive Moat (Keunggulan Kompetitif Utama):
1. **Pencegahan Pre-Transaction Mobile**: Platform ini menyuntikkan Mobile Behavioral Telemetry SDK (<500KB) untuk menyumbat fraud (remote access AnyDesk, bot, & keystroke anomaly) di perangkat nasabah sebelum transaksi terjadi, tidak seperti FDS tradisional yang reaktif.
2. **Arsitektur Pragmatis Sub-30ms & Patuh UU PDP**: Memadukan Apache Kafka + Live MongoDB + GraphML yang terbukti ultra-cepat (<30ms), hemat komputasi, dan 100% patuh UU PDP No. 27/2022 tanpa beban konsensus blockchain yang lambat.
3. **Pencegahan Preventif Real-Time**: Menghentikan transaksi berbahaya secara presisi sebelum dana berpindah (<30ms).
4. **Interactive Regulatory GenAI Chatbot**: Generasi narasi & Chatbot Interaktif berbasis Qwen 1.5B (LoRA) yang otomatis mencantumkan pasal UU PDP, POJK Anti-Fraud, APU-PPT, dan UU ITE, memberikan daya tahan audit hukum dan kemudahan eksplorasi kasus bagi analis yang tidak dimiliki oleh AI black-box tradisional.
