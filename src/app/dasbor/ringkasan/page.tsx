"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, getRiskColor, getRiskBgColor } from "@/pustaka/utilitas";
import { Activity, Siren, CheckCircle, Target, Zap } from "lucide-react";
import InfoTooltip from "@/komponen/ui/info-tooltip";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Simulated data
const statsData = [
    { label: "Total Transaksi", value: "124,847", change: "+12.5%", positive: true, icon: <Activity className="w-8 h-8" strokeWidth={2} /> },
    { label: "Fraud Terdeteksi", value: "1,293", change: "+3.2%", positive: false, icon: <Siren className="w-8 h-8 text-status-error" strokeWidth={2} /> },
    { label: "False Positive Rate", value: "2.1%", change: "-15.3%", positive: true, icon: <CheckCircle className="w-8 h-8 text-status-success" strokeWidth={2} /> },
    { label: "Akurasi Model", value: "99.7%", change: "+0.3%", positive: true, icon: <Target className="w-8 h-8" strokeWidth={2} /> },
];

const transaksiData = [
    { id: "TXN-001", waktu: "12:45:23", pengirim: "Ahmad Rizki", penerima: "Budi Santoso", jumlah: 15000000, risiko: "kritis" as const, status: "Diblokir" },
    { id: "TXN-002", waktu: "12:43:11", pengirim: "Siti Nurhaliza", penerima: "PT Maju Jaya", jumlah: 5200000, risiko: "rendah" as const, status: "Disetujui" },
    { id: "TXN-003", waktu: "12:41:55", pengirim: "Dian P.", penerima: "Rina Wati", jumlah: 87500000, risiko: "tinggi" as const, status: "Review" },
    { id: "TXN-004", waktu: "12:40:32", pengirim: "Joko Widodo", penerima: "CV Sejahtera", jumlah: 3100000, risiko: "rendah" as const, status: "Disetujui" },
    { id: "TXN-005", waktu: "12:38:18", pengirim: "Maya Sari", penerima: "Unknown Entity", jumlah: 45000000, risiko: "kritis" as const, status: "Diblokir" },
    { id: "TXN-006", waktu: "12:37:01", pengirim: "PT Global", penerima: "Bank XYZ", jumlah: 125000000, risiko: "sedang" as const, status: "Review" },
    { id: "TXN-007", waktu: "12:35:44", pengirim: "Hendra K.", penerima: "Linda M.", jumlah: 2500000, risiko: "rendah" as const, status: "Disetujui" },
];

const riskMapRegions = [
    { name: "Jakarta", x: 38, y: 62, risk: 85, level: "kritis" as const },
    { name: "Surabaya", x: 52, y: 65, risk: 62, level: "tinggi" as const },
    { name: "Medan", x: 22, y: 30, risk: 45, level: "sedang" as const },
    { name: "Makassar", x: 58, y: 68, risk: 38, level: "sedang" as const },
    { name: "Bandung", x: 40, y: 66, risk: 55, level: "tinggi" as const },
    { name: "Bali", x: 54, y: 72, risk: 20, level: "rendah" as const },
    { name: "Kalimantan", x: 50, y: 45, risk: 30, level: "sedang" as const },
    { name: "Papua", x: 80, y: 55, risk: 15, level: "rendah" as const },
];

// False positive reduction data for chart
const chartData = [
    { month: "Jan", rate: 18.5 },
    { month: "Feb", rate: 15.2 },
    { month: "Mar", rate: 12.8 },
    { month: "Apr", rate: 10.1 },
    { month: "Mei", rate: 7.5 },
    { month: "Jun", rate: 5.3 },
    { month: "Jul", rate: 4.1 },
    { month: "Agu", rate: 3.2 },
    { month: "Sep", rate: 2.8 },
    { month: "Okt", rate: 2.4 },
    { month: "Nov", rate: 2.1 },
    { month: "Des", rate: 1.8 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-800 border border-dark-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
                <p className="text-dark-200 text-sm font-medium mb-1">Bulan: {label}</p>
                <p className="text-primary-blue-light text-sm font-bold">
                    Rate: {payload[0].value}%
                </p>
            </div>
        );
    }
    return null;
};

export default function RingkasanPage() {
    const [liveCount, setLiveCount] = useState(124847);

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveCount((prev) => prev + Math.floor(Math.random() * 3));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Diblokir: "bg-status-error/10 text-status-error border border-status-error/20",
            Disetujui: "bg-status-success/10 text-status-success border border-status-success/20",
            Review: "bg-amber-warning/10 text-amber-warning border border-amber-warning/20",
        };
        return styles[status] || "";
    };

    return (
        <div className="space-y-10 min-w-0 overflow-hidden animate-fade-in pb-12">
            {/* Page Title & Status */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[1.1]">Ringkasan <span className="text-primary-blue block sm:inline">Operasional</span></h1>
                    <p className="text-dark-400 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                      <span className="w-1.5 h-1.5 bg-neon-cyan/50 rounded-full shrink-0" />
                      Pemantauan infrastruktur: <span className="text-white">Aktif</span>
                    </p>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 glass-panel px-5 py-3 rounded-2xl border-white/5 bg-white/5">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-status-success shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                        </span>
                        <span className="text-status-success font-black text-xs uppercase tracking-widest">Sinyal Langsung</span>
                    </div>
                    <div className="w-[1px] h-4 bg-white/10" />
                    <span className="text-dark-400 text-[10px] font-black uppercase tracking-tighter">Diperbarui: <span className="text-white">Sekarang</span></span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="glass-panel p-8 rounded-[2rem] transition-all hover:scale-[1.02] hover:bg-white/10 group cursor-default relative overflow-hidden"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-primary-blue/20 transition-all duration-700" />
                        
                        <div className="flex items-start justify-between mb-8 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-dark-900 border border-white/5 flex items-center justify-center text-3xl shadow-inner group-hover:glow-cyan transition-all">
                                {stat.icon}
                            </div>
                            <div className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${stat.positive
                                    ? "bg-status-success/10 text-status-success border-status-success/20"
                                    : "bg-status-error/10 text-status-error border-status-error/20"
                                    } tracking-widest uppercase`}>
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

            {/* Main Visualizations */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                {/* Risk Map (3/5 width) */}
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

                    <div className="relative bg-[#020617] rounded-[1.5rem] overflow-hidden border border-white/5 shadow-inner" style={{ aspectRatio: "16/9" }}>
                        <svg viewBox="0 0 1000 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            {/* Indonesia Map Background */}
                            <image 
                                href="/indonesia-map.png" 
                                x="0" y="0" width="1000" height="500" 
                                className="opacity-40 grayscale brightness-125"
                                preserveAspectRatio="xMidYMid slice"
                            />

                            {riskMapRegions.map((region) => {
                                // Adjusting x/y proportionally to the new 1000x500 viewBox
                                // Original was 100x80. New is 1000x500.
                                const adjX = region.x * 10;
                                const adjY = region.y * 6; // slightly squished for landscape
                                
                                const color = region.level === "kritis" || region.level === "tinggi" ? "#EF4444" : region.level === "sedang" ? "#F59E0B" : "#22C55E";
                                return (
                                    <g key={region.name} className="cursor-pointer group/node">
                                        <circle cx={adjX} cy={adjY} r={region.risk / 1.5} fill={color} opacity="0.1">
                                            <animate attributeName="r" values={`${region.risk / 2};${region.risk / 1};${region.risk / 2}`} dur="4s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" values="0.15;0.05;0.15" dur="4s" repeatCount="indefinite" />
                                        </circle>
                                        <circle cx={adjX} cy={adjY} r="6" fill={color} className="shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                                            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
                                        </circle>
                                        <text x={adjX} y={adjY - 15} textAnchor="middle" fill="white" fontSize="14" className="font-black uppercase tracking-tighter opacity-0 group-hover/node:opacity-100 transition-opacity duration-300">
                                            {region.name}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-col gap-1.5">
                          <div className="text-[13px] sm:text-[12px] font-black text-neon-cyan tracking-[0.2em] uppercase">Koordinat Grid</div>
                          <div className="font-mono text-[11px] sm:text-[11px] text-dark-400 font-bold bg-dark-950/40 px-2 py-0.5 rounded-lg border border-white/5 w-fit">LAT: -6.2088 | LONG: 106.8456</div>
                        </div>
                    </div>
                </div>

                {/* FP Chart (2/5 width) */}
                <div className="xl:col-span-2 glass-panel p-6 md:p-10 rounded-[2.5rem] relative group">
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-transparent via-hyper-violet to-transparent opacity-20 group-hover:opacity-40 transition-opacity" />
                    
                    <div className="flex flex-col gap-1 mb-10">
                        <div className="flex items-start sm:items-center justify-between gap-6 flex-wrap">
                          <div className="flex items-center gap-3">
                              <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-tight">Presisi <br className="hidden xl:block 2xl:hidden" /><span className="text-hyper-violet">Model</span></h3>
                              <InfoTooltip text="Grafik tren penurunan False Positive Rate (FPR) sepanjang tahun. Semakin rendah angkanya, semakin presisi model AI dalam membedakan transaksi sah vs. fraud." />
                          </div>
                          <span className="px-3 py-1.5 rounded-xl bg-status-success/10 text-status-success text-[10px] font-black border border-status-success/20 tracking-widest shrink-0">
                              TEROPTIMALISASI
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-dark-500 mt-1 uppercase tracking-[0.2em]">Tren pengurangan FP Rate (Tahunan)</p>
                    </div>

                    <div className="h-72 w-full mt-6 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 10, fontWeight: 700 }} dy={10} strokeWidth={0} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `${v}%`} strokeWidth={0} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="rate" stroke="#06B6D4" strokeWidth={4} fill="url(#colorRate)" activeDot={{ r: 8, fill: "#06B6D4", stroke: "#020617", strokeWidth: 3 }} animationDuration={2000} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Transaction Feed */}
            <div id="transaksi" className="glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-blue to-transparent opacity-10 group-hover:opacity-30 transition-opacity" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-neon-cyan/10 rounded-2xl border border-neon-cyan/20">
                            <Zap className="w-6 h-6 text-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.4)]" strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Feed <span className="text-neon-cyan">Transaksi Mentah</span></h3>
                                <InfoTooltip text="Live stream transaksi terbaru yang diproses sistem. Menampilkan ID node, timestamp, identitas pengirim/penerima, nominal, tingkat ancaman, dan status tindakan secara real-time." />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                                <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">Protokol Dekripsi Langsung Aktif</span>
                            </div>
                        </div>
                    </div>
                    <Link href="/dasbor/transaksi" className="px-8 py-3.5 rounded-2xl bg-dark-900/50 hover:bg-white/5 text-dark-300 hover:text-white text-xs font-black transition-all border border-white/5 active:scale-95 uppercase tracking-widest">
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
                            {transaksiData.map((txn) => (
                                <tr key={txn.id} className="group/row transition-all">
                                    <td className="py-5 pl-6 bg-white/[0.02] group-hover/row:bg-white/[0.05] border-y border-l border-white/5 first:rounded-l-2xl">
                                        <span className="text-xs font-black font-mono text-neon-cyan tracking-tight">{txn.id}</span>
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
    );
}
