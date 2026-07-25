"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    LayoutDashboard, 
    Search, 
    Activity, 
    FileText, 
    FlaskConical, 
    ChevronLeft, 
    ChevronRight, 
    BookOpen, 
    X,
    Check
} from "lucide-react";

interface ModalPanduanProps {
    isOpen: boolean;
    onClose: () => void;
}

const LANGKAH_PANDUAN = [
    {
        title: "Pantau Ringkasan Dasbor",
        highlight: "Analisis Real-Time",
        description: "Dashboard utama menampilkan status kesehatan operasional, grafik tren ancaman, akurasi klasifikasi model AI (XGBoost & Gemini), serta total fraud terdeteksi secara real-time.",
        icon: LayoutDashboard,
        color: "text-neon-cyan",
        bgColor: "bg-neon-cyan/10",
        borderColor: "border-neon-cyan/25",
        glowColor: "shadow-neon-cyan/30",
        gradient: "from-neon-cyan/20 via-primary-blue/10 to-transparent",
    },
    {
        title: "Investigasi Peta Ancaman",
        highlight: "Geolokasi Bahaya",
        description: "Visualisasikan serangan siber regional secara langsung. Peta Ancaman interaktif memetakan asal serangan dan target transaksi mencurigakan di berbagai daerah di Indonesia.",
        icon: Search,
        color: "text-hyper-violet",
        bgColor: "bg-hyper-violet/10",
        borderColor: "border-hyper-violet/25",
        glowColor: "shadow-hyper-violet/30",
        gradient: "from-hyper-violet/20 via-neon-cyan/10 to-transparent",
    },
    {
        title: "Analisis Log Transaksi & XAI",
        highlight: "Transparansi AI",
        description: "Buka halaman Transaksi untuk memfilter log aktivitas. Dapatkan analisis forensik Explainable AI (XAI) yang mendeskripsikan secara detail indikasi fraud pada setiap transaksi.",
        icon: Activity,
        color: "text-status-error",
        bgColor: "bg-status-error/10",
        borderColor: "border-status-error/25",
        glowColor: "shadow-status-error/30",
        gradient: "from-status-error/20 via-hyper-violet/10 to-transparent",
    },
    {
        title: "Unduh Laporan Audit PDF",
        highlight: "Kepatuhan Resmi",
        description: "Generate berkas PDF ringkasan ancaman secara instan dari halaman Laporan. Dokumen ini dirancang khusus untuk kebutuhan pelaporan eksekutif dan audit regulasi.",
        icon: FileText,
        color: "text-status-success",
        bgColor: "bg-status-success/10",
        borderColor: "border-status-success/25",
        glowColor: "shadow-status-success/30",
        gradient: "from-status-success/20 via-primary-blue/10 to-transparent",
    },
    {
        title: "Uji Sensitivitas Simulasi",
        highlight: "Simulasi Serangan",
        description: "Gunakan menu Simulasi untuk memicu skenario fraud (seperti Identity Theft, Account Takeover, Phishing) dan lihat bagaimana AI mendeteksi ancaman tersebut seketika.",
        icon: FlaskConical,
        color: "text-amber-warning",
        bgColor: "bg-amber-warning/10",
        borderColor: "border-amber-warning/25",
        glowColor: "shadow-amber-warning/30",
        gradient: "from-amber-warning/20 via-status-error/10 to-transparent",
    }
];

export default function ModalPanduan({ isOpen, onClose }: ModalPanduanProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const stepInfo = LANGKAH_PANDUAN[currentStep];
    const IconComponent = stepInfo.icon;

    const handleNext = () => {
        if (currentStep < LANGKAH_PANDUAN.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleFinish = () => {
        setCurrentStep(0);
        onClose();
        router.push("/dasbor/panduan");
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fade-in">
            {/* Modal Container */}
            <div className="relative bg-[#0b1329] border border-white/10 rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col animate-scale-up">
                
                {/* Glow bar at top based on active step's color */}
                <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-current to-transparent opacity-85 ${stepInfo.color} transition-all duration-500`} />

                {/* Close/Skip button at top right */}
                <button
                    onClick={handleFinish}
                    className="absolute top-6 right-6 p-2 rounded-full border border-white/5 bg-white/5 text-dark-400 hover:text-white transition-all cursor-pointer hover:bg-white/10 active:scale-90 z-10"
                    aria-label="Tutup panduan"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Body Content */}
                <div className="p-8 md:p-10 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Badge Panduan */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-blue/15 text-neon-cyan text-[10px] font-black tracking-widest uppercase">
                        <BookOpen className="w-3.5 h-3.5" />
                        Panduan Amankan Fraud
                    </div>

                    {/* Stepper Progress Indicators */}
                    <div className="flex items-center justify-between gap-1.5 mt-2">
                        {LANGKAH_PANDUAN.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentStep(idx)}
                                className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                                    idx === currentStep
                                        ? `bg-gradient-to-r from-primary-blue to-neon-cyan shadow-[0_0_8px_rgba(6,182,212,0.5)]`
                                        : idx < currentStep
                                        ? "bg-neon-cyan/50"
                                        : "bg-white/5 hover:bg-white/10"
                                }`}
                                aria-label={`Buka langkah ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {/* Step Title & Content */}
                    <div className="space-y-6 py-2">
                        {/* Step count badge */}
                        <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">
                            Langkah {currentStep + 1} dari {LANGKAH_PANDUAN.length}
                        </div>

                        {/* Animated Module Card / Preview Illustration */}
                        <div className={`relative h-44 rounded-3xl border border-white/5 bg-gradient-to-b ${stepInfo.gradient} flex items-center justify-center overflow-hidden group/card transition-all duration-500`}>
                            {/* Decorative background grid */}
                            <div className="absolute inset-0 cyber-grid opacity-10" />
                            
                            {/* Glowing Icon in the center */}
                            <div className={`w-20 h-20 rounded-2xl ${stepInfo.bgColor} border ${stepInfo.borderColor} flex items-center justify-center shadow-lg ${stepInfo.glowColor} transition-all duration-500 transform group-hover/card:scale-105`}>
                                <IconComponent className={`w-10 h-10 ${stepInfo.color} transition-colors duration-500`} strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Title and Highlight */}
                        <div className="space-y-1">
                            <span className={`text-[10px] font-extrabold tracking-widest uppercase ${stepInfo.color} transition-colors duration-500`}>
                                {stepInfo.highlight}
                            </span>
                            <h2 className="text-xl md:text-2xl font-black text-white leading-tight uppercase tracking-tight">
                                {stepInfo.title}
                            </h2>
                        </div>

                        {/* Description */}
                        <p className="text-xs font-semibold text-dark-300 leading-relaxed font-sans min-h-[3.5rem]">
                            {stepInfo.description}
                        </p>
                    </div>

                    {/* Actions Navigation Bar */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                        {/* Back button */}
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className={`px-4 py-3 rounded-xl border border-white/5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all select-none ${
                                currentStep === 0
                                    ? "opacity-30 cursor-not-allowed text-dark-500 bg-transparent"
                                    : "bg-dark-900/50 text-dark-300 hover:text-white hover:bg-white/5 cursor-pointer active:scale-95"
                            }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Sebelumnya
                        </button>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Next/Finish Button */}
                        <button
                            onClick={handleNext}
                            className={`px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                                currentStep === LANGKAH_PANDUAN.length - 1
                                    ? "bg-gradient-to-r from-neon-cyan to-primary-blue hover:from-cyan-400 hover:to-blue-500 text-dark-950 font-black shadow-neon-cyan/10 hover:shadow-lg"
                                    : "bg-white text-dark-950 hover:bg-dark-100 font-extrabold"
                            }`}
                        >
                            {currentStep === LANGKAH_PANDUAN.length - 1 ? (
                                <>
                                    Panduan Lengkap
                                    <BookOpen className="w-4 h-4" strokeWidth={2} />
                                </>
                            ) : (
                                <>
                                    Selanjutnya
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
