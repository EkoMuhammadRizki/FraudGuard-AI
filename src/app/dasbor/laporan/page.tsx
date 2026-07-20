"use client";
import { useState, useMemo } from "react";
import { Calendar, Brain, ShieldCheck, Search, FileText, Download, X, Settings, Plus, Check, Clock, RefreshCw, AlertTriangle } from "lucide-react";
import InfoTooltip from "@/komponen/ui/info-tooltip";
import { dashboardSummary, rawModelMetrics } from "@/pustaka/data-fraudguard";
import { generateFeedAncamanPdf, generateAuditGnnPdf, generateKepatuhanPdf, generateGenericReportPdf } from "@/pustaka/generate-pdf";

// ─── Tipe ────────────────────────────────────────────────────────────────────
type LaporanItem = {
    id: number;
    nama: string;
    tipe: string;
    date: string;
    size: string;
};

type GenerateStatus = "idle" | "generating" | "done";
type CardKey = "feed" | "gnn" | "kepatuhan";

// ─── Konstanta ────────────────────────────────────────────────────────────────
const CARD_CONFIG: Record<CardKey, { title: string; desc: string; tipe: string; icon: React.ReactNode; color: string; accentColor: string }> = {
    feed: {
        title: "Feed Ancaman Harian",
        desc: "Ringkasan otomatis 24 jam untuk anomali jaringan kritis dan node sumber yang diblokir.",
        tipe: "Operasional",
        icon: <Calendar className="w-8 h-8 text-neon-cyan" strokeWidth={2} />,
        color: "text-neon-cyan",
        accentColor: "#22D3EE",
    },
    gnn: {
        title: "Audit Model GNN",
        desc: "Metrik performa detail dari mesin inferensi Graph Neural Network.",
        tipe: "Teknis",
        icon: <Brain className="w-8 h-8 text-hyper-violet" strokeWidth={2} />,
        color: "text-hyper-violet",
        accentColor: "#A855F7",
    },
    kepatuhan: {
        title: "Paket Kepatuhan",
        desc: "Hasilkan laporan terstandarisasi untuk badan pengawas regulasi seperti PCI-DSS, SOC2, dan ISO-27001.",
        tipe: "Kepatuhan",
        icon: <ShieldCheck className="w-8 h-8 text-status-success" strokeWidth={2} />,
        color: "text-status-success",
        accentColor: "#10B981",
    },
};

const TIPE_BADGE_COLOR: Record<string, string> = {
    "Evaluasi Model": "text-hyper-violet border-hyper-violet/20 bg-hyper-violet/10",
    "Teknis": "text-neon-cyan border-neon-cyan/20 bg-neon-cyan/10",
    "Graph": "text-primary-blue border-primary-blue/20 bg-primary-blue/10",
    "Kepatuhan": "text-status-success border-status-success/20 bg-status-success/10",
    "Operasional": "text-amber-warning border-amber-warning/20 bg-amber-warning/10",
};

export default function LaporanPage() {
    // MongoDB connection states for dynamic reports
    const [stats, setStats] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/dashboard/stats")
            .then(res => res.json())
            .then(data => {
                if (data.stats) setStats(data.stats);
                if (data.transactions) setTransactions(data.transactions);
            })
            .catch(err => console.error("Error loading stats for reports:", err));
    }, []);

    // ── State Tabel ──
    const [searchQuery, setSearchQuery] = useState("");
    const [downloading, setDownloading] = useState<number | null>(null);
    const [downloadedIds, setDownloadedIds] = useState<Set<number>>(new Set());

    // ── State Generate PDF Cards ──
    const [generateStatus, setGenerateStatus] = useState<Record<CardKey, GenerateStatus>>({ feed: "idle", gnn: "idle", kepatuhan: "idle" });
    const [generatedCards, setGeneratedCards] = useState<Set<CardKey>>(new Set());

    // ── State Modal Buat Laporan Baru ──
    const [showBuatModal, setShowBuatModal] = useState(false);
    const [buatForm, setBuatForm] = useState({ nama: "", tipe: "Evaluasi Model", rentang: "24jam", format: "PDF" });
    const [buatSubmitting, setBuatSubmitting] = useState(false);
    const [buatDone, setBuatDone] = useState(false);

    // ── State Modal Konfigurasi Otomatisasi ──
    const [showKonfigModal, setShowKonfigModal] = useState(false);
    const [konfigForm, setKonfigForm] = useState({
        feedHarian: true,
        gnnAudit: false,
        kepatuhan: true,
        jadwal: "harian",
        jam: "07:00",
        emailTujuan: "analyst@fraudguard.id",
        formatDefault: "PDF",
    });
    const [konfigSaved, setKonfigSaved] = useState(false);

    // ── Data tabel (dapat dikembangkan runtime) ──
    const [laporanData, setLaporanData] = useState<LaporanItem[]>([
        { id: 1, nama: `Laporan Evaluasi XGBoost Classifier (F1: ${(rawModelMetrics.binary_models.xgboost.test.f1_score * 100).toFixed(2)}%, FPR: ${(rawModelMetrics.binary_models.xgboost.test.false_positive_rate * 100).toFixed(3)}%)`, tipe: "Evaluasi Model", date: "2026-06-04", size: "2.4 MB" },
        { id: 2, nama: `Laporan Baseline Random Forest (F1: ${(rawModelMetrics.binary_models.random_forest.test.f1_score * 100).toFixed(2)}%, PR-AUC: ${(rawModelMetrics.binary_models.random_forest.test.pr_auc * 100).toFixed(2)}%)`, tipe: "Evaluasi Model", date: "2026-06-04", size: "1.8 MB" },
        { id: 3, nama: `Laporan Klasifikasi Multiclass LightGBM (Macro F1: ${(rawModelMetrics.multiclass_model.test.macro_f1 * 100).toFixed(2)}%)`, tipe: "Teknis", date: "2026-06-04", size: "3.2 MB" },
        { id: 4, nama: `Analisis Outlier Isolation Forest (F1: ${(rawModelMetrics.anomaly_model.f1_score * 100).toFixed(2)}%, Recall: ${(rawModelMetrics.anomaly_model.recall * 100).toFixed(2)}%)`, tipe: "Teknis", date: "2026-06-04", size: "1.5 MB" },
        { id: 5, nama: `Analisis Topologi Graph Node Baseline (F1: ${(rawModelMetrics.graph_baseline.f1_score * 100).toFixed(2)}%)`, tipe: "Graph", date: "2026-06-04", size: "4.1 MB" },
        { id: 6, nama: `Audit Kepatuhan UU PDP & Kepatuhan OJK (Threshold: ${dashboardSummary.selectedThreshold})`, tipe: "Kepatuhan", date: "2026-06-04", size: "1.1 MB" },
    ]);

    // ── Filtered data ──
    const filteredLaporan = useMemo(() =>
        laporanData.filter(l => l.nama.toLowerCase().includes(searchQuery.toLowerCase()) || l.tipe.toLowerCase().includes(searchQuery.toLowerCase())),
        [laporanData, searchQuery]
    );

    // ── Handlers ──
    const handleDownload = (id: number) => {
        if (downloading === id) return;
        setDownloading(id);
        const lap = laporanData.find(l => l.id === id);
        setTimeout(() => {
            if (lap) {
                generateGenericReportPdf(lap.nama, lap.tipe);
            }
            setDownloading(null);
            setDownloadedIds(prev => new Set(prev).add(id));
        }, 1500);
    };

    const handleGeneratePdf = (key: CardKey) => {
        if (generateStatus[key] !== "idle") return;
        setGenerateStatus(prev => ({ ...prev, [key]: "generating" }));
        setTimeout(() => {
            // Generate the actual PDF
            if (key === "feed") generateFeedAncamanPdf(stats, transactions);
            else if (key === "gnn") generateAuditGnnPdf();
            else if (key === "kepatuhan") generateKepatuhanPdf();

            setGenerateStatus(prev => ({ ...prev, [key]: "done" }));
            setGeneratedCards(prev => new Set(prev).add(key));
            // Tambah entri baru ke tabel riwayat
            const config = CARD_CONFIG[key];
            const now = new Date().toISOString().split("T")[0];
            const sizeMap: Record<CardKey, string> = { feed: "0.9 MB", gnn: "2.1 MB", kepatuhan: "1.3 MB" };
            setLaporanData(prev => [{
                id: Date.now(),
                nama: `${config.title} — Dibuat ${new Date().toLocaleTimeString("id-ID")}`,
                tipe: config.tipe,
                date: now,
                size: sizeMap[key],
            }, ...prev]);
            // Reset setelah 3 detik
            setTimeout(() => setGenerateStatus(prev => ({ ...prev, [key]: "idle" })), 3000);
        }, 2500);
    };

    const handleBuatSubmit = () => {
        if (!buatForm.nama.trim()) return;
        setBuatSubmitting(true);
        setTimeout(() => {
            setBuatSubmitting(false);
            setBuatDone(true);
            const now = new Date().toISOString().split("T")[0];
            setLaporanData(prev => [{
                id: Date.now(),
                nama: buatForm.nama,
                tipe: buatForm.tipe,
                date: now,
                size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
            }, ...prev]);
            setTimeout(() => {
                setBuatDone(false);
                setShowBuatModal(false);
                setBuatForm({ nama: "", tipe: "Evaluasi Model", rentang: "24jam", format: "PDF" });
            }, 1500);
        }, 2000);
    };

    const handleKonfigSave = () => {
        setKonfigSaved(true);
        setTimeout(() => {
            setKonfigSaved(false);
            setShowKonfigModal(false);
        }, 1500);
    };

    // ── Render ──
    return (
        <div className="space-y-10 min-w-0 overflow-hidden animate-fade-in pb-12">

            {/* ── HEADER ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[1.1] italic">
                        Intelligence <span className="text-primary-blue block sm:inline">Reports</span>
                    </h1>
                    <p className="text-dark-400 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                        <span className="w-1.5 h-1.5 bg-hyper-violet/50 rounded-full shrink-0 animate-pulse" />
                        Mesin Analitik: <span className="text-white">Pengiriman Aktif</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowKonfigModal(true)}
                        className="px-6 py-3 rounded-xl bg-dark-900/50 hover:bg-white/5 text-dark-400 hover:text-white text-xs font-bold transition-all border border-white/5 active:scale-[0.98] uppercase tracking-widest inline-flex items-center gap-2"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        Konfigurasi Otomatisasi
                    </button>
                    <button
                        onClick={() => setShowBuatModal(true)}
                        className="group relative px-6 py-3 rounded-xl bg-primary-blue text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm inline-flex items-center gap-2"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                        <Plus className="w-3.5 h-3.5 relative" />
                        <span className="relative">Buat Laporan Baru</span>
                    </button>
                </div>
            </div>

            {/* ── QUICK CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(Object.entries(CARD_CONFIG) as [CardKey, typeof CARD_CONFIG[CardKey]][]).map(([key, card]) => {
                    const status = generateStatus[key];
                    return (
                        <div key={key} className="glass-panel p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] flex flex-col h-full hover:bg-white/10 group transition-all hover:scale-[1.01] relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none group-hover:bg-primary-blue/10 transition-colors duration-700" />
                            {/* Garis atas berwarna */}
                            <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: `linear-gradient(to right, transparent, ${card.accentColor}40, transparent)` }} />

                            <div className="flex items-center gap-5 mb-8 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-dark-950 flex items-center justify-center text-3xl border border-white/5 shadow-inner">
                                    {card.icon}
                                </div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-tight italic">{card.title}</h3>
                                    <InfoTooltip text={card.desc} />
                                </div>
                            </div>
                            <p className="text-[11px] font-bold text-dark-500 flex-1 leading-relaxed uppercase tracking-tighter">{card.desc}</p>

                            {/* Tombol Generate */}
                            <button
                                onClick={() => handleGeneratePdf(key)}
                                disabled={status === "generating"}
                                className={`mt-10 w-full py-4 rounded-2xl text-[10px] font-black transition-all border uppercase tracking-[0.2em] shadow-lg inline-flex items-center justify-center gap-2 ${
                                    status === "done"
                                        ? "bg-status-success/10 border-status-success/30 text-status-success cursor-default"
                                        : status === "generating"
                                        ? "bg-dark-900/50 border-white/5 text-dark-400 cursor-not-allowed"
                                        : "bg-dark-900/50 hover:bg-white/5 text-white border-white/5 hover:border-white/10"
                                }`}
                            >
                                {status === "generating" && (
                                    <>
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                        Membangun PDF...
                                    </>
                                )}
                                {status === "done" && (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        Berhasil Dibuat
                                    </>
                                )}
                                {status === "idle" && "Ajukan Pembuatan (PDF)"}
                            </button>

                            {/* Progress bar saat generating */}
                            {status === "generating" && (
                                <div className="mt-3 h-1 w-full bg-dark-950 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full animate-pulse" style={{ width: "70%", backgroundColor: card.accentColor }} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── HISTORY TABLE ── */}
            <div className="glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] relative group overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-hyper-violet to-transparent opacity-10 group-hover:opacity-30 transition-opacity" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Riwayat <span className="text-hyper-violet">Pengiriman</span></h3>
                        <InfoTooltip text="Riwayat seluruh laporan yang telah dibuat dan didistribusikan. Tersedia opsi unduh terenkripsi (Secure Pull) untuk setiap laporan." />
                        {/* Jumlah item */}
                        <span className="ml-2 px-2.5 py-0.5 rounded-full bg-hyper-violet/10 border border-hyper-violet/20 text-hyper-violet text-[9px] font-black">
                            {filteredLaporan.length}
                        </span>
                    </div>
                    <div className="relative group/search w-full md:w-80">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-dark-500 group-focus-within/search:text-hyper-violet transition-colors" strokeWidth={3} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Cari laporan berdasarkan nama..."
                            className="w-full bg-dark-950/50 border border-white/5 focus:border-hyper-violet/50 focus:ring-4 focus:ring-hyper-violet/5 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-bold text-white placeholder-dark-600 transition-all outline-none"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-4 flex items-center text-dark-500 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {filteredLaporan.length === 0 ? (
                    <div className="py-20 text-center">
                        <Search className="w-8 h-8 text-dark-700 mx-auto mb-4" />
                        <p className="text-dark-600 font-bold text-sm uppercase tracking-widest">Tidak ada laporan ditemukan untuk &quot;{searchQuery}&quot;</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-left text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">
                                    <th className="pb-4 pl-8">Nama Protokol</th>
                                    <th className="pb-4">Klasifikasi</th>
                                    <th className="pb-4">Waktu Pembuatan</th>
                                    <th className="pb-4">Volume Data</th>
                                    <th className="pb-4 text-right pr-8">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLaporan.map((lap) => (
                                    <tr key={lap.id} className="group/row transition-all">
                                        <td className="py-5 pl-8 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-l border-white/5 first:rounded-l-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-dark-950 border border-white/5 flex items-center justify-center shrink-0">
                                                    <FileText className="w-4 h-4 text-dark-400 group-hover/row:text-hyper-violet transition-colors" strokeWidth={2} />
                                                </div>
                                                <span className="text-sm font-black text-white tracking-tight uppercase italic leading-snug">{lap.nama}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5">
                                            <span className={`inline-flex px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${TIPE_BADGE_COLOR[lap.tipe] ?? "text-dark-300 border-white/5 bg-dark-900"}`}>
                                                {lap.tipe}
                                            </span>
                                        </td>
                                        <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5 text-[10px] font-black text-dark-400 font-mono tracking-tighter uppercase">{lap.date}</td>
                                        <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5 text-[10px] font-black text-dark-400 font-mono tracking-tighter uppercase">{lap.size}</td>
                                        <td className="py-5 pr-8 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-r border-white/5 last:rounded-r-2xl text-right">
                                            <button
                                                onClick={() => handleDownload(lap.id)}
                                                disabled={downloading === lap.id}
                                                className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all disabled:opacity-60 uppercase tracking-widest inline-flex items-center gap-2 ${
                                                    downloadedIds.has(lap.id)
                                                        ? "bg-status-success/10 border border-status-success/20 text-status-success"
                                                        : "bg-dark-900 border border-white/5 hover:border-hyper-violet/30 hover:bg-hyper-violet/10 text-white"
                                                }`}
                                            >
                                                {downloading === lap.id ? (
                                                    <>
                                                        <div className="w-2 h-2 rounded-full bg-hyper-violet animate-pulse" />
                                                        Mendekripsi...
                                                    </>
                                                ) : downloadedIds.has(lap.id) ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5" />
                                                        Diunduh
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="w-3.5 h-3.5" />
                                                        Unduh Aman
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════
                MODAL — BUAT LAPORAN BARU
            ══════════════════════════════════════════════════════ */}
            {showBuatModal && (
                <div
                    className="fixed inset-0 z-[3000] bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => !buatSubmitting && setShowBuatModal(false)}
                >
                    <div
                        className="bg-dark-900 border border-white/10 rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Garis atas */}
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary-blue to-transparent" />

                        <div className="p-8">
                            {/* Header modal */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary-blue/10 border border-primary-blue/20 flex items-center justify-center">
                                        <Plus className="w-5 h-5 text-primary-blue" />
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Buat Laporan Baru</h3>
                                </div>
                                <button onClick={() => setShowBuatModal(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-dark-400 hover:text-white transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="space-y-5">
                                {/* Nama laporan */}
                                <div>
                                    <label className="text-[10px] font-black text-dark-500 uppercase tracking-widest block mb-2">Nama Laporan *</label>
                                    <input
                                        type="text"
                                        value={buatForm.nama}
                                        onChange={e => setBuatForm(f => ({ ...f, nama: e.target.value }))}
                                        placeholder="contoh: Evaluasi Model Q2 2026"
                                        className="w-full bg-dark-950/60 border border-white/5 focus:border-primary-blue/50 focus:ring-4 focus:ring-primary-blue/5 rounded-xl py-3.5 px-5 text-sm font-bold text-white placeholder-dark-600 transition-all outline-none"
                                    />
                                </div>

                                {/* Grid 2 kolom */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-dark-500 uppercase tracking-widest block mb-2">Tipe Laporan</label>
                                        <select
                                            value={buatForm.tipe}
                                            onChange={e => setBuatForm(f => ({ ...f, tipe: e.target.value }))}
                                            className="w-full bg-dark-950/60 border border-white/5 focus:border-primary-blue/50 rounded-xl py-3.5 px-4 text-sm font-bold text-white transition-all outline-none appearance-none"
                                        >
                                            <option value="Evaluasi Model">Evaluasi Model</option>
                                            <option value="Teknis">Teknis</option>
                                            <option value="Graph">Graph</option>
                                            <option value="Kepatuhan">Kepatuhan</option>
                                            <option value="Operasional">Operasional</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-dark-500 uppercase tracking-widest block mb-2">Rentang Data</label>
                                        <select
                                            value={buatForm.rentang}
                                            onChange={e => setBuatForm(f => ({ ...f, rentang: e.target.value }))}
                                            className="w-full bg-dark-950/60 border border-white/5 focus:border-primary-blue/50 rounded-xl py-3.5 px-4 text-sm font-bold text-white transition-all outline-none appearance-none"
                                        >
                                            <option value="24jam">24 Jam Terakhir</option>
                                            <option value="7hari">7 Hari Terakhir</option>
                                            <option value="30hari">30 Hari Terakhir</option>
                                            <option value="kustom">Kustom</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Format */}
                                <div>
                                    <label className="text-[10px] font-black text-dark-500 uppercase tracking-widest block mb-2">Format Output</label>
                                    <div className="flex gap-3">
                                        {["PDF", "CSV", "JSON"].map(fmt => (
                                            <button
                                                key={fmt}
                                                onClick={() => setBuatForm(f => ({ ...f, format: fmt }))}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    buatForm.format === fmt
                                                        ? "bg-primary-blue text-white border-primary-blue"
                                                        : "bg-dark-950/60 text-dark-400 border-white/5 hover:border-white/10 hover:text-white"
                                                }`}
                                            >
                                                {fmt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tombol aksi */}
                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowBuatModal(false)}
                                    className="flex-1 py-3.5 rounded-xl bg-dark-800 hover:bg-white/5 text-dark-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-white/5 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleBuatSubmit}
                                    disabled={!buatForm.nama.trim() || buatSubmitting || buatDone}
                                    className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 disabled:opacity-50 ${
                                        buatDone ? "bg-status-success text-white" : "bg-primary-blue hover:bg-primary-blue/80 text-white"
                                    }`}
                                >
                                    {buatDone ? <><Check className="w-4 h-4" /> Dibuat!</> : buatSubmitting ? <><RefreshCw className="w-4 h-4 animate-spin" /> Membuat...</> : "Buat Laporan"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                MODAL — KONFIGURASI OTOMATISASI
            ══════════════════════════════════════════════════════ */}
            {showKonfigModal && (
                <div
                    className="fixed inset-0 z-[3000] bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setShowKonfigModal(false)}
                >
                    <div
                        className="bg-dark-900 border border-white/10 rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-hyper-violet to-transparent" />

                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-hyper-violet/10 border border-hyper-violet/20 flex items-center justify-center">
                                        <Settings className="w-5 h-5 text-hyper-violet" />
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Konfigurasi Otomatisasi</h3>
                                </div>
                                <button onClick={() => setShowKonfigModal(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-dark-400 hover:text-white transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Toggle laporan otomatis */}
                            <div className="mb-6">
                                <p className="text-[10px] font-black text-dark-500 uppercase tracking-widest mb-3">Laporan yang Dibuat Otomatis</p>
                                <div className="space-y-3">
                                    {([
                                        { key: "feedHarian", label: "Feed Ancaman Harian", icon: <Calendar className="w-4 h-4 text-neon-cyan" /> },
                                        { key: "gnnAudit", label: "Audit Model GNN", icon: <Brain className="w-4 h-4 text-hyper-violet" /> },
                                        { key: "kepatuhan", label: "Paket Kepatuhan", icon: <ShieldCheck className="w-4 h-4 text-status-success" /> },
                                    ] as const).map(item => (
                                        <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-dark-950/60 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                {item.icon}
                                                <span className="text-sm font-bold text-white">{item.label}</span>
                                            </div>
                                            <button
                                                onClick={() => setKonfigForm(f => ({ ...f, [item.key]: !f[item.key] }))}
                                                className={`w-11 h-6 rounded-full transition-all relative ${konfigForm[item.key] ? "bg-hyper-violet" : "bg-dark-700"}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${konfigForm[item.key] ? "left-6" : "left-1"}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Jadwal */}
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                <div>
                                    <label className="text-[10px] font-black text-dark-500 uppercase tracking-widest block mb-2">
                                        <Clock className="w-3 h-3 inline mr-1" />Jadwal Pengiriman
                                    </label>
                                    <select
                                        value={konfigForm.jadwal}
                                        onChange={e => setKonfigForm(f => ({ ...f, jadwal: e.target.value }))}
                                        className="w-full bg-dark-950/60 border border-white/5 focus:border-hyper-violet/50 rounded-xl py-3.5 px-4 text-sm font-bold text-white outline-none appearance-none"
                                    >
                                        <option value="harian">Harian</option>
                                        <option value="mingguan">Mingguan</option>
                                        <option value="bulanan">Bulanan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-dark-500 uppercase tracking-widest block mb-2">Waktu Kirim</label>
                                    <input
                                        type="time"
                                        value={konfigForm.jam}
                                        onChange={e => setKonfigForm(f => ({ ...f, jam: e.target.value }))}
                                        className="w-full bg-dark-950/60 border border-white/5 focus:border-hyper-violet/50 rounded-xl py-3.5 px-4 text-sm font-bold text-white outline-none"
                                    />
                                </div>
                            </div>

                            {/* Email tujuan */}
                            <div className="mb-5">
                                <label className="text-[10px] font-black text-dark-500 uppercase tracking-widest block mb-2">Email Tujuan Distribusi</label>
                                <input
                                    type="email"
                                    value={konfigForm.emailTujuan}
                                    onChange={e => setKonfigForm(f => ({ ...f, emailTujuan: e.target.value }))}
                                    className="w-full bg-dark-950/60 border border-white/5 focus:border-hyper-violet/50 rounded-xl py-3.5 px-5 text-sm font-bold text-white outline-none"
                                />
                            </div>

                            {/* Format default */}
                            <div className="mb-8">
                                <label className="text-[10px] font-black text-dark-500 uppercase tracking-widest block mb-2">Format Default Otomatis</label>
                                <div className="flex gap-3">
                                    {["PDF", "CSV", "JSON"].map(fmt => (
                                        <button
                                            key={fmt}
                                            onClick={() => setKonfigForm(f => ({ ...f, formatDefault: fmt }))}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                konfigForm.formatDefault === fmt
                                                    ? "bg-hyper-violet text-white border-hyper-violet"
                                                    : "bg-dark-950/60 text-dark-400 border-white/5 hover:border-white/10 hover:text-white"
                                            }`}
                                        >
                                            {fmt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Info notice */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-warning/5 border border-amber-warning/15 mb-6">
                                <AlertTriangle className="w-4 h-4 text-amber-warning shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-amber-warning/80 leading-relaxed uppercase tracking-tight">
                                    Konfigurasi ini bersifat global untuk semua analis di workspace. Perubahan akan berlaku pada siklus berikutnya.
                                </p>
                            </div>

                            {/* Tombol simpan */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowKonfigModal(false)}
                                    className="flex-1 py-3.5 rounded-xl bg-dark-800 hover:bg-white/5 text-dark-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-white/5 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleKonfigSave}
                                    disabled={konfigSaved}
                                    className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 ${
                                        konfigSaved ? "bg-status-success text-white" : "bg-hyper-violet hover:bg-hyper-violet/80 text-white"
                                    }`}
                                >
                                    {konfigSaved ? <><Check className="w-4 h-4" /> Tersimpan!</> : "Simpan Konfigurasi"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
