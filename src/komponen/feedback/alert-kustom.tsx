"use client";
import { useEffect, useRef } from "react";
import { CheckCircle, XCircle, AlertTriangle, AlertCircle } from "lucide-react";
import type { ModalState } from "@/fungsi/gunakanNotifikasi";

interface AlertKustomProps {
    modal: ModalState;
    onTutup: () => void;
}

export default function AlertKustom({ modal, onTutup }: AlertKustomProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (modal.isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [modal.isOpen]);

    if (!modal.isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onTutup();
    };

    const getIcon = () => {
        switch (modal.tipe) {
            case "sukses":
                return (
                    <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle className="w-8 h-8 text-status-success" strokeWidth={2.5} />
                    </div>
                );
            case "error":
                return (
                    <div className="w-16 h-16 rounded-full bg-status-error/10 flex items-center justify-center mx-auto mb-5">
                        <XCircle className="w-8 h-8 text-status-error" strokeWidth={2.5} />
                    </div>
                );
            case "konfirmasi":
                return (
                    <div className="w-20 h-20 rounded-full bg-amber-warning/20 flex items-center justify-center mx-auto mb-5">
                        <AlertTriangle className="w-10 h-10 text-amber-warning" strokeWidth={2.5} />
                    </div>
                );
            case "peringatan":
                return (
                    <div className="w-20 h-20 rounded-full bg-amber-warning/20 flex items-center justify-center mx-auto mb-5">
                        <AlertCircle className="w-10 h-10 text-amber-warning" strokeWidth={2} />
                    </div>
                );
        }
    };

    const getButtonStyle = () => {
        switch (modal.tipe) {
            case "sukses":
                return "bg-emerald-500 hover:bg-emerald-600 text-white";
            case "error":
                return "bg-red-rose hover:bg-red-rose-dark text-white";
            case "konfirmasi":
            case "peringatan":
                return "bg-amber-warning hover:bg-amber-500 text-dark-900";
        }
    };

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dark-900/80"
        >
            <div className="animate-fade-in w-full max-w-md rounded-lg border border-dark-700 bg-dark-800 p-8 text-center shadow-xl">
                {getIcon()}
                <h2 className="text-2xl font-bold text-dark-100 mb-2">{modal.judul}</h2>
                <p className="text-dark-400 mb-8 leading-relaxed">{modal.pesan}</p>

                {modal.tipe === "konfirmasi" ? (
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onTutup}
                            className="px-6 py-2.5 rounded bg-dark-700 hover:bg-dark-600 text-dark-100 font-medium transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => {
                                modal.onKonfirmasi?.();
                                onTutup();
                            }}
                            className="px-6 py-2.5 rounded bg-status-error hover:bg-red-600 text-white font-medium transition-colors cursor-pointer"
                        >
                            Ya, Konfirmasi
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onTutup}
                        className={`px-8 py-2.5 rounded font-medium transition-colors cursor-pointer ${getButtonStyle()}`}
                    >
                        {modal.tipe === "sukses" ? "Lanjutkan" : "Tutup"}
                    </button>
                )}
            </div>
        </div>
    );
}
