"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SplashScreen() {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith("/dasbor");

    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("INITIATING SECURITY PROTOCOLS...");
    const [visible, setVisible] = useState(true);
    const [mounted, setMounted] = useState(true);

    useEffect(() => {
        // Jika sedang di dashboard atau splash screen sudah pernah berjalan di sesi ini, langsung lewati
        if (isDashboard) {
            setMounted(false);
            return;
        }

        if (typeof window !== "undefined" && (sessionStorage.getItem("splash_screen_shown") || (window as any).__splashScreenFinished)) {
            (window as any).__splashScreenFinished = true;
            window.dispatchEvent(new Event("splashScreenFinished"));
            setVisible(false);
            setMounted(false);
            return;
        }

        // Prevent scroll when loading
        document.body.style.overflow = "hidden";

        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + Math.floor(Math.random() * 8) + 4;
                if (next >= 100) {
                    clearInterval(interval);
                    setStatusText("ACCESS GRANTED. LAUNCHING CONSOLE...");
                    setTimeout(() => {
                        setVisible(false);
                        (window as any).__splashScreenFinished = true;
                        if (typeof window !== "undefined") {
                            sessionStorage.setItem("splash_screen_shown", "true");
                        }
                        window.dispatchEvent(new Event("splashScreenFinished"));
                        // Re-enable scroll
                        document.body.style.overflow = "unset";
                        setTimeout(() => setMounted(false), 800); // Remove from DOM after fade-out transition
                    }, 500);
                    return 100;
                }
                
                // Update status messages based on progress
                if (next > 80) {
                    setStatusText("SHIELD PROTOCOLS ACTIVE...");
                } else if (next > 60) {
                    setStatusText("DECRYPTING NEURAL TOPOLOGY...");
                } else if (next > 40) {
                    setStatusText("ESTABLISHING GNN PIPELINE...");
                } else if (next > 20) {
                    setStatusText("SCANNING FOR NETWORK ANOMALIES...");
                }
                
                return next;
            });
        }, 100);

        return () => {
            clearInterval(interval);
            document.body.style.overflow = "unset";
        };
    }, [pathname, isDashboard]);

    if (isDashboard || !mounted) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020617] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                visible ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
        >
            {/* Cybersecurity ambient lights */}
            <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
            <div className="absolute w-[500px] h-[500px] rounded-full bg-primary-blue/5 blur-[150px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute w-[300px] h-[300px] rounded-full bg-neon-cyan/5 blur-[120px] top-1/3 left-1/3" />

            {/* Content Wrapper */}
            <div className="flex flex-col items-center text-center px-4 max-w-lg z-10 animate-fade-in">
                {/* Large Logo */}
                <div className="relative mb-10 group">
                    <div className="absolute -inset-4 rounded-full bg-primary-blue/10 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
                    <img
                        src="/logo-transparent.png"
                        alt="Amankan Fraud Logo"
                        className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10 animate-pulse"
                    />
                </div>

                {/* Title and Subtitle */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
                    Amankan <span className="text-primary-blue">Fraud</span>
                </h1>
                <p className="text-[10px] md:text-xs font-bold text-neon-cyan tracking-[0.3em] uppercase opacity-85 mt-3.5">
                    Cyber Intel & Neural Engine
                </p>

                {/* Cyber Loading Animation */}
                <div className="mt-16 w-72 sm:w-80 space-y-4">
                    {/* Progress Bar Container */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px] relative">
                        {/* Glowing Bar */}
                        <div
                            className="h-full bg-gradient-to-r from-primary-blue via-neon-cyan to-primary-blue rounded-full transition-all duration-100 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Stats & Decrypted Codes */}
                    <div className="flex items-center justify-between font-mono text-[9px] font-bold text-dark-500 uppercase tracking-widest px-1">
                        <span className="text-neon-cyan animate-pulse">{statusText}</span>
                        <span className="text-white font-black">{progress}%</span>
                    </div>
                </div>
            </div>

            {/* Corner Cyber Frames (Classic high-tech grid corners) */}
            <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white/10" />
            <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white/10" />
            <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-white/10" />
            <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-white/10" />
        </div>
    );
}
