"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { gunakanValidasiAuth } from "@/fungsi/gunakanValidasiAuth";
import { gunakanNotifikasi } from "@/fungsi/gunakanNotifikasi";
import AlertKustom from "@/komponen/feedback/alert-kustom";
import Logo from "@/komponen/bersama/logo";
import { Eye, EyeOff, Check } from "lucide-react";

// Test credentials
const TEST_EMAIL = "admin@fraudguard.ai";
const TEST_PASSWORD = "admin1234";

export default function LoginPage() {
    const router = useRouter();
    const { email, setEmail, password, setPassword, isPasswordValid, isEmailValid } =
        gunakanValidasiAuth();
    const { modal, tampilSukses, tampilError, tutupModal } = gunakanNotifikasi();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEmailValid) {
            tampilError("Error!", "Format email tidak valid. Silakan periksa kembali.");
            return;
        }
        if (!isPasswordValid) {
            tampilError("Error!", "Password harus minimal 8 karakter.");
            return;
        }
        if (email === TEST_EMAIL && password === TEST_PASSWORD) {
            tampilSukses("Berhasil!", "Login berhasil. Mengalihkan ke Dashboard...");
            setTimeout(() => router.push("/dasbor/ringkasan"), 1500);
        } else {
            tampilError("Login Gagal!", "Email atau password salah. Gunakan: admin@fraudguard.ai / admin1234");
        }
    };

    return (
        <>
            <AlertKustom modal={modal} onTutup={tutupModal} />

            <div className="w-full animate-fade-in px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 mb-12 group scale-125 origin-bottom">
                        <Logo size="lg" />
                    </Link>

                    <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">Login Akses</h1>
                    <p className="text-dark-300 font-medium leading-relaxed">
                        Silakan autentikasi untuk mengakses <br /> panel perintah utama.
                    </p>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="glass-panel p-10 md:p-12 rounded-[2.5rem] space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    {/* Email */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-dark-300 uppercase tracking-widest pl-1">
                            Identification / Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nama@email.com"
                            className={`w-full px-5 py-4 rounded-xl bg-dark-950/50 border text-white placeholder-dark-500 outline-none transition-all duration-300 focus:ring-2 ${email.length > 0
                                ? isEmailValid
                                    ? "border-status-success focus:ring-status-success/20"
                                    : "border-status-error focus:ring-status-error/20"
                                : "border-white/10 focus:border-neon-cyan focus:ring-neon-cyan/20 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                                }`}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-dark-300 uppercase tracking-widest pl-1">
                            Access Key / Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan password"
                                className={`w-full px-5 py-4 pr-14 rounded-xl bg-dark-950/50 border text-white placeholder-dark-500 outline-none transition-all duration-300 focus:ring-2 ${password.length > 0
                                    ? isPasswordValid
                                        ? "border-status-success focus:ring-status-success/20"
                                        : "border-status-error focus:ring-status-error/20"
                                    : "border-white/10 focus:border-neon-cyan focus:ring-neon-cyan/20 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
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
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group/check">
                            <div className="relative flex items-center justify-center">
                                <input type="checkbox" className="peer appearance-none w-5 h-5 rounded border border-white/20 bg-dark-900 checked:bg-primary-blue checked:border-primary-blue transition-all cursor-pointer" />
                                <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
                            </div>
                            <span className="text-sm text-dark-300 font-medium group-hover/check:text-white transition-colors">Ingat Sesi Ini</span>
                        </label>
                        <a href="#" className="text-sm text-neon-cyan hover:text-white font-bold transition-colors underline-offset-4 hover:underline">
                            Lupa Kredensial?
                        </a>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-5 rounded-2xl bg-primary-blue hover:bg-primary-blue-hover text-white font-black text-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-95 cursor-pointer"
                    >
                        AUTENTIKASI SEKARANG
                    </button>

                    {/* Divider */}
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                            <span className="bg-[#0f172a] px-5 text-dark-500">Secure Protocol</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <button
                        type="button"
                        className="w-full py-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-bold transition-all flex items-center justify-center gap-4 cursor-pointer"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Otorisasi via Google
                    </button>
                </form>

                {/* Footer link */}
                <p className="mt-6 text-center text-sm text-dark-500">
                    Belum punya akun?{" "}
                    <Link href="/daftar" className="text-primary-blue-light hover:text-white font-bold transition-colors">
                        Daftar sekarang
                    </Link>
                </p>
            </div>
        </>
    );
}
