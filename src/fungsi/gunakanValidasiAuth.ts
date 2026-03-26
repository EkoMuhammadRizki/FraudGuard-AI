"use client";
import { useState, useCallback } from "react";

interface ValidasiAuth {
    password: string;
    konfirmasiPassword: string;
    isPasswordValid: boolean;
    isPasswordMatch: boolean;
    setPassword: (val: string) => void;
    setKonfirmasiPassword: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    isEmailValid: boolean;
    nama: string;
    setNama: (val: string) => void;
}

export function gunakanValidasiAuth(): ValidasiAuth {
    const [password, setPasswordState] = useState("");
    const [konfirmasiPassword, setKonfirmasiPasswordState] = useState("");
    const [email, setEmailState] = useState("");
    const [nama, setNamaState] = useState("");

    const isPasswordValid = password.length >= 8;
    const isPasswordMatch =
        konfirmasiPassword.length > 0 && password === konfirmasiPassword;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const setPassword = useCallback((val: string) => setPasswordState(val), []);
    const setKonfirmasiPassword = useCallback(
        (val: string) => setKonfirmasiPasswordState(val),
        []
    );
    const setEmail = useCallback((val: string) => setEmailState(val), []);
    const setNama = useCallback((val: string) => setNamaState(val), []);

    return {
        password,
        konfirmasiPassword,
        isPasswordValid,
        isPasswordMatch,
        setPassword,
        setKonfirmasiPassword,
        email,
        setEmail,
        isEmailValid,
        nama,
        setNama,
    };
}
