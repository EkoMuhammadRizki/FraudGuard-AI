"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    X, ArrowRight, ShieldCheck, Activity, Cpu, Bot,
    LayoutDashboard, Search, TestTube2, FileText, BookOpen, ChevronLeft
} from "lucide-react";

interface InteractiveTourModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TOUR_STEPS = [
    {
        title: "Pantau Ringkasan Dasbor & Live Metrics",
        subtitle: "Analisis Real-Time & Live Health Status",
        description: "Dashboard utama menampilkan status kesehatan operasional server, grafik tren ancaman 24 jam, persentase akurasi model AI (XGBoost, LightGBM, GNN), serta log live alert transaksi mencurigakan.",
        icon: <LayoutDashboard className="w-6 h-6 text-neon-cyan" />,
        highlight: "Monitoring Real-Time & Metrics 24/7",
    },
    {
        title: "Streaming Transaksi Live & Filter Risiko",
        subtitle: "Audit Arus Data Transaksi Finansial",
        description: "Pantau arus transaksi yang diproses real-time oleh Apache Kafka Event Broker. Dilengkapi filter status instan (Aman, Review, Ditolak) dan inspection drawer detail setiap transaksi.",
        icon: <Activity className="w-6 h-6 text-emerald-400" />,
        highlight: "Throughput >10.000 TPS & Latensi <50ms",
    },
    {
        title: "Ruang Investigasi & Transparansi XAI",
        subtitle: "Deep Analysis & Action Engine",
        description: "Analisis mendalam kasus Account Takeover (ATO), Money Mule Ring, dan Velocity Fraud. Didukung Explainable AI (SHAP/LIME) untuk transparansi keputusan AI dan aksi pembekuan akun instan.",
        icon: <Search className="w-6 h-6 text-hyper-violet" />,
        highlight: "Explainable AI (SHAP) & Pembekuan Akun",
    },
    {
        title: "Sandbox Simulasi & Mobile SDK Telemetry",
        subtitle: "Pengujian Skenario & Telemetri Biometrik",
        description: "Uji payload JSON skenario fraud kustom di Sandbox Simulasi, serta analisis sinyal telemetri biometrik perilaku ponsel (dwell time, touch pressure, tilt) dan ancaman Remote Desktop AnyDesk.",
        icon: <TestTube2 className="w-6 h-6 text-amber-400" />,
        highlight: "Deteksi Sinyal AnyDesk & Telemetri Biometrik",
    },
    {
        title: "Laporan Audit PDF & REMI AI Assistant",
        subtitle: "Compliance POJK 39 & Asisten AI Melayang",
        description: "Hasilkan Laporan Audit PDF 1-Klik berstandar regulasi OJK & BI untuk audit PPATK, serta manfaatkan REMI AI Assistant di widget melayang untuk query database & konsultasi hukum anti-fraud.",
        icon: <BookOpen className="w-6 h-6 text-neon-cyan" />,
        highlight: "Laporan 1-Klik & REMI AI Multi-Model",
    },
];

export default function InteractiveTourModal({ isOpen, onClose }: InteractiveTourModalProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const step = TOUR_STEPS[currentStep];
    const isLastStep = currentStep === TOUR_STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onClose();
            setCurrentStep(0);
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleOpenFullGuide = () => {
        onClose();
        setCurrentStep(0);
        router.push("/dasbor/panduan");
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            {/* Dark Backdrop */}
            <div
                className="absolute inset-0 bg-dark-950/85 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-lg bg-dark-900 border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden animate-fade-in">
                {/* Cyber Glow Accent */}
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-neon-cyan/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-hyper-violet/20 rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-full text-dark-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Tutup Panduan"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Badge */}
                <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-mono font-bold uppercase tracking-wider">
                        📖 Panduan Amankan Fraud ({currentStep + 1} dari {TOUR_STEPS.length})
                    </span>
                </div>

                {/* Body Content */}
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3.5 rounded-2xl bg-dark-950 border border-white/10 shadow-inner shrink-0">
                            {step.icon}
                        </div>
                        <div>
                            <span className="text-[10px] font-mono font-bold text-neon-cyan uppercase tracking-widest block">
                                {step.subtitle}
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide leading-tight">
                                {step.title}
                            </h3>
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm text-dark-300 leading-relaxed font-medium">
                        {step.description}
                    </p>

                    <div className="p-3.5 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-dark-400 uppercase">Keunggulan Kunci:</span>
                        <span className="text-xs font-mono font-bold text-neon-cyan">{step.highlight}</span>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-5 border-t border-white/10">
                    {/* Step Indicators */}
                    <div className="flex items-center gap-1.5">
                        {TOUR_STEPS.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentStep(idx)}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentStep ? "w-6 bg-neon-cyan" : "w-1.5 bg-white/20 hover:bg-white/40"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-dark-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all flex items-center gap-1"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Sebelumnya</span>
                            </button>
                        )}

                        {isLastStep ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleOpenFullGuide}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/25 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-neon-cyan/10 cursor-pointer"
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Panduan Lengkap</span>
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-primary-blue text-dark-950 font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md shadow-neon-cyan/20 cursor-pointer"
                                >
                                    <span>Selesai Tur</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-primary-blue text-dark-950 font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md shadow-neon-cyan/20 cursor-pointer"
                            >
                                <span>Selanjutnya</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
