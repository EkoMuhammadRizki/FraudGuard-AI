"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { formatCurrency, getRiskColor, getRiskBgColor } from "@/pustaka/utilitas";
import { Activity, Siren, CheckCircle, Target, Zap, Cpu, ShieldAlert, ShieldCheck, ArrowRight, AlertTriangle, X } from "lucide-react";
import InfoTooltip from "@/komponen/ui/info-tooltip";
import ModelStatusBadge from "@/komponen/ui/model-status-badge";
import type { XaiFeature } from "@/pustaka/data-fraudguard";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const PetaAncaman = dynamic(() => import("@/komponen/dasbor/PetaAncaman"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[400px] bg-dark-950/40 border border-white/5 rounded-[1.5rem] flex items-center justify-center text-white font-bold uppercase tracking-widest text-xs">
            Memuat Peta GIS...
        </div>
    )
});

import { dashboardSummary, transactionFeed, investigationDetails } from "@/pustaka/data-fraudguard";

// ─── Kamus XAI UX Writer (sama dengan halaman Transaksi) ────────────────────
const reasonExplanations: Record<string, { label: string; desc: string }> = {
    "Nominal mendekati saldo akun": {
        label: "Rasio Nominal & Saldo Kritis",
        desc: "Nominal transfer yang dikirimkan menguras hampir seluruh sisa saldo di rekening pengirim. Pola ini sangat tidak biasa untuk profil transaksi nasabah tersebut dan sering kali terjadi pada upaya pembajakan akun (Account Takeover) untuk menguras dana."
    },
    "IP atau device ada di threat intelligence": {
        label: "Akses Perangkat/Jaringan Mencurigakan",
        desc: "Alamat IP atau identitas perangkat yang digunakan untuk transaksi ini terdaftar dalam database intelijen ancaman siber (threat blacklist). Terdeteksi adanya penggunaan VPN/Proxy publik atau tanda kloning perangkat."
    },
    "Nominal transaksi outlier": {
        label: "Nominal di Luar Kebiasaan (Outlier)",
        desc: "Nilai nominal transaksi melampaui batas wajar rata-rata historis transaksi harian pemegang rekening. Deviasi nilai transaksi yang besar ini mengindikasikan potensi adanya transfer paksaan atau pencurian."
    },
    "Banyak percobaan login": {
        label: "Percobaan Login Berulang",
        desc: "Terdeteksi beberapa kali kegagalan login sesaat sebelum transaksi dilakukan. Ini merupakan tanda kuat dari upaya pembobolan kata sandi secara paksa (brute-force) atau tebakan kredensial nasabah."
    },
    "Rekening penerima terhubung banyak pengirim": {
        label: "Indikasi Rekening Penampung (Mule Account)",
        desc: "Rekening tujuan (penerima) menerima transfer dana dari banyak akun pengirim yang berbeda dalam kurun waktu singkat. Pola ini mengarah kuat pada aktivitas pencucian uang melalui jaringan rekening keledai (money mule)."
    },
    "Durasi transaksi sangat cepat": {
        label: "Kecepatan Alur Tidak Wajar (Velocity)",
        desc: "Proses pengisian formulir hingga pengiriman dana terjadi dalam hitungan milidetik. Karakteristik ini tidak mencerminkan perilaku manual manusia dan terindikasi kuat dikendalikan oleh bot atau script otomatis."
    }
};

const getReasonExplanation = (name: string) =>
    reasonExplanations[name] ?? {
        label: name,
        desc: "Model AI mendeteksi anomali pada faktor ini sebagai indikator tambahan yang memerlukan penelaahan analis lebih lanjut.",
    };

// ─── Data ────────────────────────────────────────────────────────────────────
const statsData = [
    { label: "Transaksi Dataset", value: dashboardSummary.totalTransactions.toLocaleString("id-ID"), change: "Dataset MVP", positive: true, icon: <Activity className="w-8 h-8" strokeWidth={2} /> },
    { label: "Fraud Terdeteksi", value: dashboardSummary.fraudLabels.toLocaleString("id-ID"), change: `F1: ${(dashboardSummary.f1Score * 100).toFixed(1)}%`, positive: true, icon: <Siren className="w-8 h-8 text-status-error" strokeWidth={2} /> },
    { label: "False Positive Rate", value: `${(dashboardSummary.falsePositiveRate * 100).toFixed(2)}%`, change: `Threshold ${dashboardSummary.selectedThreshold}`, positive: true, icon: <CheckCircle className="w-8 h-8 text-status-success" strokeWidth={2} /> },
    { label: "PR-AUC Model", value: `${(dashboardSummary.prAuc * 100).toFixed(1)}%`, change: "XGBoost MVP", positive: true, icon: <Target className="w-8 h-8" strokeWidth={2} /> },
];

const transaksiData = transactionFeed.slice(0, 7);

const chartData = [
    { month: "Jan", rate: 18.5 }, { month: "Feb", rate: 15.2 }, { month: "Mar", rate: 12.8 },
    { month: "Apr", rate: 10.1 }, { month: "Mei", rate: 7.5 }, { month: "Jun", rate: 5.3 },
    { month: "Jul", rate: 4.1 }, { month: "Agu", rate: 3.2 }, { month: "Sep", rate: 2.8 },
    { month: "Okt", rate: 2.4 }, { month: "Nov", rate: 2.1 },
    { month: "Des", rate: parseFloat((dashboardSummary.falsePositiveRate * 100).toFixed(2)) },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-800 border border-dark-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
                <p className="text-dark-200 text-sm font-medium mb-1">Bulan: {label}</p>
                <p className="text-primary-blue-light text-sm font-bold">Rate: {payload[0].value}%</p>
            </div>
        );
    }
    return null;
};

const MODEL_PROFILES = [
    {
        id: "ensemble",
        name: "Meta Ensemble Stacker",
        shortName: "Meta Ensemble",
        color: "#06B6D4", // Neon Cyan
        f1Score: "82.5%",
        fpr: "0.68%",
        prAuc: "89.4%",
        threshold: "0.3374",
        status: "TEROPTIMALISASI",
        data: [
            { month: "Jan", rate: 18.5 }, { month: "Feb", rate: 15.2 }, { month: "Mar", rate: 12.8 },
            { month: "Apr", rate: 10.1 }, { month: "Mei", rate: 7.5 }, { month: "Jun", rate: 5.3 },
            { month: "Jul", rate: 4.1 }, { month: "Agu", rate: 3.2 }, { month: "Sep", rate: 2.8 },
            { month: "Okt", rate: 2.4 }, { month: "Nov", rate: 1.8 }, { month: "Des", rate: 0.68 }
        ]
    },
    {
        id: "xgboost",
        name: "XGBoost Binary Pipeline",
        shortName: "XGBoost",
        color: "#3B82F6", // Primary Blue
        f1Score: "80.2%",
        fpr: "1.12%",
        prAuc: "87.1%",
        threshold: "0.3800",
        status: "STABIL",
        data: [
            { month: "Jan", rate: 22.0 }, { month: "Feb", rate: 18.1 }, { month: "Mar", rate: 15.0 },
            { month: "Apr", rate: 12.4 }, { month: "Mei", rate: 9.8 }, { month: "Jun", rate: 7.2 },
            { month: "Jul", rate: 5.4 }, { month: "Agu", rate: 4.1 }, { month: "Sep", rate: 3.2 },
            { month: "Okt", rate: 2.5 }, { month: "Nov", rate: 1.9 }, { month: "Des", rate: 1.12 }
        ]
    },
    {
        id: "lightgbm",
        name: "LightGBM Multiclass Model",
        shortName: "LightGBM",
        color: "#8B5CF6", // Hyper Violet
        f1Score: "79.5%",
        fpr: "1.45%",
        prAuc: "85.8%",
        threshold: "0.4100",
        status: "KLASIFIKASI MULTI",
        data: [
            { month: "Jan", rate: 24.5 }, { month: "Feb", rate: 20.2 }, { month: "Mar", rate: 16.9 },
            { month: "Apr", rate: 13.5 }, { month: "Mei", rate: 10.8 }, { month: "Jun", rate: 8.4 },
            { month: "Jul", rate: 6.2 }, { month: "Agu", rate: 4.8 }, { month: "Sep", rate: 3.6 },
            { month: "Okt", rate: 2.8 }, { month: "Nov", rate: 2.1 }, { month: "Des", rate: 1.45 }
        ]
    },
    {
        id: "gnn",
        name: "Graph ML Classifier (GNN)",
        shortName: "GNN Graph",
        color: "#10B981", // Emerald Green
        f1Score: "84.1%",
        fpr: "0.52%",
        prAuc: "91.2%",
        threshold: "0.2950",
        status: "TOPOLOGI MULE",
        data: [
            { month: "Jan", rate: 16.2 }, { month: "Feb", rate: 13.0 }, { month: "Mar", rate: 10.5 },
            { month: "Apr", rate: 8.1 }, { month: "Mei", rate: 6.0 }, { month: "Jun", rate: 4.2 },
            { month: "Jul", rate: 3.1 }, { month: "Agu", rate: 2.3 }, { month: "Sep", rate: 1.8 },
            { month: "Okt", rate: 1.2 }, { month: "Nov", rate: 0.8 }, { month: "Des", rate: 0.52 }
        ]
    },
    {
        id: "sdk",
        name: "Mobile SDK Telemetry",
        shortName: "SDK Biometric",
        color: "#F59E0B", // Amber Warning
        f1Score: "88.6%",
        fpr: "0.35%",
        prAuc: "93.8%",
        threshold: "0.2500",
        status: "BEHAVIORAL LIVE",
        data: [
            { month: "Jan", rate: 14.0 }, { month: "Feb", rate: 11.2 }, { month: "Mar", rate: 8.8 },
            { month: "Apr", rate: 6.5 }, { month: "Mei", rate: 4.8 }, { month: "Jun", rate: 3.2 },
            { month: "Jul", rate: 2.2 }, { month: "Agu", rate: 1.5 }, { month: "Sep", rate: 1.0 },
            { month: "Okt", rate: 0.7 }, { month: "Nov", rate: 0.5 }, { month: "Des", rate: 0.35 }
        ]
    }
];

export default function RingkasanPage() {
    const router = useRouter();
    
    // Dynamic states from MongoDB
    const [selectedModelId, setSelectedModelId] = useState("ensemble");
    const activeModel = MODEL_PROFILES.find(m => m.id === selectedModelId) || MODEL_PROFILES[0];
    const [stats, setStats] = useState(dashboardSummary);
    const [transaksiList, setTransaksiList] = useState<any[]>([]);
    const [liveCount, setLiveCount] = useState(dashboardSummary.totalTransactions);
    const [selectedTxn, setSelectedTxn] = useState<any>(null);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    // Fetch summary stats on mount
    useEffect(() => {
        fetch("/api/dashboard/stats")
            .then(res => res.json())
            .then(data => {
                if (data.stats) {
                    setStats(data.stats);
                    setLiveCount(data.stats.totalTransactions);
                }
                if (data.transactions) {
                    setTransaksiList(data.transactions);
                }
            })
            .catch(err => console.error("Error loading live stats from MongoDB:", err));
    }, []);

    // Fetch investigation record details for selected transaction on-demand
    useEffect(() => {
        if (selectedTxn) {
            setSelectedRecord(null);
            fetch(`/api/dashboard/investigation?id=${selectedTxn.id}`)
                .then(res => res.json())
                .then(data => {
                    setSelectedRecord(data);
                })
                .catch(err => console.error("Error loading investigation details:", err));
        } else {
            setSelectedRecord(null);
        }
    }, [selectedTxn]);

    // Keep liveCount synced with stats.totalTransactions directly from MongoDB Atlas
    useEffect(() => {
        if (stats?.totalTransactions) {
            setLiveCount(stats.totalTransactions);
        }
    }, [stats.totalTransactions]);

    // Close modal on ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedTxn(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const statsData = [
        { label: "Transaksi Dataset", value: liveCount.toLocaleString("id-ID"), change: "Dataset MongoDB", positive: true, icon: <Activity className="w-8 h-8" strokeWidth={2} /> },
        { label: "Fraud Terdeteksi", value: stats.fraudLabels.toLocaleString("id-ID"), change: `F1: ${(stats.f1Score * 100).toFixed(1)}%`, positive: true, icon: <Siren className="w-8 h-8 text-status-error" strokeWidth={2} /> },
        { label: "False Positive Rate", value: `${(stats.falsePositiveRate * 100).toFixed(2)}%`, change: `Threshold ${stats.selectedThreshold}`, positive: true, icon: <CheckCircle className="w-8 h-8 text-status-success" strokeWidth={2} /> },
        { label: "PR-AUC Model", value: `${(stats.prAuc * 100).toFixed(1)}%`, change: "Ensemble Live", positive: true, icon: <Target className="w-8 h-8" strokeWidth={2} /> },
    ];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Tahan: "bg-status-error/10 text-status-error border border-status-error/20",
            Eskalasi: "bg-status-error/10 text-status-error border border-status-error/20",
            Lolos: "bg-status-success/10 text-status-success border border-status-success/20",
            Review: "bg-amber-warning/10 text-amber-warning border border-amber-warning/20",
            Investigasi: "bg-amber-warning/10 text-amber-warning border border-amber-warning/20",
        };
        return styles[status] || "bg-dark-600/10 text-dark-300 border border-dark-600/20";
    };

    const getRiskLabelColor = (risk: string) => {
        switch (risk) {
            case "kritis": return "text-status-error bg-status-error/5 border-status-error/20";
            case "tinggi": case "sedang": return "text-amber-warning bg-amber-warning/5 border-amber-warning/20";
            default: return "text-status-success bg-status-success/5 border-status-success/20";
        }
    };


    return (
        <>
            <div className="space-y-10 min-w-0 overflow-hidden animate-fade-in pb-12">
                {/* ── HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[1.1]">Ringkasan <span className="text-primary-blue block sm:inline">Operasional</span></h1>
                        <p className="text-dark-400 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            <span className="w-1.5 h-1.5 bg-neon-cyan/50 rounded-full shrink-0" />
                            Pemantauan infrastruktur: <span className="text-white">Aktif</span>
                        </p>
                    </div>

                    {/* Header Controls: Single Unified Capsule Bar */}
                    <div className="flex items-center gap-3 shrink-0">
                        <ModelStatusBadge showDetails pollInterval={60000} />
                    </div>
                </div>

                {/* ── STATS CARDS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsData.map((stat, index) => (
                        <div key={stat.label} className="glass-panel p-6 rounded-2xl transition-all hover:bg-white/5 group cursor-default relative overflow-hidden" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-dark-900 border border-white/5 flex items-center justify-center text-2xl shadow-sm group-hover:text-primary-blue transition-colors">
                                    {stat.icon}
                                </div>
                                <div className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${stat.positive ? "bg-status-success/10 text-status-success border-status-success/20" : "bg-status-error/10 text-status-error border-status-error/20"} tracking-widest uppercase`}>
                                    {stat.change}
                                </div>
                            </div>
                            <div className="relative z-10">
                                <div className="text-4xl font-black text-white tracking-tighter mb-2 tabular-nums">
                                    {index === 0 ? liveCount.toLocaleString("id-ID") : stat.value}
                                </div>
                                <div className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] group-hover:text-neon-cyan transition-colors">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── MAIN VISUALIZATIONS ── */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                    {/* Peta Ancaman */}
                    <div className="xl:col-span-3 glass-panel p-6 md:p-10 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-blue to-transparent opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic">Peta <span className="text-primary-blue">Ancaman Geografis</span></h3>
                                    <InfoTooltip text="Peta persebaran ancaman fraud secara geografis. Setiap titik mewakili node transaksi mencurigakan yang terdeteksi di suatu wilayah, dengan warna menunjukkan tingkat keparahan." />
                                </div>
                                <p className="text-[10px] font-bold text-dark-500 mt-2 uppercase tracking-[0.2em]">Kepadatan titik panas berdasarkan node regional</p>
                            </div>
                            <div className="flex items-center gap-4 glass-panel px-4 py-3 sm:py-2 rounded-xl border-white/5 bg-dark-950/50 w-fit">
                                {[
                                    { color: "bg-status-success", label: "AMAN" },
                                    { color: "bg-amber-warning", label: "PERINGATAN" },
                                    { color: "bg-status-error", label: "KRITIS" }
                                ].map(item => (
                                    <div key={item.label} className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                                        <span className="text-[10px] sm:text-[9px] font-black text-dark-400 tracking-tighter">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative w-full h-[400px] rounded-[1.5rem] overflow-hidden border border-white/5 shadow-inner" style={{ zIndex: 10 }}>
                            <PetaAncaman />
                        </div>
                    </div>

                    {/* Chart FP / Presisi Model Dinamis */}
                    <div className="xl:col-span-2 glass-panel p-6 md:p-10 rounded-[2.5rem] relative group">
                        <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-transparent via-hyper-violet to-transparent opacity-20 group-hover:opacity-40 transition-opacity" />
                        
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-tight">Presisi <br className="hidden xl:block 2xl:hidden" /><span className="text-hyper-violet">Model</span></h3>
                                    <InfoTooltip text="Grafik tren penurunan False Positive Rate (FPR) sepanjang tahun. Klik tab model di bawah untuk melihat performa spesifik sub-model Machine Learning." />
                                </div>
                                <span className="px-3 py-1.5 rounded-xl bg-status-success/10 text-status-success text-[10px] font-black border border-status-success/20 tracking-widest shrink-0 uppercase">
                                    {activeModel.status} ({activeModel.fpr})
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-dark-500 uppercase tracking-[0.2em]">Tren pengurangan FP Rate (Tahunan)</p>

                            {/* Sub-Model Switcher Tabs */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                                {MODEL_PROFILES.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedModelId(m.id)}
                                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap border ${
                                            selectedModelId === m.id
                                                ? "bg-white/10 text-white border-white/20 shadow-lg scale-105"
                                                : "bg-dark-950/40 text-dark-400 border-white/5 hover:text-white hover:bg-white/5"
                                        }`}
                                        style={{ color: selectedModelId === m.id ? m.color : undefined }}
                                    >
                                        {m.shortName}
                                    </button>
                                ))}
                            </div>

                            {/* Model Quick Metrics Pill */}
                            <div className="grid grid-cols-3 gap-2 bg-dark-950/50 p-2.5 rounded-2xl border border-white/5 text-[9px] font-mono">
                                <div>
                                    <span className="text-dark-500 uppercase block text-[8px]">F1-Score</span>
                                    <span className="font-bold text-white text-xs">{activeModel.f1Score}</span>
                                </div>
                                <div>
                                    <span className="text-dark-500 uppercase block text-[8px]">FPR Rate</span>
                                    <span className="font-bold text-status-success text-xs">{activeModel.fpr}</span>
                                </div>
                                <div>
                                    <span className="text-dark-500 uppercase block text-[8px]">PR-AUC</span>
                                    <span className="font-bold text-neon-cyan text-xs">{activeModel.prAuc}</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-64 w-full mt-4 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activeModel.data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id={`colorRate_${activeModel.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={activeModel.color} stopOpacity={0.5} />
                                            <stop offset="95%" stopColor={activeModel.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 10, fontWeight: 700 }} dy={10} strokeWidth={0} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `${v}%`} strokeWidth={0} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="rate" stroke={activeModel.color} strokeWidth={4} fill={`url(#colorRate_${activeModel.id})`} activeDot={{ r: 8, fill: activeModel.color, stroke: "#020617", strokeWidth: 3 }} animationDuration={1200} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ── FEED TRANSAKSI MENTAH ── */}
                <div id="transaksi" className="glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-blue to-transparent opacity-10 group-hover:opacity-30 transition-opacity" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-blue/10 rounded-xl border border-primary-blue/20">
                                <Zap className="w-5 h-5 text-primary-blue" strokeWidth={2} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-white tracking-tight uppercase">Feed <span className="text-primary-blue">Transaksi Mentah</span></h3>
                                    <InfoTooltip text="Live stream transaksi terbaru yang diproses sistem. Klik baris untuk melihat penjelasan AI. Menampilkan ID node, timestamp, identitas pengirim & penerima, nominal, tingkat ancaman, dan status tindakan secara real-time." />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                                    <span className="text-[10px] font-bold text-dark-500 uppercase tracking-wider">Protokol Dekripsi Langsung Aktif Klik baris untuk analisis AI</span>
                                </div>
                            </div>
                        </div>
                        <Link href="/dasbor/transaksi" className="px-6 py-3 rounded-xl bg-dark-900/50 hover:bg-white/5 text-dark-300 hover:text-white text-xs font-bold transition-all border border-white/5 active:scale-[0.98] uppercase tracking-widest">
                            Akses Database Lengkap
                        </Link>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-left text-xs font-black text-dark-500 uppercase tracking-[0.2em]">
                                    <th className="pb-4 pl-6">ID Node</th>
                                    <th className="pb-4">Waktu</th>
                                    <th className="pb-4">Node Sumber</th>
                                    <th className="pb-4">Node Tujuan</th>
                                    <th className="pb-4 text-right">Volume</th>
                                    <th className="pb-4 text-center">Tingkat Ancaman</th>
                                    <th className="pb-4 text-center pr-6">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaksiList.map((txn) => (
                                    <tr
                                        key={txn.id}
                                        onClick={() => setSelectedTxn(txn)}
                                        className="group/row cursor-pointer transition-all hover:scale-[1.002]"
                                        title="Klik untuk melihat penjelasan AI"
                                    >
                                        <td className="py-5 pl-6 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-l border-white/5 first:rounded-l-2xl">
                                            <span className="text-xs font-black font-mono text-neon-cyan tracking-tight group-hover/row:glow-cyan transition-all">{txn.id}</span>
                                        </td>
                                        <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-white/5 text-[10px] font-bold text-dark-400 font-mono tracking-tighter uppercase">{txn.waktu}</td>
                                        <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-white/5 text-xs font-black text-white tracking-tight uppercase">{txn.pengirim}</td>
                                        <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-white/5 text-xs font-black text-white tracking-tight uppercase">{txn.penerima}</td>
                                        <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-white/5 text-xs font-black text-white text-right font-mono tracking-tighter">
                                            {formatCurrency(txn.jumlah)}
                                        </td>
                                        <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-white/5 text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getRiskBgColor(txn.risiko)} ${getRiskColor(txn.risiko)}`}>
                                                {txn.risiko}
                                            </span>
                                        </td>
                                        <td className="py-5 pr-6 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-r border-white/5 last:rounded-r-2xl text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusBadge(txn.status)}`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                MODAL EXPLANATION AI — identik dengan Tab Transaksi
            ══════════════════════════════════════════════════════ */}
            {selectedTxn && (
                <div
                    className="fixed inset-0 z-[2000] bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fade-in"
                    onClick={() => setSelectedTxn(null)}
                >
                    <div
                        className="bg-dark-900 border border-white/10 rounded-[2.5rem] max-w-3xl w-full max-h-[85vh] md:max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col animate-scale-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Garis cahaya atas */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-blue to-transparent opacity-40" />

                        {/* Header Modal */}
                        <div className="px-8 pt-8 pb-5 flex items-start justify-between border-b border-white/5">
                            <div>
                                <div className="flex items-center gap-2.5 text-neon-cyan mb-1.5">
                                    <Cpu className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] font-sans">Explanation AI (XAI)</span>
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase font-sans">
                                    Analisis Transaksi <span className="text-neon-cyan">{selectedTxn.id}</span>
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedTxn(null)}
                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 flex items-center justify-center text-dark-400 hover:text-white transition-all active:scale-95 cursor-pointer"
                                title="Tutup Modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                            {/* Baris Ringkasan Risiko */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                                {/* Gauge kiri */}
                                <div className="md:col-span-4 bg-dark-950/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                    <div className="text-[9px] font-black text-dark-500 uppercase tracking-widest mb-3">Persentase Risiko</div>
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                                            <circle
                                                cx="50" cy="50" r="40"
                                                stroke={selectedTxn.risiko === "kritis" ? "#EF4444" : selectedTxn.risiko === "rendah" ? "#10B981" : "#F59E0B"}
                                                strokeWidth="8" fill="transparent"
                                                strokeDasharray="251.2"
                                                strokeDashoffset={251.2 - (251.2 * selectedTxn.riskScore) / 100}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center justify-center">
                                            <span className="text-2xl font-black text-white font-mono tracking-tight">{selectedTxn.riskScore}%</span>
                                        </div>
                                    </div>
                                    <span className={`mt-4 inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getRiskLabelColor(selectedTxn.risiko)}`}>
                                        Risiko {selectedTxn.risiko}
                                    </span>
                                </div>

                                {/* Vonis kanan */}
                                <div className="md:col-span-8 bg-dark-950/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="text-[9px] font-black text-dark-500 uppercase tracking-widest mb-1.5">Kesimpulan Penilaian</div>
                                        <h4 className="text-lg font-black text-white leading-snug uppercase tracking-tight">
                                            {selectedTxn.riskScore >= 38 ? (
                                                <span className="text-status-error flex items-center gap-2">
                                                    <ShieldAlert className="w-5 h-5 shrink-0" /> Vonis Model: INDIKASI FRAUD
                                                </span>
                                            ) : (
                                                <span className="text-status-success flex items-center gap-2">
                                                    <ShieldCheck className="w-5 h-5 shrink-0" /> Vonis Model: TRANSAKSI BERSIH
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-xs text-dark-400 font-bold mt-2 uppercase tracking-wide">
                                            Saran Tindakan: <span className="text-white font-extrabold">{selectedTxn.status === "Lolos" ? "Loloskan Transaksi" : `${selectedTxn.status} untuk Peninjauan`}</span>
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-dark-400 font-bold leading-relaxed font-sans">
                                        FDS Engine menyimpulkan tingkat kerawanan transaksi ini adalah <span className="text-white font-extrabold">{selectedTxn.riskScore}%</span> berdasarkan bobot anomali taktis pada sesi transaksi pengirim.
                                    </div>
                                </div>
                            </div>

                            {/* Indikator Anomali XAI */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-warning" />
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest font-sans">Indikator Anomali Terdeteksi (XAI)</h4>
                                </div>
                                <div className="space-y-3.5">
                                    {selectedRecord && selectedRecord.xaiFeatures && selectedRecord.xaiFeatures.length > 0 ? (
                                        selectedRecord.xaiFeatures.map((feat: XaiFeature, idx: number) => {
                                            const exp = getReasonExplanation(feat.name);
                                            return (
                                                <div key={idx} className="p-5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row gap-4 sm:items-start">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-xs font-black text-white tracking-tight font-sans">{exp.label}</span>
                                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${feat.impact === "tinggi" ? "bg-status-error/10 text-status-error border border-status-error/20" : "bg-amber-warning/10 text-amber-warning border border-amber-warning/20"}`}>
                                                                Dampak {feat.impact}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-dark-400 font-bold leading-relaxed font-sans">{exp.desc}</p>
                                                    </div>
                                                    <div className="w-24 shrink-0 flex flex-col justify-center pt-2 sm:pt-0">
                                                        <div className="flex justify-between text-[9px] font-black text-dark-500 uppercase tracking-widest mb-1.5">
                                                            <span>Bobot</span>
                                                            <span>{Math.round(feat.importance * 100)}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-dark-950 rounded-full overflow-hidden border border-white/5">
                                                            <div
                                                                className={`h-full rounded-full ${feat.impact === "tinggi" ? "bg-status-error" : "bg-amber-warning"}`}
                                                                style={{ width: `${feat.importance * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 text-center text-xs font-black text-dark-400 uppercase tracking-wider">
                                            Tidak ada indikator anomali khusus yang melampaui batas sensitivitas model.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Metadata Transaksi */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest font-sans">Metadata Sesi Transaksi</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-dark-950/30 border border-white/5 rounded-2xl p-5 font-mono text-[10px] text-dark-300">
                                    {[
                                        { label: "ID Transaksi", value: selectedTxn.id, cyan: true },
                                        { label: "Waktu", value: selectedTxn.waktu },
                                        { label: "Volume Transaksi", value: formatCurrency(selectedTxn.jumlah), span2: true },
                                        { label: "Rekening Pengirim", value: selectedTxn.pengirim },
                                        { label: "Rekening Penerima", value: selectedTxn.penerima },
                                        { label: "Lokasi Geografis", value: selectedRecord?.detail?.lokasi || "Unknown" },
                                        { label: "Alamat IP", value: selectedRecord?.detail?.ip || "Unknown" },
                                        { label: "Identitas Perangkat", value: selectedRecord?.detail?.device || "Unknown" },
                                        { label: "Tipe Transfer", value: selectedRecord?.detail?.metode || "Transfer" },
                                    ].map((item, i) => (
                                        <div key={i} className={`space-y-0.5 ${item.span2 ? "col-span-2 md:col-span-1" : ""}`}>
                                            <span className="text-dark-500 font-black uppercase tracking-wider block">{item.label}</span>
                                            <span className={`font-black ${item.cyan ? "text-neon-cyan" : "text-white"}`}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="px-8 py-5 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <button
                                onClick={() => setSelectedTxn(null)}
                                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-dark-800 hover:bg-white/5 text-dark-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-white/5 hover:border-white/10 transition-all active:scale-[0.98]"
                            >
                                Tutup Panel
                            </button>
                            <button
                                onClick={() => {
                                    const id = selectedTxn.id;
                                    setSelectedTxn(null);
                                    router.push(`/dasbor/investigasi?txid=${id}`);
                                }}
                                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-primary-blue text-white font-black text-xs uppercase tracking-wider hover:bg-primary-blue-hover transition-all active:scale-[0.98]"
                            >
                                Akses Investigasi Detail <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
