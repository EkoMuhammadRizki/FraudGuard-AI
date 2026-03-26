"use client";
import { useState } from "react";
import { Calendar, Brain, ShieldCheck, Search, FileText, Download } from "lucide-react";
import InfoTooltip from "@/komponen/ui/info-tooltip";

const laporanData = [
    { id: 1, nama: "Laporan Harian Fraud (25 Mar 2026)", tipe: "Harian", date: "2026-03-25", size: "1.2 MB" },
    { id: 2, nama: "Deteksi Anomali GNN", tipe: "Teknis", date: "2026-03-24", size: "4.5 MB" },
    { id: 3, nama: "Audit Kepatuhan ISO 27001", tipe: "Kepatuhan", date: "2026-03-20", size: "8.1 MB" },
    { id: 4, nama: "Ringkasan Eksekutif Mingguan", tipe: "Eksekutif", date: "2026-03-18", size: "2.3 MB" },
    { id: 5, nama: "Tingkat False Positive Model v3.2", tipe: "Evaluasi Model", date: "2026-03-15", size: "3.4 MB" },
];

export default function LaporanPage() {
    const [downloading, setDownloading] = useState<number | null>(null);

    const handleDownload = (id: number) => {
        setDownloading(id);
        setTimeout(() => setDownloading(null), 1500);
    };

    return (
        <div className="space-y-10 min-w-0 overflow-hidden animate-fade-in pb-12">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[1.1] italic">Intelligence <span className="text-primary-blue block sm:inline">Reports</span></h1>
                    <p className="text-dark-400 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                        <span className="w-1.5 h-1.5 bg-hyper-violet/50 rounded-full shrink-0" />
                        Mesin Analitik: <span className="text-white">Pengiriman Aktif</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-6 py-3 rounded-2xl bg-dark-900/50 hover:bg-white/5 text-dark-400 hover:text-white text-xs font-black transition-all border border-white/5 uppercase tracking-widest">
                        Konfigurasi Otomatisasi
                    </button>
                    <button className="group relative px-8 py-3.5 rounded-2xl bg-primary-blue text-white font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        Buat Laporan Baru
                    </button>
                </div>
            </div>

            {/* Quick Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: "Feed Ancaman Harian", desc: "Ringkasan otomatis 24 jam untuk anomali jaringan kritis dan node sumber yang diblokir.", icon: <Calendar className="w-8 h-8 text-neon-cyan" strokeWidth={2} /> },
                    { title: "Audit Model GNN", desc: "Metrik performa detail dari mesin inferensi Graph Neural Network.", icon: <Brain className="w-8 h-8 text-hyper-violet" strokeWidth={2} /> },
                    { title: "Paket Kepatuhan", desc: "Hasilkan laporan terstandarisasi untuk badan pengawas regulasi seperti PCI-DSS, SOC2, dan ISO-27001.", icon: <ShieldCheck className="w-8 h-8 text-status-success" strokeWidth={2} /> },
                ].map((card, idx) => (
                    <div key={idx} className="glass-panel p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] flex flex-col h-full hover:bg-white/10 group cursor-default transition-all hover:scale-[1.02] relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none group-hover:bg-primary-blue/10 transition-colors duration-700" />
                        <div className="flex items-center gap-5 mb-8 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-dark-950 flex items-center justify-center text-3xl border border-white/5 shadow-inner group-hover:glow-cyan transition-all">
                                {card.icon}
                            </div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-tight italic">{card.title}</h3>
                                <InfoTooltip text={card.desc} />
                            </div>
                        </div>
                        <p className="text-[11px] font-bold text-dark-500 flex-1 leading-relaxed uppercase tracking-tighter">{card.desc}</p>
                        <button className="mt-10 w-full py-4 rounded-2xl bg-dark-900/50 hover:bg-white/5 text-white text-[10px] font-black transition-all border border-white/5 uppercase tracking-[0.2em] shadow-lg">
                            Ajukan Pembuatan (PDF)
                        </button>
                    </div>
                ))}
            </div>

            {/* History Table */}
            <div className="glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] relative group overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-hyper-violet to-transparent opacity-10 group-hover:opacity-30 transition-opacity" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Riwayat <span className="text-hyper-violet">Pengiriman</span></h3>
                        <InfoTooltip text="Riwayat seluruh laporan yang telah dibuat dan didistribusikan. Tersedia opsi unduh terenkripsi (Secure Pull) untuk setiap laporan." />
                    </div>
                    <div className="relative group/search w-full md:w-80">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-dark-500 group-focus-within/search:text-hyper-violet transition-colors" strokeWidth={3} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari laporan berdasarkan nama..."
                            className="w-full bg-dark-950/50 border border-white/5 focus:border-hyper-violet/50 focus:ring-4 focus:ring-hyper-violet/5 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-bold text-white placeholder-dark-600 transition-all outline-none"
                        />
                    </div>
                </div>

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
                            {laporanData.map((lap) => (
                                <tr key={lap.id} className="group/row transition-all">
                                    <td className="py-5 pl-8 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-l border-white/5 first:rounded-l-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-dark-950 border border-white/5 flex items-center justify-center">
                                              <FileText className="w-4 h-4 text-dark-400 group-hover/row:text-hyper-violet transition-colors" strokeWidth={2} />
                                            </div>
                                            <span className="text-sm font-black text-white tracking-tight uppercase italic">{lap.nama}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5">
                                        <span className="inline-flex px-3 py-1 rounded-lg bg-dark-900 border border-white/5 text-[10px] font-black text-dark-300 uppercase tracking-widest group-hover/row:border-hyper-violet/30 transition-colors">
                                            {lap.tipe}
                                        </span>
                                    </td>
                                    <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5 text-[10px] font-black text-dark-400 font-mono tracking-tighter uppercase">{lap.date}</td>
                                    <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5 text-[10px] font-black text-dark-400 font-mono tracking-tighter uppercase">{lap.size}</td>
                                    <td className="py-5 pr-8 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-r border-white/5 last:rounded-r-2xl text-right">
                                        <button
                                            onClick={() => handleDownload(lap.id)}
                                            disabled={downloading === lap.id}
                                            className="px-5 py-2 rounded-xl bg-dark-900 border border-white/5 hover:border-hyper-violet/30 hover:bg-hyper-violet/10 text-white text-[10px] font-black transition-all disabled:opacity-50 uppercase tracking-widest inline-flex items-center gap-3"
                                        >
                                            {downloading === lap.id ? (
                                              <>
                                                <div className="w-2 h-2 rounded-full bg-hyper-violet animate-pulse" />
                                                Mendekripsi...
                                              </>
                                            ) : (
                                              <>
                                                <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
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
            </div>
        </div>
    );
}
