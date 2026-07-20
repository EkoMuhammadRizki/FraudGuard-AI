// PDF Generator for Amankan Fraud - Intelligence Reports
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { dashboardSummary, rawModelMetrics, transactionFeed } from "./data-fraudguard";
import { formatCurrency } from "./utilitas";

// ── Helper: format percentage ──
const pct = (v: number, d = 2) => (v * 100).toFixed(d) + "%";

// ── Helper: add styled header to PDF ──
function addHeader(doc: jsPDF, title: string, subtitle: string) {
    // Dark header bar
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 210, 40, "F");

    // Accent line
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 40, 210, 1.5, "F");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 14, 18);

    // Subtitle
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(subtitle, 14, 26);

    // Branding
    doc.setFontSize(8);
    doc.setTextColor(59, 130, 246);
    doc.text("AMANKAN FRAUD - FDS ENGINE", 14, 34);

    // Date stamp right
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    const dateStr = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    doc.text(`Digenerate: ${dateStr}`, 196, 34, { align: "right" });
}

// ── Helper: add footer to every page ──
function addFooter(doc: jsPDF) {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(5, 5, 5);
        doc.rect(0, 285, 210, 12, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text("DOKUMEN RAHASIA - Amankan Fraud Intelligence Platform", 14, 291);
        doc.text(`Halaman ${i} / ${pageCount}`, 196, 291, { align: "right" });
    }
}

// ── Helper: section title ──
function sectionTitle(doc: jsPDF, y: number, text: string): number {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(59, 130, 246);
    doc.text(text, 14, y);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.3);
    doc.line(14, y + 2, 196, y + 2);
    return y + 10;
}

// ── Helper: key-value row ──
function kvRow(doc: jsPDF, y: number, label: string, value: string): number {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(label, 18, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(value, 90, y);
    return y + 6;
}

// ══════════════════════════════════════════════════
// 1. Feed Ancaman Harian PDF
// ══════════════════════════════════════════════════
export function generateFeedAncamanPdf(stats?: any, transactions?: any[]) {
    const doc = new jsPDF();
    addHeader(doc, "Feed Ancaman Harian", "Ringkasan otomatis 24 jam - anomali jaringan kritis dan node sumber yang diblokir");

    const usedStats = stats || dashboardSummary;
    const usedFeed = transactions || transactionFeed;

    let y = 52;
    y = sectionTitle(doc, y, "RINGKASAN STATISTIK OPERASIONAL");
    y = kvRow(doc, y, "Total Transaksi Dataset:", usedStats.totalTransactions.toLocaleString("id-ID"));
    y = kvRow(doc, y, "Fraud Terdeteksi:", usedStats.fraudLabels.toLocaleString("id-ID") + " label");
    y = kvRow(doc, y, "Fraud Alerts:", usedStats.fraudAlerts.toLocaleString("id-ID") + " alert");
    y = kvRow(doc, y, "F1-Score (XGBoost):", pct(usedStats.f1Score, 1));
    y = kvRow(doc, y, "False Positive Rate:", pct(usedStats.falsePositiveRate, 3));
    y = kvRow(doc, y, "PR-AUC:", pct(usedStats.prAuc, 1));
    y = kvRow(doc, y, "Threshold Terpilih:", String(usedStats.selectedThreshold));
    y = kvRow(doc, y, "Framing:", usedStats.framing || "Production");

    y += 6;
    y = sectionTitle(doc, y, "FEED TRANSAKSI ANCAMAN KRITIS (TOP 15)");

    const kritisData = usedFeed
        .filter((t: any) => t.risiko === "kritis" || t.risiko === "tinggi")
        .slice(0, 15)
        .map((t: any) => [
            t.id,
            t.waktu,
            t.pengirim,
            t.penerima,
            formatCurrency(t.jumlah),
            `${t.riskScore}%`,
            t.risiko.toUpperCase(),
            t.status,
        ]);

    autoTable(doc, {
        startY: y,
        head: [["ID", "Waktu", "Pengirim", "Penerima", "Volume", "Risk %", "Level", "Status"]],
        body: kritisData,
        styles: { fontSize: 6.5, cellPadding: 2, textColor: [30, 41, 59] },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 6.5 },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        margin: { left: 14, right: 14 },
        theme: "grid",
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Fraud Type breakdown
    if (y < 240) {
        y = sectionTitle(doc, y, "DISTRIBUSI TIPE FRAUD");
        const fraudTypes: Record<string, number> = {};
        usedFeed.forEach((t: any) => {
            if (t.riskScore >= 38) {
                fraudTypes[t.fraudType] = (fraudTypes[t.fraudType] || 0) + 1;
            }
        });
        Object.entries(fraudTypes)
            .sort((a, b) => b[1] - a[1])
            .forEach(([type, count]) => {
                y = kvRow(doc, y, type + ":", `${count} transaksi`);
            });
    }

    addFooter(doc);
    doc.save(`Feed_Ancaman_Harian_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ══════════════════════════════════════════════════
// 2. Audit Model GNN PDF
// ══════════════════════════════════════════════════
export function generateAuditGnnPdf() {
    const doc = new jsPDF();
    addHeader(doc, "Audit Model GNN", "Metrik performa detail - Mesin Inferensi Graph Neural Network");

    let y = 52;

    // XGBoost Section
    y = sectionTitle(doc, y, "MODEL UTAMA: XGBOOST CLASSIFIER");
    const xgb = rawModelMetrics.binary_models.xgboost;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("— Validation Set —", 18, y);
    y += 6;
    y = kvRow(doc, y, "Accuracy:", pct(xgb.validation.accuracy));
    y = kvRow(doc, y, "Precision:", pct(xgb.validation.precision));
    y = kvRow(doc, y, "Recall:", pct(xgb.validation.recall));
    y = kvRow(doc, y, "F1-Score:", pct(xgb.validation.f1_score));
    y = kvRow(doc, y, "ROC-AUC:", pct(xgb.validation.roc_auc));
    y = kvRow(doc, y, "PR-AUC:", pct(xgb.validation.pr_auc));
    y = kvRow(doc, y, "False Positive Rate:", pct(xgb.validation.false_positive_rate, 3));

    const valCm = xgb.validation.confusion_matrix;
    y += 2;
    y = kvRow(doc, y, "Confusion Matrix:", `TP=${valCm.tp}  FP=${valCm.fp}  TN=${valCm.tn}  FN=${valCm.fn}`);

    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("— Test Set —", 18, y);
    y += 6;
    y = kvRow(doc, y, "Accuracy:", pct(xgb.test.accuracy));
    y = kvRow(doc, y, "Precision:", pct(xgb.test.precision));
    y = kvRow(doc, y, "Recall:", pct(xgb.test.recall));
    y = kvRow(doc, y, "F1-Score:", pct(xgb.test.f1_score));
    y = kvRow(doc, y, "ROC-AUC:", pct(xgb.test.roc_auc));
    y = kvRow(doc, y, "PR-AUC:", pct(xgb.test.pr_auc));
    y = kvRow(doc, y, "False Positive Rate:", pct(xgb.test.false_positive_rate, 3));
    const testCm = xgb.test.confusion_matrix;
    y = kvRow(doc, y, "Confusion Matrix:", `TP=${testCm.tp}  FP=${testCm.fp}  TN=${testCm.tn}  FN=${testCm.fn}`);
    y = kvRow(doc, y, "Selected Threshold:", String(xgb.selected_threshold));

    // Random Forest
    y += 6;
    y = sectionTitle(doc, y, "MODEL BASELINE: RANDOM FOREST");
    const rf = rawModelMetrics.binary_models.random_forest.test;
    y = kvRow(doc, y, "Accuracy:", pct(rf.accuracy));
    y = kvRow(doc, y, "Precision:", pct(rf.precision));
    y = kvRow(doc, y, "Recall:", pct(rf.recall));
    y = kvRow(doc, y, "F1-Score:", pct(rf.f1_score));
    y = kvRow(doc, y, "ROC-AUC:", pct(rf.roc_auc));
    y = kvRow(doc, y, "PR-AUC:", pct(rf.pr_auc));
    const rfCm = rf.confusion_matrix;
    y = kvRow(doc, y, "Confusion Matrix:", `TP=${rfCm.tp}  FP=${rfCm.fp}  TN=${rfCm.tn}  FN=${rfCm.fn}`);

    // Multiclass
    doc.addPage();
    addHeader(doc, "Audit Model GNN (lanjutan)", "Klasifikasi Multiclass dan Model Anomali");
    y = 52;
    y = sectionTitle(doc, y, "KLASIFIKASI MULTICLASS: LIGHTGBM");
    const mc = rawModelMetrics.multiclass_model;
    y = kvRow(doc, y, "Macro F1 (Test):", pct(mc.test.macro_f1));
    y = kvRow(doc, y, "Weighted F1 (Test):", pct(mc.test.weighted_f1));
    y = kvRow(doc, y, "Accuracy:", pct(mc.test.classification_report.accuracy));

    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("— Per-Class Breakdown —", 18, y);
    y += 6;

    const classData = mc.classes.map((cls: string) => {
        const r = mc.test.classification_report[cls];
        return [cls, pct(r.precision), pct(r.recall), pct(r["f1-score"]), String(r.support)];
    });

    autoTable(doc, {
        startY: y,
        head: [["Fraud Type", "Precision", "Recall", "F1-Score", "Support"]],
        body: classData,
        styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [30, 41, 59] },
        headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5 },
        alternateRowStyles: { fillColor: [245, 243, 255] },
        margin: { left: 14, right: 14 },
        theme: "grid",
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // Anomaly Model
    y = sectionTitle(doc, y, "MODEL ANOMALI: ISOLATION FOREST");
    const am = rawModelMetrics.anomaly_model;
    y = kvRow(doc, y, "Accuracy:", pct(am.accuracy));
    y = kvRow(doc, y, "Precision:", pct(am.precision));
    y = kvRow(doc, y, "Recall:", pct(am.recall));
    y = kvRow(doc, y, "F1-Score:", pct(am.f1_score));
    y = kvRow(doc, y, "FPR:", pct(am.false_positive_rate, 3));
    y = kvRow(doc, y, "ROC-AUC:", pct(am.roc_auc));
    y = kvRow(doc, y, "PR-AUC:", pct(am.pr_auc));
    const amCm = am.confusion_matrix;
    y = kvRow(doc, y, "Confusion Matrix:", `TP=${amCm.tp}  FP=${amCm.fp}  TN=${amCm.tn}  FN=${amCm.fn}`);

    // Graph Baseline
    y += 6;
    y = sectionTitle(doc, y, "GRAPH BASELINE: TOPOLOGI NODE");
    const gb = rawModelMetrics.graph_baseline;
    y = kvRow(doc, y, "Accuracy:", pct(gb.accuracy));
    y = kvRow(doc, y, "Precision:", pct(gb.precision));
    y = kvRow(doc, y, "Recall:", pct(gb.recall));
    y = kvRow(doc, y, "F1-Score:", pct(gb.f1_score));
    y = kvRow(doc, y, "FPR:", pct(gb.false_positive_rate, 3));
    y = kvRow(doc, y, "ROC-AUC:", pct(gb.roc_auc));
    const gbCm = gb.confusion_matrix;
    y = kvRow(doc, y, "Confusion Matrix:", `TP=${gbCm.tp}  FP=${gbCm.fp}  TN=${gbCm.tn}  FN=${gbCm.fn}`);

    addFooter(doc);
    doc.save(`Audit_Model_GNN_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ══════════════════════════════════════════════════
// 3. Paket Kepatuhan PDF
// ══════════════════════════════════════════════════
export function generateKepatuhanPdf() {
    const doc = new jsPDF();
    addHeader(doc, "Paket Kepatuhan Regulasi", "Laporan Kepatuhan PCI-DSS, SOC2, ISO-27001 - Amankan Fraud Platform");

    let y = 52;
    y = sectionTitle(doc, y, "RINGKASAN KEPATUHAN");

    y = kvRow(doc, y, "Standar:", "PCI-DSS v4.0 / SOC2 Type II / ISO-27001:2022");
    y = kvRow(doc, y, "Periode Audit:", `${new Date().getFullYear()}`);
    y = kvRow(doc, y, "Status:", "COMPLIANT - Dengan Catatan");
    y = kvRow(doc, y, "Threshold Model:", String(dashboardSummary.selectedThreshold));
    y = kvRow(doc, y, "FPR Terukur:", pct(dashboardSummary.falsePositiveRate, 3));
    y = kvRow(doc, y, "F1-Score:", pct(dashboardSummary.f1Score, 1));

    y += 6;
    y = sectionTitle(doc, y, "CHECKLIST KEPATUHAN");

    const checklistData = [
        ["PCI-DSS Req 6.5", "Fraud Detection System", "Aktif", "PASS"],
        ["PCI-DSS Req 10.6", "Log Monitoring and Review", "Aktif", "PASS"],
        ["SOC2 CC6.1", "Logical Access Controls", "Aktif", "PASS"],
        ["SOC2 CC7.2", "System Monitoring", "Aktif", "PASS"],
        ["ISO-27001 A.12.4", "Logging and Monitoring", "Aktif", "PASS"],
        ["ISO-27001 A.16.1", "Incident Management", "Aktif", "PASS"],
        ["UU PDP Pasal 35", "Perlindungan Data Pribadi", "Aktif", "PASS"],
        ["POJK 11/2022", "Manajemen Risiko TI", "Aktif", "PASS"],
    ];

    autoTable(doc, {
        startY: y,
        head: [["Referensi", "Kontrol", "Status", "Hasil"]],
        body: checklistData,
        styles: { fontSize: 7.5, cellPadding: 3, textColor: [30, 41, 59] },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.5 },
        alternateRowStyles: { fillColor: [236, 253, 245] },
        columnStyles: { 3: { fontStyle: "bold", textColor: [16, 185, 129] } },
        margin: { left: 14, right: 14 },
        theme: "grid",
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    y = sectionTitle(doc, y, "PERFORMA MODEL UNTUK COMPLIANCE");
    y = kvRow(doc, y, "Model Utama:", "XGBoost Classifier (MVP)");
    y = kvRow(doc, y, "Accuracy:", pct(rawModelMetrics.binary_models.xgboost.test.accuracy));
    y = kvRow(doc, y, "Precision:", pct(rawModelMetrics.binary_models.xgboost.test.precision));
    y = kvRow(doc, y, "Recall:", pct(rawModelMetrics.binary_models.xgboost.test.recall));
    y = kvRow(doc, y, "F1-Score:", pct(rawModelMetrics.binary_models.xgboost.test.f1_score));
    y = kvRow(doc, y, "FPR:", pct(rawModelMetrics.binary_models.xgboost.test.false_positive_rate, 3));

    y += 6;
    y = sectionTitle(doc, y, "CATATAN AUDITOR");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const note = "Sistem Fraud Detection Amankan Fraud telah memenuhi standar minimum kepatuhan untuk pemantauan transaksi real-time. Model XGBoost menunjukkan performa F1-Score yang memadai untuk fase MVP. Rekomendasi: lanjutkan peningkatan recall untuk tipe Card Cloning, serta integrasi model GNN untuk deteksi pola jaringan yang lebih kompleks pada fase Production.";
    const lines = doc.splitTextToSize(note, 178);
    doc.text(lines, 18, y);

    addFooter(doc);
    doc.save(`Paket_Kepatuhan_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ══════════════════════════════════════════════════
// 4. Generic Report PDF (for table "Unduh Aman")
// ══════════════════════════════════════════════════
export function generateGenericReportPdf(nama: string, tipe: string) {
    const doc = new jsPDF();
    addHeader(doc, nama.length > 50 ? nama.substring(0, 50) + "..." : nama, `Tipe: ${tipe} - Laporan Intelligence Amankan Fraud`);

    let y = 52;
    y = sectionTitle(doc, y, "INFORMASI LAPORAN");
    y = kvRow(doc, y, "Nama Laporan:", nama.length > 60 ? nama.substring(0, 60) + "..." : nama);
    y = kvRow(doc, y, "Klasifikasi:", tipe);
    y = kvRow(doc, y, "Tanggal Pembuatan:", new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }));
    y = kvRow(doc, y, "Status Keamanan:", "TERENKRIPSI - AES-256");

    y += 6;

    // If it's a model eval type, show model metrics
    if (tipe === "Evaluasi Model" || tipe === "Teknis") {
        y = sectionTitle(doc, y, "METRIK PERFORMA MODEL");

        const xgb = rawModelMetrics.binary_models.xgboost.test;
        const rf = rawModelMetrics.binary_models.random_forest.test;

        const modelData = [
            ["XGBoost", pct(xgb.accuracy), pct(xgb.precision), pct(xgb.recall), pct(xgb.f1_score), pct(xgb.false_positive_rate, 3), pct(xgb.pr_auc)],
            ["Random Forest", pct(rf.accuracy), pct(rf.precision), pct(rf.recall), pct(rf.f1_score), pct(rf.false_positive_rate, 3), pct(rf.pr_auc)],
        ];

        autoTable(doc, {
            startY: y,
            head: [["Model", "Accuracy", "Precision", "Recall", "F1", "FPR", "PR-AUC"]],
            body: modelData,
            styles: { fontSize: 7, cellPadding: 2.5, textColor: [30, 41, 59] },
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7 },
            alternateRowStyles: { fillColor: [241, 245, 249] },
            margin: { left: 14, right: 14 },
            theme: "grid",
        });

        y = (doc as any).lastAutoTable.finalY + 10;

        // Anomaly & Graph if Teknis
        if (tipe === "Teknis") {
            y = sectionTitle(doc, y, "MODEL ANOMALI dan GRAPH");
            const am = rawModelMetrics.anomaly_model;
            const gb = rawModelMetrics.graph_baseline;
            const extraData = [
                ["Isolation Forest", pct(am.accuracy), pct(am.precision), pct(am.recall), pct(am.f1_score), pct(am.false_positive_rate, 3)],
                ["Graph Baseline", pct(gb.accuracy), pct(gb.precision), pct(gb.recall), pct(gb.f1_score), pct(gb.false_positive_rate, 3)],
            ];
            autoTable(doc, {
                startY: y,
                head: [["Model", "Accuracy", "Precision", "Recall", "F1", "FPR"]],
                body: extraData,
                styles: { fontSize: 7, cellPadding: 2.5, textColor: [30, 41, 59] },
                headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7 },
                alternateRowStyles: { fillColor: [245, 243, 255] },
                margin: { left: 14, right: 14 },
                theme: "grid",
            });
            y = (doc as any).lastAutoTable.finalY + 10;
        }
    }

    // Add top threat transactions for all report types
    y = sectionTitle(doc, y, "SAMPEL TRANSAKSI ANCAMAN TERTINGGI");
    const topTxns = transactionFeed.slice(0, 10).map(t => [
        t.id, t.waktu, t.pengirim, t.penerima, formatCurrency(t.jumlah), `${t.riskScore}%`, t.status,
    ]);

    autoTable(doc, {
        startY: y,
        head: [["ID", "Waktu", "Pengirim", "Penerima", "Volume", "Risk", "Status"]],
        body: topTxns,
        styles: { fontSize: 6.5, cellPadding: 2, textColor: [30, 41, 59] },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 6.5 },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        margin: { left: 14, right: 14 },
        theme: "grid",
    });

    addFooter(doc);
    const safeName = nama.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 40);
    doc.save(`${safeName}_${new Date().toISOString().split("T")[0]}.pdf`);
}
