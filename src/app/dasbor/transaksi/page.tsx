"use client";
import { useState, useEffect, useRef } from "react";
import { formatCurrency, getRiskColor, getRiskBgColor } from "@/pustaka/utilitas";
import { Search, ChevronDown, X, Cpu, ShieldAlert, ShieldCheck, ArrowRight, AlertTriangle } from "lucide-react";
import InfoTooltip from "@/komponen/ui/info-tooltip";
import { transactionFeed, investigationDetails } from "@/pustaka/data-fraudguard";
import { useRouter } from "next/navigation";

// Kamus penjelasan UX Writer friendly untuk indikator model anomali FDS
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

const getReasonExplanation = (reasonName: string) => {
    const matched = reasonExplanations[reasonName];
    if (matched) return matched;
    
    // Default fallback jika alasan tidak terdaftar
    return {
        label: reasonName,
        desc: `Model AI mendeteksi anomali pada faktor ini sebagai indikator tambahan yang memerlukan penelaahan analis lebih lanjut.`
    };
};

const riskOptions = [
    { value: "Semua", label: "Semua Tingkat Ancaman" },
    { value: "Kritis", label: "Kritis (Risiko Tinggi)" },
    { value: "Tinggi", label: "Intensitas Tinggi" },
    { value: "Sedang", label: "Pola Sedang" },
    { value: "Rendah", label: "Rendah / Aman" },
];

export default function TransaksiPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRisk, setFilterRisk] = useState("Semua");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTxn, setSelectedTxn] = useState<any>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const itemsPerPage = 15;

    // MongoDB connection states
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch transactions from MongoDB on mount
    useEffect(() => {
        setIsLoading(true);
        fetch("/api/dashboard/transactions")
            .then(res => res.json())
            .then(data => {
                if (data.transactions) {
                    setAllTransactions(data.transactions);
                }
            })
            .catch(err => console.error("Error loading transactions from MongoDB:", err))
            .finally(() => setIsLoading(false));
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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRisk]);

    // Prefill search from global dashboard search
    useEffect(() => {
        if (typeof window !== "undefined") {
            const prefill = sessionStorage.getItem("fg_search_prefill");
            if (prefill) {
                setSearchTerm(prefill);
                sessionStorage.removeItem("fg_search_prefill");
            }
        }
    }, []);

    // Close modal on ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedTxn(null);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Handle click outside risk dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
            case "kritis":
                return "text-status-error bg-status-error/5 border-status-error/20";
            case "tinggi":
            case "sedang":
                return "text-amber-warning bg-amber-warning/5 border-amber-warning/20";
            default:
                return "text-status-success bg-status-success/5 border-status-success/20";
        }
    };

    const filteredData = allTransactions.filter((txn) => {
        const matchesSearch =
            txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.pengirim.toLowerCase().includes(searchTerm.toLowerCase()) ||
            txn.penerima.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk = filterRisk === "Semua" || txn.risiko === filterRisk.toLowerCase();
        return matchesSearch && matchesRisk;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <>
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
                    <button 
                        onClick={() => {
                            // Simple CSV export simulation
                            const headers = ["TransactionID", "Waktu", "Pengirim", "Penerima", "Jumlah", "Tingkat Ancaman", "Status"];
                            const rows = filteredData.map(t => [t.id, t.waktu, t.pengirim, t.penerima, t.jumlah, t.risiko, t.status]);
                            const csvContent = "data:text/csv;charset=utf-8," 
                                + headers.join(",") + "\n"
                                + rows.map(e => e.join(",")).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `fraudguard_transactions_export.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="group relative px-6 py-3 rounded-xl bg-primary-blue text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
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
                            placeholder="Cari ID, Source Node (Pengirim), atau Target Node (Penerima)..."
                            className="w-full bg-dark-950/50 border border-white/5 focus:border-neon-cyan/50 focus:ring-4 focus:ring-neon-cyan/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white placeholder-dark-600 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Dropdown Kustom Tingkat Ancaman */}
                    <div className="w-full xl:w-72 relative z-40" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="w-full bg-dark-950/50 hover:bg-dark-950/80 border border-white/5 focus:border-neon-cyan/50 focus:ring-4 focus:ring-neon-cyan/5 rounded-2xl py-4 px-6 text-sm font-black text-white transition-all outline-none cursor-pointer flex items-center justify-between uppercase tracking-widest text-left select-none"
                        >
                            <span>{riskOptions.find(opt => opt.value === filterRisk)?.label || "Semua Tingkat Ancaman"}</span>
                            <ChevronDown className={`w-4 h-4 text-dark-500 transition-transform duration-300 ${dropdownOpen ? "transform rotate-180 text-neon-cyan" : ""}`} strokeWidth={3} />
                        </button>
                        
                        {dropdownOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-dark-900/95 border border-white/10 rounded-2xl shadow-2xl p-2 backdrop-blur-md space-y-1 animate-scale-up z-50">
                                {riskOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            setFilterRisk(opt.value);
                                            setDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-5 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer select-none ${
                                            filterRisk === opt.value
                                                ? "bg-primary-blue text-white"
                                                : "text-dark-300 hover:bg-white/5 hover:text-white"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
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
                            {paginatedData.length > 0 ? (
                                paginatedData.map((txn) => (
                                    <tr 
                                        key={txn.id} 
                                        onClick={() => setSelectedTxn(txn)}
                                        className="group/row cursor-pointer transition-all hover:scale-[1.002]"
                                    >
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
                        Menampilkan <span className="text-white">{Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)}</span> sampai <span className="text-white">{Math.min(filteredData.length, currentPage * itemsPerPage)}</span> dari <span className="text-white">{filteredData.length}</span> total entitas
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="px-5 py-2.5 rounded-xl border border-white/5 bg-dark-900/50 hover:bg-white/5 text-dark-300 disabled:opacity-30 disabled:hover:bg-dark-900/50 disabled:cursor-not-allowed font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                Halaman Sebelumnya
                            </button>
                            <div className="flex items-center gap-1.5 px-1">
                                <span className="text-xs font-black text-white px-3">
                                    Halaman {currentPage} dari {totalPages}
                                </span>
                            </div>
                            <button 
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="px-5 py-2.5 rounded-xl border border-white/5 bg-dark-900/50 hover:bg-white/5 text-dark-300 disabled:opacity-30 disabled:hover:bg-dark-900/50 disabled:cursor-not-allowed font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                Halaman Berikutnya
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* ── MODAL EXPLANATION AI ── */}
            {selectedTxn && (
                <div 
                    className="fixed inset-0 z-[2000] bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fade-in"
                    onClick={() => setSelectedTxn(null)}
                >
                    <div 
                        className="bg-dark-900 border border-white/10 rounded-[2.5rem] max-w-3xl w-full max-h-[85vh] md:max-h-[90vh] shadow-2xl relative overflow-hidden flex flex-col animate-scale-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Garis batas cahaya di bagian atas */}
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

                        {/* Body Modal (Scrollable secara mandiri) */}
                        <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                            {/* Baris Ringkasan Risiko */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                                {/* Skor Gaging kiri */}
                                <div className="md:col-span-4 bg-dark-950/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                    <div className="text-[9px] font-black text-dark-500 uppercase tracking-widest mb-3">Persentase Risiko</div>
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            {/* Lingkaran Background */}
                                            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                                            {/* Lingkaran Progress */}
                                            <circle 
                                                cx="50" 
                                                cy="50" 
                                                r="40" 
                                                stroke={selectedTxn.risiko === "kritis" ? "#EF4444" : selectedTxn.risiko === "rendah" ? "#10B981" : "#F59E0B"} 
                                                strokeWidth="8" 
                                                fill="transparent" 
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

                                {/* Ringkasan Vonis & Tindakan Kanan */}
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

                            {/* Section Analisis Faktor Utama (UX Writer Friendly) */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-warning" />
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest font-sans">Indikator Anomali Terdeteksi (XAI)</h4>
                                </div>

                                <div className="space-y-3.5">
                                    {selectedRecord && selectedRecord.xaiFeatures && selectedRecord.xaiFeatures.length > 0 ? (
                                        selectedRecord.xaiFeatures.map((feat, idx) => {
                                            const exp = getReasonExplanation(feat.name);
                                            return (
                                                <div 
                                                    key={idx}
                                                    className="p-5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row gap-4 sm:items-start"
                                                >
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-xs font-black text-white tracking-tight font-sans">{exp.label}</span>
                                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                                                feat.impact === "tinggi" ? "bg-status-error/10 text-status-error border border-status-error/20" : "bg-amber-warning/10 text-amber-warning border border-amber-warning/20"
                                                            }`}>
                                                                Dampak {feat.impact}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-dark-400 font-bold leading-relaxed font-sans">
                                                            {exp.desc}
                                                        </p>
                                                    </div>
                                                    {/* Visual Importance weight bar */}
                                                    <div className="w-24 shrink-0 flex flex-col justify-center pt-2 sm:pt-0">
                                                        <div className="flex justify-between text-[9px] font-black text-dark-500 uppercase tracking-widest mb-1.5">
                                                            <span>Bobot</span>
                                                            <span>{Math.round(feat.importance * 100)}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-dark-950 rounded-full overflow-hidden border border-white/5">
                                                            <div 
                                                                className={`h-full rounded-full ${
                                                                    feat.impact === "tinggi" ? "bg-status-error" : "bg-amber-warning"
                                                                }`}
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

                            {/* Section Parameter Metadata Transaksi */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-white uppercase tracking-widest font-sans">Metadata Sesi Transaksi</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-dark-950/30 border border-white/5 rounded-2xl p-5 font-mono text-[10px] text-dark-300">
                                    <div className="space-y-0.5">
                                        <span className="text-dark-500 font-black uppercase tracking-wider block">ID Transaksi</span>
                                        <span className="text-neon-cyan font-black">{selectedTxn.id}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-dark-500 font-black uppercase tracking-wider block">Waktu</span>
                                        <span className="text-white font-bold">{selectedTxn.waktu}</span>
                                    </div>
                                    <div className="space-y-0.5 col-span-2 md:col-span-1">
                                        <span className="text-dark-500 font-black uppercase tracking-wider block">Volume Transaksi</span>
                                        <span className="text-white font-black">{formatCurrency(selectedTxn.jumlah)}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-dark-500 font-black uppercase tracking-wider block">Rekening Pengirim</span>
                                        <span className="text-white font-black">{selectedTxn.pengirim}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-dark-500 font-black uppercase tracking-wider block">Rekening Penerima</span>
                                        <span className="text-white font-black">{selectedTxn.penerima}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-dark-500 font-black uppercase tracking-wider block">Lokasi Geografis</span>
                                        <span className="text-white font-bold">{selectedRecord?.detail?.lokasi || "Unknown"}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-dark-500 font-black uppercase tracking-wider block">Alamat IP</span>
                                        <span className="text-white font-bold">{selectedRecord?.detail?.ip || "Unknown"}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-dark-500 font-black uppercase tracking-wider block">Identitas Perangkat (Device ID)</span>
                                        <span className="text-white font-bold">{selectedRecord?.detail?.device || "Unknown"}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-dark-500 font-black uppercase tracking-wider block">Tipe Transfer</span>
                                        <span className="text-white font-bold">{selectedRecord?.detail?.metode || "Transfer"}</span>
                                    </div>
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
                                    setSelectedTxn(null);
                                    router.push(`/dasbor/investigasi?txid=${selectedTxn.id}`);
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
