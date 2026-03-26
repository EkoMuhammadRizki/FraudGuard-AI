"use client";
import { useState, useCallback } from "react";

export type TipeModal = "sukses" | "konfirmasi" | "error" | "peringatan";

export interface ModalState {
    isOpen: boolean;
    tipe: TipeModal;
    judul: string;
    pesan: string;
    onKonfirmasi?: () => void;
}

export function gunakanNotifikasi() {
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        tipe: "sukses",
        judul: "",
        pesan: "",
    });

    const tampilSukses = useCallback((judul: string, pesan: string) => {
        setModal({ isOpen: true, tipe: "sukses", judul, pesan });
    }, []);

    const tampilError = useCallback((judul: string, pesan: string) => {
        setModal({ isOpen: true, tipe: "error", judul, pesan });
    }, []);

    const tampilKonfirmasi = useCallback(
        (judul: string, pesan: string, onKonfirmasi: () => void) => {
            setModal({ isOpen: true, tipe: "konfirmasi", judul, pesan, onKonfirmasi });
        },
        []
    );

    const tampilPeringatan = useCallback((judul: string, pesan: string) => {
        setModal({ isOpen: true, tipe: "peringatan", judul, pesan });
    }, []);

    const tutupModal = useCallback(() => {
        setModal((prev) => ({ ...prev, isOpen: false }));
    }, []);

    return {
        modal,
        tampilSukses,
        tampilError,
        tampilKonfirmasi,
        tampilPeringatan,
        tutupModal,
    };
}
