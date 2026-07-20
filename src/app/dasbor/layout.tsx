"use client";
import Sidebar from "@/komponen/bersama/sidebar";
import ModalSumberData from "@/komponen/dasbor/modal-sumber-data";
import ModalPanduan from "@/komponen/dasbor/modal-panduan";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Menu, Search, Bell, X, ArrowRight, AlertTriangle, ShieldAlert, ShieldCheck, Clock, CheckCheck, Trash2 } from "lucide-react";
import { transactionFeed } from "@/pustaka/data-fraudguard";
import { formatCurrency } from "@/pustaka/utilitas";
import { useRouter, usePathname } from "next/navigation";

// ─── Notification Types ──────────────────────────────────────────────────────
type Notifikasi = {
    id: string;
    judul: string;
    pesan: string;
    waktu: string;
    tipe: "kritis" | "peringatan" | "info" | "sukses";
    dibaca: boolean;
};

// ─── Generate notifications from real transaction data ───────────────────────
function generateNotifications(): Notifikasi[] {
    const kritisTransaksi = transactionFeed.filter(t => t.risiko === "kritis").slice(0, 3);
    const tinggiTransaksi = transactionFeed.filter(t => t.risiko === "tinggi").slice(0, 2);

    const notifs: Notifikasi[] = [];

    kritisTransaksi.forEach((t, i) => {
        notifs.push({
            id: `notif-kritis-${i}`,
            judul: `Alert Kritis: ${t.id}`,
            pesan: `Transaksi ${formatCurrency(t.jumlah)} dari ${t.pengirim} ke ${t.penerima} terdeteksi ${t.fraudType}. Risk Score: ${t.riskScore}%.`,
            waktu: i === 0 ? "2 menit lalu" : i === 1 ? "15 menit lalu" : "32 menit lalu",
            tipe: "kritis",
            dibaca: false,
        });
    });

    tinggiTransaksi.forEach((t, i) => {
        notifs.push({
            id: `notif-tinggi-${i}`,
            judul: `Peringatan: ${t.id}`,
            pesan: `Aktivitas mencurigakan pada ${t.pengirim}. ${t.fraudType} terindikasi dengan skor ${t.riskScore}%.`,
            waktu: i === 0 ? "1 jam lalu" : "2 jam lalu",
            tipe: "peringatan",
            dibaca: false,
        });
    });

    notifs.push({
        id: "notif-model-1",
        judul: "Model XGBoost Diperbarui",
        pesan: "Pipeline retraining selesai. F1-Score stabil di 81.48%. Threshold operasional: 0.38.",
        waktu: "3 jam lalu",
        tipe: "sukses",
        dibaca: true,
    });

    notifs.push({
        id: "notif-sistem-1",
        judul: "Laporan Harian Siap",
        pesan: "Feed Ancaman Harian untuk periode 24 jam terakhir telah digenerate dan siap diunduh di halaman Laporan.",
        waktu: "5 jam lalu",
        tipe: "info",
        dibaca: true,
    });

    return notifs;
}

// ─── Notification icon colors ────────────────────────────────────────────────
const NOTIF_STYLES: Record<string, { icon: React.ReactNode; bg: string; border: string }> = {
    kritis: {
        icon: <ShieldAlert className="w-4 h-4 text-status-error" />,
        bg: "bg-status-error/10",
        border: "border-status-error/20",
    },
    peringatan: {
        icon: <AlertTriangle className="w-4 h-4 text-amber-warning" />,
        bg: "bg-amber-warning/10",
        border: "border-amber-warning/20",
    },
    info: {
        icon: <Clock className="w-4 h-4 text-primary-blue" />,
        bg: "bg-primary-blue/10",
        border: "border-primary-blue/20",
    },
    sukses: {
        icon: <ShieldCheck className="w-4 h-4 text-status-success" />,
        bg: "bg-status-success/10",
        border: "border-status-success/20",
    },
};

export default function DasborLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Modal orchestration states
    const [showSumberData, setShowSumberData] = useState(false);
    const [showPanduan, setShowPanduan] = useState(false);

    // ── Search state ──
    const [searchQuery, setSearchQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // ── Notification state ──
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifikasi, setNotifikasi] = useState<Notifikasi[]>(() => generateNotifications());
    const notifRef = useRef<HTMLDivElement>(null);

    // ── Derived ──
    const unreadCount = useMemo(() => notifikasi.filter(n => !n.dibaca).length, [notifikasi]);

    // ── Search results (debounced-like with useMemo) ──
    const searchResults = useMemo(() => {
        if (searchQuery.trim().length < 2) return [];
        const q = searchQuery.toLowerCase();
        return transactionFeed
            .filter(t =>
                t.id.toLowerCase().includes(q) ||
                t.pengirim.toLowerCase().includes(q) ||
                t.penerima.toLowerCase().includes(q) ||
                t.fraudType.toLowerCase().includes(q) ||
                t.status.toLowerCase().includes(q)
            )
            .slice(0, 8);
    }, [searchQuery]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchFocused(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ── Cek onboarding session ──
    useEffect(() => {
        const hasSeen = sessionStorage.getItem("has_seen_disclaimer");
        if (!hasSeen) {
            setShowSumberData(true);
        }
    }, []);

    // ── Keyboard shortcut: Ctrl+K to focus search ──
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === "Escape") {
                setSearchFocused(false);
                setNotifOpen(false);
                inputRef.current?.blur();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // ── Reset selected index when results change ──
    useEffect(() => {
        setSelectedIndex(-1);
    }, [searchResults]);

    // ── Navigate to search result ──
    const navigateToResult = useCallback((txn: typeof transactionFeed[0]) => {
        setSearchQuery("");
        setSearchFocused(false);
        // Navigate to transaksi page — the page has its own search
        router.push(`/dasbor/transaksi`);
        // Store the search term so the transaksi page can pick it up
        if (typeof window !== "undefined") {
            sessionStorage.setItem("fg_search_prefill", txn.id);
        }
    }, [router]);

    // ── Search keyboard navigation ──
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (!searchResults.length) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            e.preventDefault();
            navigateToResult(searchResults[selectedIndex]);
        }
    };

    // ── Notification handlers ──
    const tandaiDibaca = (id: string) => {
        setNotifikasi(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n));
    };

    const tandaiSemuaDibaca = () => {
        setNotifikasi(prev => prev.map(n => ({ ...n, dibaca: true })));
    };

    const hapusNotifikasi = (id: string) => {
        setNotifikasi(prev => prev.filter(n => n.id !== id));
    };

    const showResults = searchFocused && searchQuery.trim().length >= 2;

    return (
        <div className="flex min-h-screen bg-dark-950 relative overflow-x-hidden md:overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-blue/5 blur-[120px] rounded-full pointer-events-none" />

            <ModalSumberData 
                isOpen={showSumberData} 
                onClose={() => {
                    setShowSumberData(false);
                    setShowPanduan(true);
                    sessionStorage.setItem("has_seen_disclaimer", "true");
                }} 
            />

            <ModalPanduan 
                isOpen={showPanduan} 
                onClose={() => {
                    setShowPanduan(false);
                    sessionStorage.setItem("has_seen_disclaimer", "true");
                }} 
            />

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col relative z-10">
                {/* Top Header */}
                <header className="h-16 lg:h-20 glass-panel border-b border-white/5 bg-dark-900/40 sticky top-0 z-30 shrink-0 flex items-center justify-between px-4 md:px-10 group/header">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000" />
                    
                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl glass-panel border-white/10 text-dark-400 hover:text-white transition-all active:scale-90"
                        >
                            <Menu className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                        <div>
                           <h2 className="text-base md:text-xl font-black text-white tracking-tight uppercase leading-none">Dasbor</h2>
                           <div className="hidden md:block text-[10px] font-bold text-neon-cyan tracking-[0.2em] uppercase opacity-60 mt-1">Sistem Operasional</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        {/* ══════════════════════════════════════════
                            FUNCTIONAL SEARCH BAR
                        ══════════════════════════════════════════ */}
                        <div className="relative hidden xl:block" ref={searchRef}>
                            <div className="relative group/search">
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchFocused ? "text-neon-cyan" : "text-dark-500"}`} strokeWidth={2.5} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder="Pindai data transaksi..."
                                    className="w-64 lg:w-80 pl-11 pr-20 py-2.5 rounded-xl bg-dark-950/50 border border-white/10 text-white text-sm placeholder-dark-500 outline-none focus:border-neon-cyan/50 focus:ring-4 focus:ring-neon-cyan/10 transition-all font-medium"
                                />
                                {/* Shortcut badge */}
                                {!searchFocused && !searchQuery && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-dark-500 uppercase">Ctrl</kbd>
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-dark-500 uppercase">K</kbd>
                                    </div>
                                )}
                                {/* Clear button */}
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(""); inputRef.current?.focus(); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-dark-400 hover:text-white transition-all"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {showResults && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-dark-900/98 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-50 animate-scale-up">
                                    {/* Results header */}
                                    <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                                        <span className="text-[9px] font-black text-dark-500 uppercase tracking-widest">
                                            {searchResults.length > 0 ? `${searchResults.length} hasil ditemukan` : "Tidak ada hasil"}
                                        </span>
                                        {searchResults.length > 0 && (
                                            <span className="text-[8px] font-bold text-dark-600 uppercase tracking-wider">
                                                Arrow keys + Enter
                                            </span>
                                        )}
                                    </div>

                                    {searchResults.length > 0 ? (
                                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                            {searchResults.map((txn, idx) => (
                                                <button
                                                    key={txn.id + idx}
                                                    onClick={() => navigateToResult(txn)}
                                                    onMouseEnter={() => setSelectedIndex(idx)}
                                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all border-b border-white/[0.03] last:border-none ${
                                                        selectedIndex === idx
                                                            ? "bg-neon-cyan/5 border-l-2 border-l-neon-cyan"
                                                            : "hover:bg-white/[0.02]"
                                                    }`}
                                                >
                                                    {/* Risk indicator dot */}
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                                                        txn.risiko === "kritis" ? "bg-status-error" :
                                                        txn.risiko === "tinggi" ? "bg-amber-warning" :
                                                        txn.risiko === "sedang" ? "bg-amber-400" :
                                                        "bg-status-success"
                                                    }`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black text-neon-cyan font-mono tracking-tight">{txn.id}</span>
                                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                                                txn.risiko === "kritis" ? "bg-status-error/10 text-status-error" :
                                                                txn.risiko === "tinggi" ? "bg-amber-warning/10 text-amber-warning" :
                                                                "bg-status-success/10 text-status-success"
                                                            }`}>
                                                                {txn.risiko}
                                                            </span>
                                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/5 text-dark-400`}>
                                                                {txn.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-dark-400 font-bold mt-0.5 truncate">
                                                            {txn.pengirim} → {txn.penerima} · {formatCurrency(txn.jumlah)} · {txn.fraudType}
                                                        </p>
                                                    </div>
                                                    <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-all ${selectedIndex === idx ? "text-neon-cyan" : "text-dark-600"}`} />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 flex flex-col items-center gap-2">
                                            <Search className="w-6 h-6 text-dark-600" />
                                            <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Tidak ditemukan untuk &quot;{searchQuery}&quot;</p>
                                        </div>
                                    )}

                                    {/* Footer hint */}
                                    {searchResults.length > 0 && (
                                        <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.01]">
                                            <p className="text-[9px] font-bold text-dark-600 uppercase tracking-wider">
                                                Klik atau tekan Enter untuk melihat detail di halaman Transaksi
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ══════════════════════════════════════════
                            FUNCTIONAL NOTIFICATION BELL
                        ══════════════════════════════════════════ */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className={`relative p-2 md:p-3 rounded-xl glass-panel border-white/5 text-dark-400 hover:text-white hover:border-white/20 transition-all active:scale-95 ${notifOpen ? "text-white border-white/20 bg-white/5" : ""}`}
                            >
                                <Bell className="w-5 h-5 md:w-6 md:h-6 transition-all" strokeWidth={1.5} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 md:top-1 md:right-1 min-w-[18px] h-[18px] bg-status-error rounded-full border-2 border-dark-900 shadow-sm flex items-center justify-center">
                                        <span className="text-[9px] font-black text-white leading-none">{unreadCount}</span>
                                    </span>
                                )}
                            </button>

                            {/* Notification Panel */}
                            {notifOpen && (
                                <div className="absolute top-full right-0 mt-2 w-[360px] md:w-[420px] bg-dark-900/98 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden z-50 animate-scale-up">
                                    {/* Header */}
                                    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <h3 className="text-sm font-black text-white uppercase tracking-tight">Notifikasi</h3>
                                            {unreadCount > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-status-error/10 border border-status-error/20 text-status-error text-[9px] font-black">
                                                    {unreadCount} baru
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={tandaiSemuaDibaca}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold text-dark-400 hover:text-neon-cyan hover:bg-neon-cyan/5 transition-all uppercase tracking-wider"
                                                >
                                                    <CheckCheck className="w-3 h-3" />
                                                    Baca Semua
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setNotifOpen(false)}
                                                className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-dark-400 hover:text-white transition-all"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Notification List */}
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {notifikasi.length > 0 ? (
                                            notifikasi.map(n => {
                                                const style = NOTIF_STYLES[n.tipe] || NOTIF_STYLES.info;
                                                return (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => tandaiDibaca(n.id)}
                                                        className={`px-5 py-4 border-b border-white/[0.03] last:border-none cursor-pointer transition-all group/notif-item ${
                                                            !n.dibaca
                                                                ? "bg-white/[0.02] hover:bg-white/[0.04]"
                                                                : "hover:bg-white/[0.02] opacity-70 hover:opacity-100"
                                                        }`}
                                                    >
                                                        <div className="flex gap-3">
                                                            {/* Icon */}
                                                            <div className={`w-8 h-8 rounded-lg ${style.bg} border ${style.border} flex items-center justify-center shrink-0 mt-0.5`}>
                                                                {style.icon}
                                                            </div>
                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <h4 className={`text-xs font-black tracking-tight ${!n.dibaca ? "text-white" : "text-dark-300"}`}>
                                                                        {n.judul}
                                                                    </h4>
                                                                    {/* Delete button */}
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); hapusNotifikasi(n.id); }}
                                                                        className="w-5 h-5 rounded-md flex items-center justify-center text-dark-600 hover:text-status-error hover:bg-status-error/10 transition-all opacity-0 group-hover/notif-item:opacity-100 shrink-0"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                                <p className="text-[10px] font-medium text-dark-400 leading-relaxed mt-1 line-clamp-2">
                                                                    {n.pesan}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="text-[9px] font-bold text-dark-600 uppercase tracking-wider">{n.waktu}</span>
                                                                    {!n.dibaca && (
                                                                        <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="py-12 flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center border border-white/5">
                                                    <Bell className="w-5 h-5 text-dark-500" />
                                                </div>
                                                <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Tidak ada notifikasi</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    {notifikasi.length > 0 && (
                                        <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01]">
                                            <button
                                                onClick={() => {
                                                    setNotifOpen(false);
                                                    router.push("/dasbor/transaksi");
                                                }}
                                                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black text-dark-400 hover:text-neon-cyan uppercase tracking-widest transition-all hover:bg-neon-cyan/5"
                                            >
                                                Lihat Semua Alert di Transaksi
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Profile Placeholder */}
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-neon-cyan/30 bg-primary-blue/20 flex items-center justify-center text-neon-cyan font-black text-[10px] md:text-xs tracking-tighter shadow-sm">
                          EK
                        </div>
                    </div>
                </header>
                {/* Page Content */}
                <main className="flex-1 p-4 md:p-10 min-w-0 overflow-x-hidden relative">
                    {children}
                </main>
            </div>
        </div>
    );
}
