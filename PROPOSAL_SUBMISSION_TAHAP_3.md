# PROPOSAL SUBMISSION TAHAP 3 — FINAL ENTERPRISE GOLD EDITION
**ID Tim**: S0722 | **Nama Tim**: Amankan.ai FraudGuard

---

## 1. Final Solution Title

**Amankan.ai FraudGuard: Platform Inteligensi & Pencegahan Fraud Transaksi Digital Real-Time Berbasis Mobile Behavioral Telemetry SDK, Event Streaming Apache Kafka Bus, Multi-Model Ensemble ML, GraphML, dan REMI AI Multi-Model Orchestration Assistant.**

---

## 2. Classification
- **Problem Statement**: Penguatan Ketahanan dan Inovasi Keuangan
- **Sub-Problem Statement**: Manajemen Risiko

---

## 3. Final Team Composition

1. **Muhammad Muhibin** *(Team Lead & Data Engineer)* — Visi produk, arsitektur pipeline data, integrasi live MongoDB Atlas Cloud, dan kepatuhan regulasi.
2. **Muhammad Ihya Abdillah** *(Software Engineer & Data Engineer)* — Arsitektur Apache Kafka, microservice backend terdekoppel, dan Ingress API Gateway.
3. **Eko Muhammad Rizki** *(Fullstack Developer)* — Risk Cockpit Dashboard enterprise, visualisasi forensik GraphML & SHAP interaktif, dan widget REMI AI Assistant.
4. **Reza Asriano Maulana** *(Machine Learning Engineer)* — Multi-Model Ensemble pipeline dan fine-tuning REMI AI Engine (Qwen 1.5B LoRA, Groq Llama 3.3 70B, Gemini 2.5 Pro / Flash).

---

## 4. Final Solution Summary
*(Maks. 100 kata)*

Amankan.ai FraudGuard adalah platform pencegahan fraud perbankan real-time skala enterprise dengan empat pilar: (1) **Mobile Behavioral Telemetry SDK** (<500KB) yang menangkap biometrik mikro nasabah dan mendeteksi remote access AnyDesk secara pre-transaction; (2) **Apache Kafka Event Bus** berthroughput >10.000 TPS (<30ms); (3) **Multi-Model Ensemble Engine** (XGBoost F1 81.48%, LightGBM, Random Forest, GraphML) dilatih pada 32 Juta Transaksi IBM AML, terintegrasi live ke 50.000 data MongoDB Atlas Cloud; dan (4) **REMI AI Multi-Model Orchestration Assistant** (Qwen 1.5B LoRA, Groq Llama 3.3 70B, Gemini) yang menghasilkan narasi XAI dan konsultasi regulasi berstandar hukum nasional (UU PDP, POJK Anti-Fraud, APU-PPT, IASC).

---

## 5. Progress and Change Log
*(Maks. 150 kata)*

Inovasi utama sejak 2nd Submission:

1. **REMI AI Multi-Model Orchestration Assistant**: Mengintegrasikan asisten analitik REMI AI berarsitektur *Multi-Model Switcher* yang menggabungkan On-Premise Qwen 1.5B (LoRA fine-tuned 413 instruksi hukum nasional), Groq Llama 3.3 70B, dan Gemini 2.5 Pro / Flash ke dalam satu widget chatbot interaktif di Web Dashboard.
2. **Full Markdown Interactive Renderer**: Membangun custom Markdown parser pada REMI AI Chatbot yang mendukung rendering tabel forensik, header terstruktur, dan blok kode regulasi tanpa error format.
3. **Mobile SDK Threat Decision Engine**: Menyempurnakan kalkulasi *Dwell Time, Flight Time, Hesitation Score*, dan deteksi *Remote Access (AnyDesk)* yang secara presisi memicu keputusan BLOCKED pada FDS Engine.
4. **Validasi Dataset 32 Juta Transaksi**: Ensemble dilatih ulang penuh pada dataset IBM AML Medium (F1 81.48%, PR-AUC 96.04%) dan tersinkronisasi live ke MongoDB Atlas Cloud.
5. **Upgrade UI/UX Enterprise**: Seluruh halaman dashboard diselaraskan ke standar Cyberpunk Glassmorphic Enterprise yang responsif.

---

## 6. Validated User Problem and Evidence
*(Maks. 250 kata)*

Perbankan digital Indonesia menghadapi lonjakan fraud transaksi yang kian canggih: Account Takeover (ATO), Social Engineering (Voice Phishing), Bot / Remote Access Takeover, dan Sindikat Money Mule Ring. Data OJK dan laporan kejahatan siber nasional mencatat kerugian mencapai triliunan rupiah dengan tingkat pemulihan dana di bawah 5%.

Kelemahan struktural FDS konvensional yang terbukti nyata:

1. **Blind Spot Sesi Mobile**: FDS backend tradisional hanya memproses data setelah transaksi dikirim, sehingga buta terhadap peretasan layar via AnyDesk/TeamViewer atau skrip bot yang berjalan di perangkat nasabah sebelum transfer terjadi.

2. **Latensi Otorisasi Melampaui SLA BI-FAST**: Pendekatan Blockchain Consortium atau Deep GNN Heavy Retraining memerlukan latensi >100ms, melanggar SLA BI-FAST/QRIS (<100ms) sekaligus melanggar hak penghapusan data berdasarkan UU PDP No. 27/2022.

3. **AI Black-Box tanpa Dasar Hukum**: Model AI konvensional menghasilkan skor risiko tanpa disertai sitasi pasal regulasi formal, menyulitkan fraud analyst dan compliance officer dalam menyusun berkas bukti hukum untuk pelaporan ke PPATK, OJK, maupun Indonesia Anti-Scam Centre (IASC).

Amankan.ai FraudGuard menjawab ketiga kelemahan ini secara simultan: Mobile SDK menutup blind spot pre-transaction, Kafka x GraphML memastikan latensi sub-30ms, dan REMI AI menghasilkan narasi hukum otomatis terstandarisasi — divalidasi secara ilmiah pada 32 Juta Transaksi IBM AML dengan FPR ultra-rendah 0.54%.

---

## 7. End-to-End Use Case and Feature-to-Pain Mapping
*(Maks. 300 kata)*

**Use Case End-to-End:**

1. **Mobile Session Telemetry**: Nasabah membuka aplikasi mobile banking. SDK (<500KB) merekam biometrik mikro (keystroke dynamics, dwell time, flight time, hesitation score) serta memvalidasi integritas perangkat (AnyDesk active, rooted OS) secara privacy-aware tanpa menyimpan data pribadi.

2. **Event Ingress & Kafka Streaming**: Payload terenkripsi JWT dikirim ke Ingress Gateway, lalu disalurkan terdekoppel ke Apache Kafka topic transaction-stream dan telemetry-behavioral dengan latensi <10ms.

3. **Real-Time Ensemble Scoring (Sub-30ms)**: FDS Microservice mengeksekusi XGBoost (skor anomali), LightGBM (klasifikasi tipe fraud: ATO, Scam, Bot, Mule), Random Forest (verifikasi), dan GraphML (indeks jaringan money mule). Sistem mengeluarkan keputusan: APPROVE, HOLD, atau BLOCK.

4. **Live MongoDB Ingestion & Async XAI**: Data tersimpan ke MongoDB Atlas Cloud (fraud_detection.transactions). Transaksi berisiko memicu kalkulasi SHAP yang diterjemahkan out-of-band oleh REMI AI menjadi narasi hukum Bahasa Indonesia siap audit.

5. **Analyst Risk Cockpit & REMI AI Chatbot**: Analis memantau Real-Time Transaction Feed, GIS Threat Map, dan graph relasi sindikat. Melalui widget REMI AI Assistant, analis berkonsultasi interaktif menggunakan model Qwen 1.5B, Groq Llama 3.3 70B, atau Gemini, lalu menerbitkan laporan PDF kepatuhan 1-klik ke IASC/PPATK.

**Feature-to-Pain Mapping:**

| Fitur | Masalah yang Diatasi |
|---|---|
| Mobile Telemetry SDK (<500KB) | Blind Spot Remote Access & Bot Attack pra-transaksi |
| Apache Kafka x MongoDB Atlas | Bottleneck SLA latensi BI-FAST — dijamin sub-30ms |
| GraphML Topological Extraction | Deteksi sindikat Money Mule Ring tanpa beban GPU berat |
| REMI AI Multi-Model Assistant | Black-Box AI — narasi regulasi otomatis, konsultasi interaktif |

---

## 8. Operational Context, Solution Boundary, and Adoption
*(Maks. 200 kata)*

**Kondisi Operasional**: Amankan.ai FraudGuard beroperasi sebagai threat intelligence layer tambahan yang berdampingan dengan Core Banking Gateway, Payment Switch (BI-FAST/QRIS), dan aplikasi mobile banking yang sudah berjalan. Tidak ada pengubahan arsitektur inti perbankan yang diperlukan.

**Batas Penggunaan**: Solusi berfokus pada deteksi anomali perilaku sesi mobile, skoring risiko transaksi real-time, analisis forensik relasi jaringan, dan konsultasi kepatuhan regulasi. Platform ini tidak menyimpan dana nasabah, tidak menangani kliring akhir perbankan, dan tidak menggantikan sistem otentikasi bank.

**Skenario Adopsi**: Bank atau Fintech memasang Mobile Behavioral Telemetry SDK (<500KB) pada aplikasi mobile banking dan mengintegrasikan REST API / Kafka Consumer ke FDS Engine dalam waktu <2 minggu — tanpa downtime dan tanpa perubahan legacy.

**Target Pengguna Utama**:
- Fraud Analyst dan Risk Compliance Officer di bank umum, BPD, dan neobank
- Compliance Officer yang membutuhkan laporan terstandar untuk OJK, PPATK, dan IASC
- DevSecOps Team yang mengintegrasikan deteksi behavioral ke pipeline keamanan mobile

---

## 9. Innovation Level

**Level 3** *(Functional Live Prototype — Siap Uji Coba Pilot)*

---

## 10. Current Technical Reality, Data, and Integration
*(Maks. 300 kata)*

Amankan.ai FraudGuard beroperasi pada Level 3 (Functional Live Prototype) yang terintegrasi secara end-to-end:

**Model ML Teruji pada Skala Masif**: Ensemble Engine (XGBoost, LightGBM, Random Forest, GraphML) dilatih pada 32 Juta Transaksi dataset benchmark IBM Transactions for Anti-Money Laundering (AML) Medium. XGBoost mencapai F1-Score 81.48%, PR-AUC 96.04%, False Positive Rate ultra-rendah 0.54%, dan Threshold Operasional 0.38. LightGBM Multiclass Classifier mencapai Macro F1 72.23% untuk klasifikasi tipe ancaman (ATO, Scam, Bot, Mule).

**Live Cloud Data Pipeline**: Web Dashboard meng-query secara live 50.000 sampel transaksi dari MongoDB Atlas Cloud (fraud_detection.transactions), lengkap dengan ID Transaksi 16-digit unik dan nomor rekening berstandar ISO perbankan.

**REMI AI Multi-Model Service**: Microservice berbasis FastAPI (ai_service/app.py) dan Next.js API Proxy (/api/chat) mengorkestrasi tiga engine AI: (1) REMI AI Engine lokal — Qwen 1.5B Chat dengan LoRA Adapter yang di-fine-tune pada 413 pasang instruksi hukum (UU PDP, POJK Anti-Fraud, POJK APU-PPT No. 8/2023, UU TPPU, UU ITE); (2) Groq Llama 3.3 70B via Groq API untuk inferensi regulasi berkapasitas besar; dan (3) Gemini 2.5 Pro / Flash via Google AI API untuk konsultasi multimodal. Seluruh model menampilkan respons dengan Markdown renderer penuh.

**Mobile SDK Telemetry Engine**: SDK (<500KB) di-deploy sebagai simulator interaktif Mobile SDK Telemetry dalam dashboard, merekam sinyal biometrik dan mengeksekusi threat decision secara lokal (<50ms) sebelum payload dikirim ke Kafka Bus.

**Fullstack Risk Cockpit**: Dashboard menampilkan Operational Risk Cockpit, GIS Threat Map, Interactive Forensic Graph Explorer, Pipeline Simulation Terminal, Mobile SDK Telemetry Tab, REMI AI Assistant Widget, dan 1-Click PDF Compliance Generator.

---

## 11. MVP Execution and Deployment Plan
*(Maks. 250 kata)*

Rencana penggelaran MVP dalam tiga fase selama 6 bulan:

**Fase 1 (Bulan 1-2) — OJK Regulatory Sandbox & Shadow Pilot**
Menjalankan FDS Engine dalam Shadow Mode berdampingan dengan sistem produksi mitra Bank Umum Tier-2 atau BPD. Seluruh transaksi live diproses paralel oleh FDS tanpa memengaruhi kliring aktif. Tujuan: memvalidasi akurasi deteksi, stabilitas throughput Kafka x MongoDB, dan kecepatan narasi REMI AI pada kondisi data live nyata. Target daftar ke OJK Regulatory Sandbox Klaster RegTech/FDS.

**Fase 2 (Bulan 3-4) — Mobile SDK Beta Integration & Biometric Validation**
Mengintegrasikan Mobile Behavioral Telemetry SDK pada aplikasi mobile banking beta mitra. Mengumpulkan data biometrik riil dari 100.000 pengguna aktif untuk memvalidasi akurasi deteksi keystroke dynamics, hesitation score, dan deteksi AnyDesk/Remote Access. Iterasi model berdasarkan distribusi biometrik pengguna Indonesia.

**Fase 3 (Bulan 5-6) — Full Production & IASC Gateway**
Mengaktifkan koneksi penuh FDS ke API Gateway BI-FAST perbankan mitra, mengotomasi alur pelaporan forensik ke portal Indonesia Anti-Scam Centre (IASC) dan PPATK, serta mengaktifkan REMI AI narasi audit regulasi PDF untuk konsumsi compliance officer langsung dari dashboard.

**Kriteria Keberhasilan MVP**:
- Latensi skoring transaksi konsisten <30ms pada throughput >5.000 TPS
- FPR di bawah 1.0% pada data live perbankan
- Waktu investigasi analis terpangkas menjadi <3 menit via REMI AI Assistant
- Minimal 1 laporan PDF audit terkirim ke IASC/PPATK via otomatisasi

---

## 12. Problem and System Complexity
*(Maks. 200 kata)*

Fraud transaksi digital modern tidak dapat diatasi dengan sistem rule-based konvensional karena pola kejahatan bersifat adaptif: penipu menggunakan remote access software (AnyDesk/TeamViewer) untuk mengendalikan perangkat nasabah, skrip macro bot untuk mensimulasi perilaku manusia, serta jaringan money mule multi-hop yang memecah dana ke belasan rekening dalam hitungan detik (layering).

Empat kompleksitas teknis yang harus diselesaikan sekaligus:

1. **Deteksi Non-Linear Biometrik Mikro**: Sinyal keystroke dynamics, hesitation score, dan remote desktop activity bersifat non-linear dan kontekstual.
2. **Skala & Latensi Real-Time**: Sistem harus memproses ribuan TPS dengan keputusan di bawah 30ms untuk memenuhi SLA BI-FAST/QRIS.
3. **Graph Topology Sindikat**: Deteksi sindikat money mule membutuhkan analisis relasi jaringan rekening pada dataset 32 juta transaksi.
4. **Narasi Hukum Otomatis & Patuh UU PDP**: Nilai SHAP matematika harus diterjemahkan menjadi argumen hukum berbasis pasal regulasi Indonesia, dieksekusi asynchronous agar tidak membebani pipeline otorisasi.

---

## 13. Processing Pipeline and Engineering Depth
*(Maks. 250 kata)*

**Alur Pemrosesan Teknis End-to-End:**

1. **Client-Side Telemetry Capture**: Mobile SDK (<500KB) merekam biometrik mikro (dwell time, flight time, hesitation score, typing consistency) dan memvalidasi integritas perangkat (rooted OS, AnyDesk active). Payload biometrik dikemas terenkripsi JWT dan dikirim ke Ingress API Gateway.

2. **Apache Kafka Event Bus**: Ingress Gateway mempublikasikan event ke topic transaction-stream dan telemetry-behavioral. Kafka memastikan pemrosesan terdekoppel, tahan fault, dan berkecepatan tinggi tanpa blocking pada consumer downstream.

3. **Synchronous Ensemble Scoring (<30ms)**: FDS Microservice mengeksekusi empat model secara terkoordinasi: XGBoost (skor anomali binary, F1 81.48%), LightGBM (klasifikasi tipe fraud multikelas), Random Forest (cross-validation cepat), dan GraphML (ekstraksi fitur topologi degree centrality, fan-out ratio, time velocity). Output: keputusan APPROVE, HOLD, atau BLOCK beserta skor risiko persentase.

4. **Live MongoDB Atlas Ingestion**: Setiap event transaksi disinkronisasikan ke MongoDB Atlas Cloud (fraud_detection.transactions) untuk penayangan real-time di Risk Cockpit Dashboard.

5. **Asynchronous REMI AI XAI Pipeline**: Untuk transaksi HOLD/BLOCK, nilai SHAP dikirim ke REMI AI Engine secara out-of-band. REMI AI — menggunakan Qwen 1.5B LoRA, Groq Llama 3.3 70B, atau Gemini 2.5 Pro — menghasilkan narasi eksplanatif berstandar regulasi dan melayani sesi konsultasi interaktif Multi-Model Chatbot di Web Dashboard tanpa membebani pipeline otorisasi utama.

---

## 14. Algorithm or Rule Quality and Decision Transparency
*(Maks. 300 kata)*

Kualitas keputusan Amankan.ai FraudGuard dibangun di atas tiga lapisan ketransparanan:

**Lapisan 1 — Ensemble Scoring Tervalidasi**:
XGBoost yang dilatih pada 32 Juta Transaksi IBM AML Medium menghasilkan F1-Score 81.48%, PR-AUC 96.04%, dan False Positive Rate 0.54% pada test set. Threshold operasional dioptimalkan pada nilai 0.38 untuk menyeimbangkan sensitivitas deteksi fraud dan kelancaran transaksi nasabah sah. LightGBM Multiclass Classifier mengklasifikasikan empat tipe ancaman (ATO, Social Engineering Scam, Bot Attack, Money Mule) dengan Macro F1 72.23%.

**Lapisan 2 — GraphML Topological Intelligence**:
Sistem mengekstraksi fitur topologi graph secara efisien (sender degree, receiver indegree, fan-out ratio, fan-in ratio, time velocity) untuk mendeteksi pola sindikat money mule ring secara real-time. Pendekatan ini menghasilkan sinyal forensik yang kuat dengan latensi inferensi di bawah 5ms, tanpa beban komputasi heavy GNN.

**Lapisan 3 — REMI AI Regulatory XAI (SHAP + Multi-Model)**:
Nilai kontribusi fitur (SHAP values) diterjemahkan oleh REMI AI menjadi narasi hukum eksplisit mengutip pasal regulasi resmi: UU PDP No. 27/2022 Pasal 25, POJK Anti-Fraud No. 39/2019, POJK APU-PPT No. 8/2023, dan panduan IASC. Tiga engine AI tersedia sesuai kebutuhan analis: REMI AI Engine (Qwen 1.5B LoRA — respons instan, berbasis instruksi hukum lokal), Groq Llama 3.3 70B (penalaran konteks regulasi mendalam), dan Gemini 2.5 Pro / Flash (konsultasi multimodal dan cepat). Seluruh respons dirender penuh dalam format Markdown interaktif dengan tabel, header, dan blok kode.

Kombinasi ketiga lapisan ini mengeliminasi masalah Black-Box AI dan memberikan dasar audit hukum yang kokoh bagi OJK, PPATK, dan IASC.

---

## 15. User Flow, Usability Testing, and Product Iteration
*(Maks. 250 kata)*

**User Flow Analyst:**

1. Analis membuka Risk Cockpit Dashboard dan memantau Real-Time Transaction Feed serta GIS Threat Map.
2. Transaksi berisiko tinggi (HOLD/BLOCK) otomatis masuk ke Manual Audit Queue dengan indikator warna merah.
3. Analis mengklik detail transaksi — membuka Interactive Graph Syndicate Visualizer, SHAP Feature Waterfall Plot, dan narasi rekomendasi REMI AI yang dirender dalam Markdown.
4. Analis membuka widget REMI AI Assistant untuk mengajukan pertanyaan forensik eksploratif, memilih model (Qwen 1.5B, Groq Llama 3.3 70B, atau Gemini) sesuai kedalaman analisis yang dibutuhkan.
5. Analis mengeksekusi keputusan (Approve/Hold/Escalate) dan menekan tombol Generate PDF Audit Report 1-klik untuk pelaporan ke IASC/PPATK.

**Iterasi Produk Berdasarkan Pengujian Internal:**

- **Iterasi 1**: Menyederhanakan visualisasi topologi graph agar terbaca oleh analis non-teknis dengan label node yang deskriptif.
- **Iterasi 2**: Mengintegrasikan REMI AI Multi-Model Switcher langsung di widget chatbot sehingga analis dapat berpindah engine tanpa menutup percakapan.
- **Iterasi 3**: Membangun Full Markdown Renderer agar respons tabel SHAP dan kutipan pasal regulasi dari REMI AI tampil rapi dan terbaca.
- **Iterasi 4**: Memisahkan log pipeline dari input form pada Simulation Terminal agar pengetikan nasabah tidak menyebabkan lompatan scroll ke terminal log.

---

## 16. Team Capability and Execution Ownership
*(Maks. 250 kata)*

Tim Amankan.ai FraudGuard memiliki kapabilitas teknis yang komplementer dengan pembagian kepemilikan eksekusi yang jelas:

**Muhammad Muhibin** *(Team Lead & Data Engineer)*
Memimpin visi produk secara keseluruhan, merancang arsitektur pipeline data end-to-end, mengawasi integrasi live MongoDB Atlas Cloud (50.000 sampel transaksi), dan memastikan kepatuhan seluruh komponen terhadap regulasi finansial nasional (UU PDP, POJK, APU-PPT).

**Muhammad Ihya Abdillah** *(Software Engineer & Data Engineer)*
Mengembangkan infrastruktur event streaming Apache Kafka, microservice backend FDS, API Ingress Gateway berlatensi rendah, serta integrasi pipeline dataset IBM AML 32 Juta Transaksi untuk training.

**Eko Muhammad Rizki** *(Fullstack Developer)*
Membangun Risk Cockpit Web Dashboard tingkat enterprise, visualisasi forensik interaktif (GraphML & SHAP Waterfall), widget REMI AI Chatbot Assistant dengan Multi-Model Switcher, Markdown Renderer interaktif, dan modul generator laporan audit PDF otomatis.

**Reza Asriano Maulana** *(Machine Learning Engineer)*
Merancang, melatih, dan mengoptimalkan pipeline Multi-Model Ensemble (XGBoost, LightGBM, Random Forest, GraphML), fine-tuning REMI AI Engine (Qwen 1.5B LoRA pada 413 pasang instruksi hukum nasional), serta konfigurasi integrasi Groq Llama 3.3 70B dan Gemini 2.5 Pro / Flash ke dalam REMI AI Orchestrator.

Seluruh anggota telah terlibat aktif dari desain arsitektur hingga deployment produksi pada VPS Linux (PM2 + Next.js + FastAPI).

---

## 17. Continuation Readiness
*(Maks. 200 kata)*

Tim memiliki kesiapan menyeluruh untuk melanjutkan solusi menuju komersialisasi pasca-hackathon:

**Kesiapan Prototipe Live**: Prototipe Level 3 telah beroperasi secara live di server VPS produksi (PM2 + Next.js + FastAPI), terhubung ke MongoDB Atlas Cloud dan Apache Kafka Bus, dengan REMI AI Multi-Model Service yang dapat diakses secara real-time.

**Rencana Regulasi & Sandbox**: Mengajukan pendaftaran ke OJK Regulatory Sandbox Klaster RegTech/FDS dan menjajaki kemitraan pilot dengan Bank Pembangunan Daerah (BPD) serta neobank digital sebagai mitra pengujian awal.

**Roadmap Teknis 6 Bulan**: Shadow pilot (Bulan 1-2) > integrasi SDK beta 100.000 pengguna aktif (Bulan 3-4) > production rollout + IASC gateway (Bulan 5-6).

**Komitmen Tim Penuh**: Seluruh anggota tim berkomitmen mendedikasikan kapasitas pengembangan pasca-hackathon untuk membawa prototipe ini menuju Commercial Production MVP — dengan REMI AI, Kafka Bus, dan Mobile SDK sebagai tiga pilar komersialisasi utama.

---

## 18. Quantified Value, Business Model, and ROI
*(Maks. 300 kata)*

**Nilai Terukur (Quantified Impact):**
- Menekan kerugian finansial perbankan akibat fraud digital hingga 40-60% melalui pencegahan pre-transaction berbasis behavioral biometrics.
- Memangkas waktu investigasi analis dari berjam-jam menjadi <2 menit melalui narasi REMI AI otomatis dan laporan PDF 1-klik.
- Menjaga False Positive Rate di bawah 0.54%, melindungi pengalaman transaksi nasabah sah dari pemblokiran yang tidak perlu.
- Memberikan bukti hukum siap audit untuk PPATK, OJK, dan IASC — mengurangi waktu penyusunan berkas dari hari menjadi menit.

**Model Bisnis & Skema Pendapatan:**

1. **B2B API Licensing — SaaS / On-Premise**
   Skema pay-per-api-call berbasis volume transaksi bulanan untuk Bank Umum, BPD, Neobank, dan Fintech Payment Gateway. Tier harga disesuaikan dengan skala TPS institusi.

2. **Mobile SDK Enterprise Subscription**
   Lisensi tahunan untuk akses, pembaruan keamanan, peningkatan model biometrik, dan dukungan teknis Mobile Behavioral Telemetry SDK.

3. **REMI AI Compliance & Audit Module Add-On**
   Biaya lisensi tambahan untuk modul REMI AI Multi-Model Assistant, analisis regulasi interaktif mendalam, dan otomatisasi pelaporan forensik ke IASC/PPATK.

4. **Managed Detection Service (MDS)**
   Layanan monitoring fraud terkelola 24/7 bagi institusi yang tidak memiliki tim fraud analyst internal — FraudGuard beroperasi sebagai Fraud-as-a-Service.

**Proyeksi ROI:**
Bagi institusi dengan volume 1 juta transaksi harian, efisiensi pencegahan fraud (40-60% loss reduction) ditambah penghematan jam kerja operasional analis memberikan proyeksi Return on Investment (ROI) positif dalam <8 bulan — bahkan lebih cepat pada institusi dengan volume transaksi lebih tinggi.

---

## 19. Adoption, Growth Strategy, and Competitive Moat
*(Maks. 250 kata)*

**Strategi Adopsi & Pertumbuhan:**

- **Top-Down Regulatory Alignment**: Bermitra dengan Bank Indonesia dan OJK untuk menjadikan Amankan.ai FraudGuard sebagai platform FDS terstandar yang terhubung langsung dengan portal Indonesia Anti-Scam Centre (IASC) — memperkuat legitimasi regulasi sejak awal adopsi.
- **Low-Friction Plug-and-Play**: SDK ringan (<500KB) dan REST API siap-pakai memungkinkan integrasi ke core banking dalam <2 minggu tanpa mengubah arsitektur legacy — menurunkan hambatan adopsi secara drastis.
- **Ekspansi Regional ASEAN**: Setelah penetrasi pasar Indonesia, arsitektur Kafka + MongoDB yang cloud-agnostic memudahkan ekspansi ke pasar perbankan Malaysia, Filipina, dan Vietnam.

**Competitive Moat (Keunggulan Bertahan):**

1. **Pre-Transaction Mobile Intelligence**: Satu-satunya platform FDS yang menyuntikkan deteksi ancaman (AnyDesk, bot, keystroke anomaly) di perangkat nasabah sebelum transaksi dikirim — bukan setelah.

2. **Sub-30ms & Patuh UU PDP**: Kafka + GraphML + MongoDB menghasilkan otorisasi <30ms tanpa beban konsensus blockchain dan 100% patuh UU PDP No. 27/2022.

3. **REMI AI Multi-Model Orchestration**: Satu widget chatbot mengorkestrasi tiga engine AI kelas dunia (Qwen 1.5B LoRA, Groq Llama 3.3 70B, Gemini 2.5 Pro) dengan Markdown renderer penuh — memberikan konsultasi forensik dan regulasi yang tidak dapat ditawarkan oleh FDS konvensional mana pun.
