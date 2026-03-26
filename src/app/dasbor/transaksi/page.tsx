"use client";
import { useState } from "react";
import { formatCurrency, getRiskColor, getRiskBgColor } from "@/pustaka/utilitas";
import { Search, ChevronDown } from "lucide-react";
import InfoTooltip from "@/komponen/ui/info-tooltip";

// Extended simulated data for the dedicated page
const transaksiData = [
    { id: "TXN-001", waktu: "2026-03-26 12:45:23", pengirim: "Ahmad Rizki", penerima: "Budi Santoso", jumlah: 15000000, risiko: "kritis" as const, status: "Diblokir" },
    { id: "TXN-002", waktu: "2026-03-26 12:43:11", pengirim: "Siti Nurhaliza", penerima: "PT Maju Jaya", jumlah: 5200000, risiko: "rendah" as const, status: "Disetujui" },
    { id: "TXN-003", waktu: "2026-03-26 12:41:55", pengirim: "Dian P.", penerima: "Rina Wati", jumlah: 87500000, risiko: "tinggi" as const, status: "Review" },
    { id: "TXN-004", waktu: "2026-03-26 12:40:32", pengirim: "Joko Widodo", penerima: "CV Sejahtera", jumlah: 3100000, risiko: "rendah" as const, status: "Disetujui" },
    { id: "TXN-005", waktu: "2026-03-26 12:38:18", pengirim: "Maya Sari", penerima: "Unknown Entity", jumlah: 45000000, risiko: "kritis" as const, status: "Diblokir" },
    { id: "TXN-006", waktu: "2026-03-25 21:37:01", pengirim: "PT Global", penerima: "Bank XYZ", jumlah: 125000000, risiko: "sedang" as const, status: "Review" },
    { id: "TXN-007", waktu: "2026-03-25 19:35:44", pengirim: "Hendra K.", penerima: "Linda M.", jumlah: 2500000, risiko: "rendah" as const, status: "Disetujui" },
    { id: "TXN-008", waktu: "2026-03-25 15:22:10", pengirim: "Farhan A.", penerima: "Toko Sinar", jumlah: 850000, risiko: "rendah" as const, status: "Disetujui" },
    { id: "TXN-009", waktu: "2026-03-25 08:14:05", pengirim: "Andi Wijaya", penerima: "Crypto Exchange", jumlah: 250000000, risiko: "tinggi" as const, status: "Review" },
    { id: "TXN-010", waktu: "2026-03-24 23:55:00", pengirim: "Rizal S.", penerima: "Offshore Acc", jumlah: 750000000, risiko: "kritis" as const, status: "Diblokir" },
];

export default function TransaksiPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRisk, setFilterRisk] = useState("Semua");

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Diblokir: "bg-status-error/10 text-status-error border border-status-error/20",
            Disetujui: "bg-status-success/10 text-status-success border border-status-success/20",
            Review: "bg-amber-warning/10 text-status-warning border border-status-warning/20",
        };
        return styles[status] || "bg-dark-600/10 text-dark-300 border border-dark-600/20";
    };

    const filteredData = transaksiData.filter((txn) => {
        const matchesSearch =
            txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.pengirim.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.penerima.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk = filterRisk === "Semua" || txn.risiko === filterRisk.toLowerCase();
        return matchesSearch && matchesRisk;
    });

    return (
        <div className="space-y-10 min-w-0 overflow-hidden animate-fade-in pb-12">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[1.1] italic">Arsip <span className="text-primary-blue block sm:inline">Transaksi</span></h1>
                    <p className="text-dark-400 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                        <span className="w-1.5 h-1.5 bg-primary-blue/50 rounded-full shrink-0" />
                        Buku besar komprehensif: <span className="text-white">Penyimpanan Aman</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="group relative px-8 py-3.5 rounded-2xl bg-primary-blue text-white font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        Ekspor Intelijen (CSV)
                    </button>
                </div>
            </div>

            <div className="glass-panel p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-blue to-transparent opacity-10 group-hover:opacity-30" />
                
                {/* Filters Row */}
                <div className="flex flex-col xl:flex-row xl:items-center gap-6 mb-12">
                    <div className="flex items-center gap-2 mb-4 xl:mb-0 xl:hidden">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Database Transaksi</h3>
                        <InfoTooltip text="Arsip lengkap seluruh transaksi yang telah diproses sistem. Gunakan filter dan pencarian untuk menemukan data spesifik berdasarkan ID, nama entitas, atau tingkat ancaman." />
                    </div>
                    <div className="relative flex-1 group/search">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-dark-500 group-focus-within/search:text-neon-cyan transition-colors" strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari ID, Source Node, atau Target Node..."
                            className="w-full bg-dark-950/50 border border-white/5 focus:border-neon-cyan/50 focus:ring-4 focus:ring-neon-cyan/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white placeholder-dark-600 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full xl:w-64 relative group/select">
                        <select
                            className="w-full bg-dark-950/50 border border-white/5 focus:border-neon-cyan/50 focus:ring-4 focus:ring-neon-cyan/5 rounded-2xl py-4 px-6 text-sm font-black text-white appearance-none transition-all outline-none cursor-pointer uppercase tracking-widest"
                            value={filterRisk}
                            onChange={(e) => setFilterRisk(e.target.value)}
                        >
                            <option value="Semua">Semua Tingkat Ancaman</option>
                            <option value="Kritis">Kritis (Risiko Tinggi)</option>
                            <option value="Tinggi">Intensitas Tinggi</option>
                            <option value="Sedang">Pola Sedang</option>
                            <option value="Rendah">Rendah / Aman</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDown className="w-4 h-4 text-dark-500 group-focus-within/select:text-neon-cyan transition-colors" strokeWidth={3} />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
                    <table className="w-full border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">
                                <th className="pb-4 pl-8">ID Node</th>
                                <th className="pb-4">Waktu Eksekusi</th>
                                <th className="pb-4">Identitas Sumber</th>
                                <th className="pb-4">Identitas Penerima</th>
                                <th className="pb-4 text-right">Nilai Muatan</th>
                                <th className="pb-4 text-center">Tingkat Ancaman</th>
                                <th className="pb-4 text-center pr-8">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((txn) => (
                                    <tr key={txn.id} className="group/row cursor-default transition-all">
                                        <td className="py-5 pl-8 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-l border-white/5 first:rounded-l-2xl">
                                            <span className="text-xs font-black font-mono text-neon-cyan tracking-tight transition-all group-hover/row:glow-cyan">{txn.id}</span>
                                        </td>
                                        <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5 text-[10px] font-bold text-dark-400 font-mono tracking-tighter uppercase">{txn.waktu}</td>
                                        <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5 text-xs font-black text-white tracking-tight uppercase">{txn.pengirim}</td>
                                        <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5 text-xs font-black text-white tracking-tight uppercase">{txn.penerima}</td>
                                        <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5 text-xs font-black text-white text-right font-mono tracking-tighter">
                                            {formatCurrency(txn.jumlah)}
                                        </td>
                                        <td className="py-5 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-white/5 text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getRiskBgColor(txn.risiko)} ${getRiskColor(txn.risiko)}`}>
                                                {txn.risiko}
                                            </span>
                                        </td>
                                        <td className="py-5 pr-8 bg-white/[0.02] group-hover/row:bg-white/[0.04] border-y border-r border-white/5 last:rounded-r-2xl text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusBadge(txn.status)}`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-50">
                                          <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center border border-white/10">
                                              <Search className="w-8 h-8 text-dark-400" strokeWidth={1.5} />
                                          </div>
                                          <p className="text-sm font-black text-dark-400 uppercase tracking-widest">Tidak ada data yang cocok dengan filter</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination Row */}
                <div className="mt-12 flex flex-col xl:flex-row items-center justify-between gap-8 border-t border-white/5 pt-10">
                    <div className="text-[10px] font-black text-dark-500 uppercase tracking-widest">
                        Menampilkan <span className="text-white">1</span> dari <span className="text-white">{filteredData.length}</span> total entitas dari penyimpanan buku besar
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-5 py-2.5 rounded-xl border border-white/5 bg-dark-900/50 text-dark-500 font-black text-[10px] uppercase tracking-widest cursor-not-allowed">
                            Halaman Sebelumnya
                        </button>
                        <div className="flex items-center gap-1.5 px-1">
                          <button className="w-10 h-10 rounded-xl bg-primary-blue text-white text-xs font-black shadow-[0_0_15px_rgba(59,130,246,0.3)]">1</button>
                          <button className="w-10 h-10 rounded-xl hover:bg-white/5 text-dark-400 hover:text-white text-xs font-black transition-all">2</button>
                          <button className="w-10 h-10 rounded-xl hover:bg-white/5 text-dark-400 hover:text-white text-xs font-black transition-all">3</button>
                        </div>
                        <button className="px-5 py-2.5 rounded-xl border border-white/5 bg-dark-900/50 hover:bg-white/5 text-dark-300 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                            Halaman Berikutnya
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
