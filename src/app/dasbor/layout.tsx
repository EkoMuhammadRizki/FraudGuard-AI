"use client";
import Sidebar from "@/komponen/bersama/sidebar";
import { useState } from "react";
import { Menu, Search, Bell } from "lucide-react";

export default function DasborLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-dark-950 relative overflow-x-hidden md:overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-blue/5 blur-[120px] rounded-full pointer-events-none" />

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
                        {/* Search */}
                        <div className="relative hidden xl:block group/search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 group-focus-within/search:text-neon-cyan transition-colors" strokeWidth={2.5} />
                            <input
                                type="text"
                                placeholder="Pindai data transaksi..."
                                className="w-64 lg:w-80 pl-11 pr-4 py-2.5 rounded-xl bg-dark-950/50 border border-white/10 text-white text-sm placeholder-dark-500 outline-none focus:border-neon-cyan/50 focus:ring-4 focus:ring-neon-cyan/10 transition-all font-medium"
                            />
                        </div>

                        {/* Notification bell */}
                        <button className="relative p-2 md:p-3 rounded-xl glass-panel border-white/5 text-dark-400 hover:text-white hover:border-white/20 transition-all active:scale-95 group/notif">
                            <Bell className="w-5 h-5 md:w-6 md:h-6 group-hover:glow-cyan transition-all" strokeWidth={1.5} />
                            <span className="absolute top-2 right-2 md:top-2.5 md:right-2.5 w-2 md:w-3 h-2 md:h-3 bg-neon-cyan rounded-full border-2 border-dark-900 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse" />
                        </button>

                        {/* Profile Placeholder */}
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-neon-cyan/30 bg-primary-blue/20 flex items-center justify-center text-neon-cyan font-black text-[10px] md:text-xs tracking-tighter shadow-[0_0_15px_rgba(6,182,212,0.1)]">
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
