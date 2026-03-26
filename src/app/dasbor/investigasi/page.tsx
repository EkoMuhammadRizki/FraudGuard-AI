"use client";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/pustaka/utilitas";
import { gunakanNotifikasi } from "@/fungsi/gunakanNotifikasi";
import AlertKustom from "@/komponen/feedback/alert-kustom";
import { Cpu } from "lucide-react";
import InfoTooltip from "@/komponen/ui/info-tooltip";

// Network topology nodes for GNN visualization
const gnnNodes = [
    { id: "A", label: "Ahmad R.", x: 300, y: 80, type: "suspect", risk: 92 },
    { id: "B", label: "Bank BCA", x: 150, y: 180, type: "institution", risk: 5 },
    { id: "C", label: "Unknown", x: 450, y: 180, type: "suspect", risk: 88 },
    { id: "D", label: "Budi S.", x: 100, y: 300, type: "normal", risk: 12 },
    { id: "E", label: "PT Shell", x: 250, y: 300, type: "entity", risk: 45 },
    { id: "F", label: "Offshore Co.", x: 450, y: 300, type: "suspect", risk: 95 },
    { id: "G", label: "Maya S.", x: 500, y: 80, type: "suspect", risk: 78 },
    { id: "H", label: "CV Global", x: 350, y: 400, type: "entity", risk: 55 },
];

const gnnEdges = [
    { from: "A", to: "B", weight: 3, suspicious: false },
    { from: "A", to: "C", weight: 8, suspicious: true },
    { from: "A", to: "E", weight: 5, suspicious: true },
    { from: "B", to: "D", weight: 2, suspicious: false },
    { from: "C", to: "F", weight: 9, suspicious: true },
    { from: "C", to: "G", weight: 6, suspicious: true },
    { from: "E", to: "H", weight: 4, suspicious: false },
    { from: "F", to: "H", weight: 7, suspicious: true },
    { from: "G", to: "C", weight: 5, suspicious: true },
];

// XAI feature importance
const xaiFeatures = [
    { name: "Jumlah Transaksi Anomali", importance: 0.92, impact: "tinggi" },
    { name: "Frekuensi Waktu Malam", importance: 0.85, impact: "tinggi" },
    { name: "Koneksi ke Entitas Shell", importance: 0.78, impact: "tinggi" },
    { name: "Perbedaan Lokasi IP", importance: 0.65, impact: "sedang" },
    { name: "Riwayat Akun Baru", importance: 0.52, impact: "sedang" },
    { name: "Volume Transaksi Harian", importance: 0.41, impact: "sedang" },
    { name: "Pattern Velocity", importance: 0.33, impact: "rendah" },
    { name: "Device Fingerprint Match", importance: 0.18, impact: "rendah" },
];

const transaksiDetail = {
    id: "TXN-001",
    pengirim: "Ahmad Rizki",
    penerima: "Unknown Entity",
    jumlah: 45000000,
    waktu: "2026-03-26 12:45:23",
    metode: "Transfer Bank",
    lokasi: "Jakarta Selatan",
    ip: "192.168.1.xxx",
    device: "Android 14 - Samsung S24",
    userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.113 Mobile Safari/537.36",
    riskScore: 92,
};

export default function InvestigasiPage() {
    const { modal, tampilSukses, tampilKonfirmasi, tampilError, tutupModal } = gunakanNotifikasi();
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [currentUserAgent, setCurrentUserAgent] = useState<string>("Detecting...");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setCurrentUserAgent(window.navigator.userAgent);
        }
    }, []);

    const handleBlokir = () => {
        tampilKonfirmasi(
            "Konfirmasi Blokir",
            `Apakah Anda yakin ingin memblokir transaksi ${transaksiDetail.id} senilai ${formatCurrency(transaksiDetail.jumlah)}? Tindakan ini akan membekukan sementara akun terkait.`,
            () => {
                tampilSukses("Transaksi Diblokir!", "Transaksi telah berhasil diblokir dan akun terkait telah dibekukan sementara.");
            }
        );
    };

    const handleSetujui = () => {
        tampilSukses("Transaksi Disetujui", "Transaksi telah ditandai sebagai valid dan diteruskan untuk pemrosesan.");
    };

    const handleFlag = () => {
        tampilError("Ditandai untuk Review", "Transaksi telah ditandai dan akan dikirim ke tim investigasi senior untuk review lebih lanjut.");
    };

    const getNodeColor = (type: string) => {
        switch (type) {
            case "suspect": return "#F43F5E";
            case "institution": return "#3B82F6";
            case "entity": return "#F59E0B";
            default: return "#10B981";
        }
    };

    const getNodeById = (id: string) => gnnNodes.find((n) => n.id === id);

    return (
        <>
            <AlertKustom modal={modal} onTutup={tutupModal} />

            <div className="space-y-10 min-w-0 overflow-hidden animate-fade-in pb-12">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[1.1] italic">Analisis <span className="text-primary-blue">Forensik</span></h1>
                        <p className="text-dark-400 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            <span className="w-1.5 h-1.5 bg-status-error/50 rounded-full animate-pulse shrink-0" />
                            Investigasi mendalam: <span className="text-white">TXN-001 ANOMALI TERDETEKSI</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <button onClick={handleSetujui} className="group relative px-6 py-3 rounded-2xl bg-status-success/10 hover:bg-status-success/20 text-status-success border border-status-success/20 font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg">
                            <div className="absolute inset-0 bg-status-success/5 blur-xl group-hover:opacity-100 opacity-0 transition-opacity" />
                            ✓ Setujui Bersih
                        </button>
                        <button onClick={handleFlag} className="group relative px-6 py-3 rounded-2xl bg-amber-warning/10 hover:bg-amber-warning/20 text-amber-warning border border-amber-warning/20 font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg">
                            <div className="absolute inset-0 bg-amber-warning/5 blur-xl group-hover:opacity-100 opacity-0 transition-opacity" />
                            ⚑ Tandai Investigasi
                        </button>
                        <button onClick={handleBlokir} className="group relative px-6 py-3 rounded-2xl bg-status-error/20 hover:bg-status-error/30 text-white border border-status-error/30 font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                            <div className="absolute inset-0 bg-status-error/10 blur-xl group-hover:opacity-100 opacity-0 transition-opacity" />
                            ✕ Hentikan & Blokir
                        </button>
                    </div>
                </div>

                {/* Core Data + Score */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Detail Panel */}
                    <div className="lg:col-span-2 glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-blue to-transparent opacity-20" />
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-white tracking-widest uppercase mb-0 italic">Metadata <span className="text-primary-blue">Transaction</span></h3>
                            <InfoTooltip text="Detail lengkap transaksi yang sedang diinvestigasi: ID unik, waktu eksekusi, identitas pengirim & penerima, nominal, metode transfer, lokasi geografis, IP address, dan fingerprint perangkat." />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
                            {[
                                { label: "Identifier", value: transaksiDetail.id, mono: true, cyan: true },
                                { label: "Waktu Eksekusi", value: transaksiDetail.waktu },
                                { label: "Identitas Sumber", value: transaksiDetail.pengirim, white: true },
                                { label: "Akun Tujuan", value: transaksiDetail.penerima, white: true },
                                { label: "Volume Muatan", value: formatCurrency(transaksiDetail.jumlah), error: true },
                                { label: "Protokol Transmisi", value: transaksiDetail.metode },
                                { label: "Lokasi Geografis", value: transaksiDetail.lokasi },
                                { label: "Alamat Jaringan (IP)", value: transaksiDetail.ip, mono: true },
                                { label: "Tanda Tangan Terminal", value: transaksiDetail.device },
                                { label: "User Agent", value: currentUserAgent, mono: true },
                            ].map((item) => (
                                <div key={item.label} className="group/item">
                                    <div className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] mb-2 group-hover/item:text-primary-blue transition-colors">{item.label}</div>
                                    <div className={`text-sm font-black break-words ${
                                        item.error ? "text-status-error text-xl" : 
                                        item.cyan ? "font-mono text-neon-cyan" : 
                                        item.white ? "text-white" : "text-dark-200"
                                    }`}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Threat Matrix Score */}
                    <div className="glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] flex flex-col items-center justify-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-status-error/5 group-hover:bg-status-error/10 transition-colors duration-700" />
                        <div className="flex items-center gap-2 mb-10 relative z-10">
                            <h3 className="text-[10px] font-black text-dark-400 uppercase tracking-[0.3em]">Matriks Intensitas Ancaman</h3>
                            <InfoTooltip text="Skor risiko 0–100 yang dihitung oleh Neural Engine. Skor di atas 80 dikategorikan sebagai KRITIS dan merekomendasikan pemblokiran segera." />
                        </div>
                        
                        <div className="relative w-56 h-56 z-10">
                            <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                                <circle
                                    cx="80" cy="80" r="70" fill="none" stroke="url(#riskGradient)" strokeWidth="12" strokeLinecap="round"
                                    strokeDasharray={`${(transaksiDetail.riskScore / 100) * 440} 440`}
                                    className="animate-gauge"
                                />
                                <defs>
                                    <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#F43F5E" />
                                        <stop offset="100%" stopColor="#FB7185" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-black text-white tracking-tighter">{transaksiDetail.riskScore}</span>
                                <span className="text-[10px] font-black text-status-error uppercase tracking-[0.2em] mt-1">PERCENTILE</span>
                            </div>
                        </div>

                        <div className="mt-10 px-8 py-3 rounded-2xl bg-status-error/20 text-white text-xs font-black border border-status-error/30 tracking-widest uppercase relative z-10 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                            Status: ANCAMAN KRITIS
                        </div>
                        <p className="text-dark-500 text-[10px] font-bold mt-6 text-center leading-relaxed relative z-10 max-w-[200px] uppercase tracking-tighter">
                            Neural Engine menunjukkan kecocokan pola kepercayaan tinggi untuk <span className="text-white">Pencucian Uang Terstruktur</span>
                        </p>
                    </div>
                </div>

                {/* GNN Topo (Visual Graph) */}
                <div className="glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-transparent via-neon-cyan to-transparent opacity-10 group-hover:opacity-30" />
                    
                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 mb-10">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Grafik <span className="text-neon-cyan">Topologi Neural</span></h3>
                                <InfoTooltip text="Visualisasi hubungan antar entitas menggunakan Graph Neural Network (GNN). Garis putus-putus merah menandai koneksi mencurigakan. Klik node untuk melihat skor risiko tiap entitas." />
                            </div>
                            <p className="text-[10px] font-bold text-dark-500 mt-2 uppercase tracking-[0.2em]">Analisis relasional mendalam melalui Graph Neural Networks (GNN)</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 glass-panel px-6 py-3 rounded-2xl border-white/5 bg-dark-950/50">
                            {[
                                { color: "bg-status-error", label: "NODE SUSPECT" },
                                { color: "bg-primary-blue", label: "NODE BANK" },
                                { color: "bg-amber-warning", label: "NODE ENTITAS" },
                                { color: "bg-status-success", label: "BERSIH" }
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                                    <span className="text-[9px] font-black text-dark-400 tracking-widest uppercase">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative bg-dark-950/60 rounded-[2rem] border border-white/5 overflow-hidden shadow-inner aspect-[3/4] sm:aspect-[16/9] lg:aspect-[21/9]">
                        <svg viewBox="0 0 600 500" className="w-full h-full p-6 md:p-10 drop-shadow-[0_0_50px_rgba(59,130,246,0.1)]" xmlns="http://www.w3.org/2000/svg">
                            {/* Connection Lines (Edges) */}
                            {gnnEdges.map((edge, i) => {
                                const from = getNodeById(edge.from);
                                const to = getNodeById(edge.to);
                                if (!from || !to) return null;
                                return (
                                    <g key={i}>
                                        <line
                                            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                            stroke={edge.suspicious ? "#F43F5E" : "rgba(148,163,184,0.1)"}
                                            strokeWidth={edge.suspicious ? 3 : 1}
                                            strokeDasharray={edge.suspicious ? "15 5" : "none"}
                                            opacity={edge.suspicious ? 0.6 : 0.3}
                                        >
                                            {edge.suspicious && (
                                                <animate attributeName="stroke-dashoffset" values="40;0" dur="2s" repeatCount="indefinite" />
                                            )}
                                        </line>
                                    </g>
                                );
                            })}

                            {/* Entity Nodes */}
                            {gnnNodes.map((node) => {
                                const color = getNodeColor(node.type);
                                const isSelected = selectedNode === node.id;
                                return (
                                    <g key={node.id} onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)} className="cursor-pointer group/node">
                                        <circle cx={node.x} cy={node.y} r={isSelected ? 50 : 40} fill={color} opacity={isSelected ? 0.2 : 0.05} className="transition-all duration-500">
                                            {node.type === "suspect" && (
                                                <animate attributeName="opacity" values="0.1;0.03;0.1" dur="3s" repeatCount="indefinite" />
                                            )}
                                        </circle>
                                        <circle cx={node.x} cy={node.y} r="25" fill="#020617" stroke={color} strokeWidth={isSelected ? 5 : 3} className="transition-all duration-500" />
                                        <text x={node.x} y={node.y + 7} textAnchor="middle" fill={color} fontSize="16" className="font-black italic">{node.id}</text>
                                        <text x={node.x} y={node.y + 55} textAnchor="middle" fill={isSelected ? "white" : "rgba(226,232,240,0.5)"} fontSize="12" className="font-black uppercase tracking-widest">{node.label}</text>
                                        
                                        {/* Threat Hover Indicator */}
                                        <rect x={node.x + 18} y={node.y - 35} width="32" height="18" rx="6" fill={color} className="opacity-0 group-hover/node:opacity-100 transition-opacity" />
                                        <text x={node.x + 34} y={node.y - 23} textAnchor="middle" fill="white" fontSize="9" className="font-black opacity-0 group-hover/node:opacity-100 transition-opacity">{node.risk}%</text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* XAI Evidence Panel */}
                <div className="glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] relative group">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-hyper-violet to-transparent opacity-10" />
                    
                    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic">Dampak <span className="text-hyper-violet">Fitur SHAP</span></h3>
                                <InfoTooltip text="Explainable AI (XAI) berbasis SHAP values. Menjelaskan faktor apa yang paling mempengaruhi keputusan model. Bar merah = dampak tinggi, kuning = sedang, hijau = rendah." />
                            </div>
                            <p className="text-[10px] font-bold text-dark-500 mt-2 uppercase tracking-[0.2em]">Penalaran keputusan AI yang transparan & pembobotan atribut</p>
                        </div>
                        <div className="px-6 py-2.5 rounded-2xl bg-dark-950 border border-white/5 text-hyper-violet text-[10px] font-black uppercase tracking-widest">
                            Hyper-Param Engine v4.0.1
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-20 gap-y-8">
                        {xaiFeatures.map((feature) => {
                            const barColor = feature.impact === "tinggi" ? "bg-status-error" : feature.impact === "sedang" ? "bg-amber-warning" : "bg-status-success";
                            return (
                                <div key={feature.name} className="group/feat">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-[11px] font-black text-white uppercase tracking-wider group-hover/feat:text-neon-cyan transition-colors">{feature.name}</div>
                                        <div className="text-[10px] font-black font-mono text-dark-500">{(feature.importance * 100).toFixed(0)}%</div>
                                    </div>
                                    <div className="h-2.5 bg-dark-900 rounded-full overflow-hidden p-[1px] border border-white/5 shadow-inner">
                                        <div className={`h-full rounded-full ${barColor} shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-1000`} style={{ width: `${feature.importance * 100}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* AI Narrative Context */}
                    <div className="mt-16 glass-panel p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 group/narrative relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-status-error opacity-40" />
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                            <Cpu className="w-5 h-5 text-neon-cyan" strokeWidth={2.5} />
                            Protokol Logika Naratif
                        </h4>
                        <p className="text-sm font-bold text-dark-400 leading-relaxed uppercase tracking-tight">
                            Neural Matrix menandai <span className="text-status-error">TXN-001</span> dengan keyakinan 92% berdasarkan <span className="text-white">Temporal Discontinuity</span> (Eksekusi 02:45) dan <span className="text-white">Anomali Jalur Jaringan</span>. Analisis GNN mengungkapkan hubungan jelas ke <span className="text-amber-warning uppercase">Node F (Shell Luar Negeri)</span>. Data lokasi menunjukkan perbedaan IP antara sertifikat perangkat dan gateway jaringan saat ini. Merekomendasikan <span className="text-status-error underline decoration-2 underline-offset-4">Penguncian Penuh & Pembekuan Aset</span>.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
