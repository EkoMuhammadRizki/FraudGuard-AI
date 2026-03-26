"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
    LayoutDashboard, 
    Search, 
    Activity, 
    FileText, 
    LogOut,
    X,
    ShieldAlert,
    FlaskConical
} from "lucide-react";
import Logo from "./logo";

const menuItems = [
    {
        label: "Ringkasan",
        href: "/dasbor/ringkasan",
        icon: <LayoutDashboard className="w-5 h-5" strokeWidth={2} />,
    },
    {
        label: "Investigasi",
        href: "/dasbor/investigasi",
        icon: <Search className="w-5 h-5" strokeWidth={2} />,
    },
    {
        label: "Transaksi",
        href: "/dasbor/transaksi",
        icon: <Activity className="w-5 h-5" strokeWidth={2} />,
    },
    {
        label: "Laporan",
        href: "/dasbor/laporan",
        icon: <FileText className="w-5 h-5" strokeWidth={2} />,
    },
    {
        label: "Simulasi",
        href: "/dasbor/simulasi",
        icon: <FlaskConical className="w-5 h-5" strokeWidth={2} />,
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

    const handleLogout = () => {
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

            {/* Navigation Menu */}
            <nav className="flex-1 py-10 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                <div className="px-4 mb-4">
                  <span className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">Main Operations</span>
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href.split("#")[0]);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-4 px-4 py-4 text-sm font-bold transition-all rounded-2xl relative group/nav ${isActive
                                ? "bg-primary-blue/10 text-neon-cyan shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]"
                                : "text-dark-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {/* Active Indicator */}
                            {isActive && (
                              <div className="absolute left-0 w-1 h-6 bg-neon-cyan rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
                            )}
                            
                            <div className={`transition-all duration-300 ${isActive ? 'scale-110 text-neon-cyan glow-cyan' : 'group-hover/nav:scale-110 group-hover/nav:text-white'}`}>
                              {item.icon}
                            </div>
                            <span className="tracking-wide">{item.label}</span>
                            
                            {isActive && (
                              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Lower Profile Section */}
            <div className="p-6">
                <div className="glass-panel p-5 rounded-3xl border-white/5 bg-white/5 group/profile">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-blue to-hyper-violet flex items-center justify-center text-white text-lg font-black shadow-lg">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white truncate leading-tight">Analis Fraud</p>
                            <p className="text-[10px] font-bold text-dark-500 truncate mt-1 tracking-tight">LEVEL 4 CLEARANCE</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-dark-900/50 border border-white/5 text-xs font-black text-dark-400 hover:text-white hover:bg-status-error/10 hover:border-status-error/20 transition-all uppercase tracking-widest cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" strokeWidth={2.5} />
                        Log Out
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
