"use client";
import Link from "next/link";
import { useState } from "react";
import { gunakanValidasiAuth } from "@/fungsi/gunakanValidasiAuth";
import { gunakanNotifikasi } from "@/fungsi/gunakanNotifikasi";
import AlertKustom from "@/komponen/feedback/alert-kustom";
import Logo from "@/komponen/bersama/logo";
import { Eye, EyeOff, Check } from "lucide-react";

export default function DaftarPage() {
    const {
        nama, setNama,
        email, setEmail, isEmailValid,
        password, setPassword, isPasswordValid,
        konfirmasiPassword, setKonfirmasiPassword, isPasswordMatch,
    } = gunakanValidasiAuth();
    const { modal, tampilSukses, tampilError, tutupModal } = gunakanNotifikasi();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nama.trim()) {
            tampilError("Error!", "Nama lengkap harus diisi.");
            return;
        }
        if (!isEmailValid) {
            tampilError("Error!", "Format email tidak valid.");
            return;
        }
        if (!isPasswordValid) {
            tampilError("Error!", "Password harus minimal 8 karakter.");
            return;
        }
        if (!isPasswordMatch) {
            tampilError("Error!", "Konfirmasi password tidak cocok.");
            return;
        }
        tampilSukses("Registrasi Berhasil!", "Akun Anda telah dibuat. Silakan login untuk melanjutkan.");
    };

    return (
        <>
            <AlertKustom modal={modal} onTutup={tutupModal} />

            <div className="w-full animate-fade-in px-4">
                {/* Header */}
                <div className="mb-10 text-center">
                    <Link href="/" className="inline-flex items-center gap-3 mb-10 group scale-125 origin-bottom">
                        <Logo size="lg" />
                    </Link>

                    <h1 className="text-5xl font-black text-white mb-3 tracking-tighter">Registrasi Akun</h1>
                    <p className="text-dark-300 font-medium leading-relaxed italic">
                        Securing the digital frontier, one node at a time.
                    </p>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="glass-panel p-10 md:p-12 rounded-[2.5rem] space-y-7 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hyper-violet to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    {/* Nama */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-bold text-dark-300 uppercase tracking-widest pl-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            placeholder="Masukkan nama lengkap"
                            className={`w-full px-5 py-3.5 rounded-xl bg-dark-950/50 border text-white placeholder-dark-500 outline-none transition-all duration-300 focus:ring-2 ${nama.length > 0
                                ? "border-primary-blue focus:ring-primary-blue/20"
                                : "border-white/10 focus:border-neon-cyan focus:ring-neon-cyan/20"
                                }`}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-bold text-dark-300 uppercase tracking-widest pl-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nama@email.com"
                            className={`w-full px-5 py-3.5 rounded-xl bg-dark-950/50 border text-white placeholder-dark-500 outline-none transition-all duration-300 focus:ring-2 ${email.length > 0
                                ? isEmailValid
                                    ? "border-status-success focus:ring-status-success/20"
                                    : "border-status-error focus:ring-status-error/20"
                                : "border-white/10 focus:border-neon-cyan focus:ring-neon-cyan/20"
                                }`}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-bold text-dark-300 uppercase tracking-widest pl-1">
                            Create Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Buat password"
                                className={`w-full px-5 py-3.5 pr-14 rounded-xl bg-dark-950/50 border text-white placeholder-dark-500 outline-none transition-all duration-300 focus:ring-2 ${password.length > 0
                                    ? isPasswordValid
                                        ? "border-status-success focus:ring-status-success/20"
                                        : "border-status-error focus:ring-status-error/20"
                                    : "border-white/10 focus:border-neon-cyan focus:ring-neon-cyan/20"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors p-2"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                                ) : (
                                    <Eye className="w-5 h-5" strokeWidth={1.5} />
                                )}
                            </button>
                        </div>
                        {/* Strength bar shortened for cleaner look */}
                        {password.length > 0 && (
                            <div className="px-1 pt-1">
                                <div className="h-1 w-full bg-dark-950 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-500 ${password.length >= 8 ? 'bg-status-success' : 'bg-status-error'} w-[${Math.min(100, (password.length/8)*100)}%]`} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-bold text-dark-300 uppercase tracking-widest pl-1">
                            Verify Access Key
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={konfirmasiPassword}
                                onChange={(e) => setKonfirmasiPassword(e.target.value)}
                                placeholder="Ulangi password"
                                className={`w-full px-5 py-3.5 pr-14 rounded-xl bg-dark-950/50 border text-white placeholder-dark-500 outline-none transition-all duration-300 focus:ring-2 ${konfirmasiPassword.length > 0
                                    ? isPasswordMatch
                                        ? "border-status-success focus:ring-status-success/20"
                                        : "border-status-error focus:ring-status-error/20"
                                    : "border-white/10 focus:border-neon-cyan focus:ring-neon-cyan/20"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors p-2"
                            >
                                {showConfirm ? (
                                    <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                                ) : (
                                    <Eye className="w-5 h-5" strokeWidth={1.5} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-4 cursor-pointer group/check">
                        <div className="relative flex items-center justify-center mt-0.5">
                            <input type="checkbox" className="peer appearance-none w-5 h-5 rounded border border-white/20 bg-dark-900 checked:bg-hyper-violet checked:border-hyper-violet transition-all cursor-pointer" />
                            <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
                        </div>
                        <span className="text-sm text-dark-300 font-medium group-hover/check:text-white transition-colors leading-tight">
                            Saya menyetujui seluruh <a href="#" className="text-hyper-violet hover:text-white transition-colors underline underline-offset-2">Protokol Keamanan</a> dan <a href="#" className="text-hyper-violet hover:text-white transition-colors underline underline-offset-2">Kebijakan Privasi</a> FraudGuard.
                        </span>
                    </label>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-5 rounded-2xl bg-primary-blue hover:bg-primary-blue-hover text-white font-black text-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-95 cursor-pointer"
                    >
                        INISIASI AKUN
                    </button>
                </form>

                {/* Footer link */}
                <p className="mt-8 text-center text-sm font-bold text-dark-400">
                    Sudah Terdaftar?{" "}
                    <Link href="/login" className="text-neon-cyan hover:text-white transition-colors underline underline-offset-4">
                        Masuk Terminal
                    </Link>
                </p>
            </div>
        </>
    );
}
