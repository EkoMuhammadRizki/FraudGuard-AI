"use client";
import { useState } from "react";
import { X, ArrowRight, ShieldCheck, Activity, Cpu, Bot } from "lucide-react";

interface InteractiveTourModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TOUR_STEPS = [
    {
        title: "Pencegahan Pre-Transaction (Mobile SDK)",
        subtitle: "Titik Deteksi Pertama Perangkat",
        description: "Mobile Telemetry SDK (<500KB) mendeteksi sinyal biometrik ketikan, ancaman remote desktop AnyDesk, dan perangkat rooted sebelum transaksi dikirimkan ke payment switch.",
        icon: <Cpu className="w-6 h-6 text-neon-cyan" />,
        highlight: "Latensi Sub-30ms & Bebas Blind Spot",
    },
    {
        title: "Apache Kafka x Live MongoDB Streaming",
        subtitle: "Pengolahan Event Streaming Berlatensi Rendah",
        description: "Aliran transaksi diproses real-time oleh Apache Kafka Event Bus dan terhubung live dengan MongoDB Atlas Cloud untuk penyajian feed transaksi instan.",
        icon: <Activity className="w-6 h-6 text-emerald-400" />,
        highlight: "Throughput >10.000 TPS & SLA BI-FAST",
    },
    {
        title: "Multi-Model Ensemble Engine & GraphML",
        subtitle: "Skoring Risiko Presisi Tinggi",
        description: "Kombinasi XGBoost (F1 81.48%, FPR 0.54%), LightGBM, dan GraphML mengekstrak fitur topologi sindikat rekening penampung (Money Mule Ring) secara efisien.",
        icon: <ShieldCheck className="w-6 h-6 text-hyper-violet" />,
        highlight: "False Positive Rate Ultra-Rendah 0.54%",
    },
    {
        title: "REMI AI Assistant & Laporan PDF Compliance",
        subtitle: "Explainable AI & Audit Hukum Instan",
        description: "REMI AI Multi-Model Chatbot menyajikan penjelasan berstandar POJK/UU PDP dan menghasilkan Laporan Audit PDF 1-Klik yang siap diserahkan ke IASC OJK/BI dan PPATK.",
        icon: <Bot className="w-6 h-6 text-amber-400" />,
        highlight: "Interpretabilitas 100% Berstandar IASC",
    },
];

export default function InteractiveTourModal({ isOpen, onClose }: InteractiveTourModalProps) {
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

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            {/* Dark Backdrop */}
            <div
                className="absolute inset-0 bg-dark-950/80 backdrop-blur-md animate-fade-in"
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
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="px-2.5 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-mono font-bold uppercase tracking-wider">
                        Panduan Interaktif ({currentStep + 1}/{TOUR_STEPS.length})
                    </span>
                </div>

                {/* Body Content */}
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-dark-950 border border-white/10 shadow-inner">
                            {step.icon}
                        </div>
                        <div>
                            <span className="text-[10px] font-mono font-bold text-dark-400 uppercase tracking-widest block">
                                {step.subtitle}
                            </span>
                            <h3 className="text-lg font-black text-white uppercase tracking-wide">
                                {step.title}
                            </h3>
                        </div>
                    </div>

                    <p className="text-xs text-dark-300 leading-relaxed font-medium">
                        {step.description}
                    </p>

                    <div className="p-3 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-dark-400 uppercase">Keunggulan Kunci:</span>
                        <span className="text-xs font-mono font-bold text-neon-cyan">{step.highlight}</span>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
                    <div className="flex gap-1.5">
                        {TOUR_STEPS.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentStep(idx)}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                    idx === currentStep ? "w-6 bg-neon-cyan" : "w-1.5 bg-white/20"
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-neon-cyan to-primary-blue text-dark-950 font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md shadow-neon-cyan/20 cursor-pointer"
                    >
                        <span>{isLastStep ? "Selesai Tur" : "Lanjut"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
