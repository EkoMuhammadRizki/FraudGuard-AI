"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
    LayoutDashboard, 
    Search, 
    Activity, 
    FileText, 
    LogOut,
    X,
    ShieldAlert,
    TestTube2,
    Cpu
} from "lucide-react";
import Logo from "./logo";

const menuCategories = [
    {
        category: "OPERASIONAL",
        items: [
            {
                label: "Ringkasan",
                href: "/dasbor/ringkasan",
                icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2} />,
            },
            {
                label: "Investigasi",
                href: "/dasbor/investigasi",
                icon: <Search className="w-4 h-4" strokeWidth={2} />,
            },
            {
                label: "Transaksi Live",
                href: "/dasbor/transaksi",
                icon: <Activity className="w-4 h-4" strokeWidth={2} />,
            },
        ],
    },
    {
        category: "KEPATUHAN & HUKUM",
        items: [
            {
                label: "Laporan Audit PDF",
                href: "/dasbor/laporan",
                icon: <FileText className="w-4 h-4" strokeWidth={2} />,
            },
        ],
    },
    {
        category: "PLATFORM & INTEGRASI",
        items: [
            {
                label: "Sandbox Pengujian",
                href: "/dasbor/simulasi",
                icon: <TestTube2 className="w-4 h-4" strokeWidth={2} />,
            },
            {
                label: "Mobile SDK Telemetry",
                href: "/dasbor/simulasi-sdk",
                icon: <Cpu className="w-4 h-4" strokeWidth={2} />,
            },
        ],
    },
];
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [activeUser, setActiveUser] = useState<{ name: string; username: string; role: string } | null>(null);

    // Read logged in user profile from storage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("fg_user") || sessionStorage.getItem("fg_user");
            if (stored) {
                try {
                    setActiveUser(JSON.parse(stored));
                } catch (e) {
                    console.error("Error parsing user profile", e);
                }
            }
        }
    }, []);

    // Extract dynamic initials
    const getUserInitials = (nameStr: string) => {
        if (!nameStr) return "FG";
        const parts = nameStr.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return nameStr.substring(0, 2).toUpperCase();
    };

    const userName = activeUser?.name || "Eko Muhammad Rizki";
    const userRole = activeUser?.role ? activeUser.role.toUpperCase() : "AKSES LEVEL 4";
    const userInitials = getUserInitials(userName);

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem("splash_screen_shown", "true");
            (window as any).__splashScreenFinished = true;
        }
        localStorage.removeItem("telah_baca_peringatan_ai");
        setShowLogoutModal(false);
        onClose();
        router.push("/");
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            <aside className={`
                bg-dark-950/98 backdrop-blur-3xl border-white/5 flex flex-col z-[100]
                transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                fixed top-0 left-0 w-full h-auto max-h-screen border-b
                lg:sticky lg:inset-auto lg:w-72 lg:h-screen lg:border-r lg:translate-y-0
                ${isOpen ? "translate-y-0 shadow-[0_25px_60px_rgba(0,0,0,0.8)]" : "-translate-y-full lg:translate-y-0"}
            `}>
            {/* Logo Section */}
            <div className="h-24 flex items-center justify-between gap-4 px-8 border-b border-white/5 relative group/logo z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-blue/5 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                <div className="flex items-center">
                    <Logo size="md" />
                </div>

                {/* Mobile Close Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onClose();
                    }}
                    className="lg:hidden p-4 -mr-4 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer z-[110] active:scale-90"
                    aria-label="Close menu"
                >
                    <X className="w-8 h-8" strokeWidth={2.5} />
                </button>
            </div>

            {/* Navigation Menu (Grouped by Category) */}
            <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto custom-scrollbar">
                {menuCategories.map((group) => (
                    <div key={group.category} className="space-y-1">
                        <div className="px-3 pb-1.5">
                            <span className="text-[10px] font-mono font-bold text-dark-400 uppercase tracking-[0.18em]">
                                {group.category}
                            </span>
                        </div>
                        {group.items.map((item) => {
                            const cleanHref = item.href.split("#")[0];
                            const isActive = pathname === item.href || pathname === cleanHref || pathname.startsWith(cleanHref + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3.5 px-3.5 py-3 text-xs font-bold transition-all rounded-xl relative group/nav ${isActive
                                        ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 shadow-[inset_0_0_15px_rgba(6,182,212,0.08)]"
                                        : "text-dark-400 hover:text-white hover:bg-white/5 border border-transparent"
                                        }`}
                                >
                                    {/* Active Indicator */}
                                    {isActive && (
                                        <div className="absolute left-0 w-1 h-5 bg-neon-cyan rounded-full shadow-sm" />
                                    )}
                                    
                                    <div className={`transition-all duration-300 ${isActive ? 'scale-105 text-neon-cyan' : 'group-hover/nav:scale-105 group-hover/nav:text-white'}`}>
                                        {item.icon}
                                    </div>
                                    <span className="tracking-wide">{item.label}</span>
                                    
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-sm" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Lower Profile & Engine Status Section */}
            <div className="p-4 space-y-3 border-t border-white/5">
                {/* Engine Status Indicator (No Emojis) */}
                <div className="rounded-xl border border-white/10 bg-dark-900/60 p-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                        <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">ENGINE ML ACTIVE</span>
                    </div>
                    <p className="text-[10px] text-dark-400 font-mono mt-1">Kafka Streaming · MongoDB Atlas</p>
                </div>

                <div className="glass-panel p-3.5 rounded-2xl border-white/5 bg-white/5 group/profile">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan via-primary-blue to-hyper-violet flex items-center justify-center text-dark-950 text-sm font-black shadow-md shadow-neon-cyan/20">
                            {userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-white truncate leading-tight">{userName}</p>
                            <p className="text-[10px] font-mono font-bold text-neon-cyan/80 truncate mt-0.5 tracking-tight">{userRole}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-dark-900/50 border border-white/5 text-[11px] font-mono font-bold text-dark-400 hover:text-white hover:bg-status-error/10 hover:border-status-error/20 transition-all uppercase tracking-wider cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" strokeWidth={2.5} />
                        Keluar Sesi
                    </button>
                </div>
            </div>
        </aside>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
                    onClick={() => setShowLogoutModal(false)}
                />
                {/* Dialog */}
                <div className="relative w-full max-w-sm glass-panel rounded-[2rem] p-8 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] animate-fade-in">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-status-error to-transparent opacity-60 rounded-t-[2rem]" />
                    
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-status-error/10 border border-status-error/20 flex items-center justify-center">
                            <ShieldAlert className="w-8 h-8 text-status-error" strokeWidth={2} />
                        </div>
                    </div>

                    {/* Text */}
                    <h2 className="text-xl font-black text-white text-center uppercase tracking-tight mb-2">Akhiri Sesi?</h2>
                    <p className="text-[12px] text-dark-400 text-center font-bold uppercase tracking-wide leading-relaxed">
                        Anda akan keluar dari sistem.<br />Sesi aktif akan segera diakhiri.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="flex-1 py-3 rounded-xl bg-dark-900/50 border border-white/5 text-xs font-black text-dark-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex-1 py-3 rounded-xl bg-status-error/20 border border-status-error/30 text-xs font-black text-status-error hover:bg-status-error hover:text-white transition-all uppercase tracking-widest cursor-pointer"
                        >
                            Ya, Keluar
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
