"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, Bot, KeyRound } from "lucide-react";

interface UnifiedAuthCardProps {
    initialMode?: "login" | "register" | "reset";
}

// Preset Akun MongoDB untuk pengujian cepat (juri, eko, ihya, ibin, reza)
const DEMO_ACCOUNTS = [
    { username: "juri", password: "juri123", role: "Juri FDS" },
    { username: "eko", password: "eko123", role: "Lead Dev" },
    { username: "ihya", password: "ihya123", role: "Analyst" },
    { username: "ibin", password: "ibin123", role: "Security" },
    { username: "reza", password: "reza123", role: "ML Engineer" },
];

export default function UnifiedAuthCard({ initialMode = "login" }: UnifiedAuthCardProps) {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "register" | "reset">(initialMode);
    
    // State form login, register & reset
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Auto fill dari tombol cepat akun MongoDB
    const handleQuickFill = (acc: typeof DEMO_ACCOUNTS[0]) => {
        setUsername(acc.username);
        setPassword(acc.password);
        setErrorMessage("");
    };

    // Submit Handler Login
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!username.trim() || !password.trim()) {
            setErrorMessage("Username/Email dan Password wajib diisi.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok && data.status === "success") {
                setSuccessMessage(data.message || "Login Berhasil! Mengalihkan ke Dasbor...");
                if (typeof window !== "undefined") {
                    sessionStorage.setItem("fg_show_modal_on_login", "true");
                    if (data.user) {
                        localStorage.setItem("fg_user", JSON.stringify(data.user));
                        sessionStorage.setItem("fg_user", JSON.stringify(data.user));
                    }
                }
                setTimeout(() => {
                    router.push("/dasbor/ringkasan");
                }, 1000);
            } else {
                setErrorMessage(data.message || "Gagal masuk. Periksa kembali username/password Anda.");
            }
        } catch {
            setErrorMessage("Terjadi kesalahan jaringan saat autentikasi.");
        } finally {
            setLoading(false);
        }
    };

    // Submit Handler Register
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!username.trim() || !email.trim() || !password.trim()) {
            setErrorMessage("Seluruh kolom pendaftaran wajib diisi.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Password minimal 6 karakter.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await res.json();

            if (res.ok && data.status === "success") {
                setSuccessMessage("Pendaftaran akun MongoDB berhasil! Beralih ke halaman Login...");
                setTimeout(() => {
                    setMode("login");
                    setSuccessMessage("");
                    setPassword("");
                }, 1200);
            } else {
                setErrorMessage(data.message || "Gagal mendaftar. Username/Email mungkin sudah ada.");
            }
        } catch {
            setErrorMessage("Terjadi kesalahan jaringan saat mendaftar.");
        } finally {
            setLoading(false);
        }
    };

    // Submit Handler Reset Password
    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!username.trim() || !newPassword.trim()) {
            setErrorMessage("Username/Email dan Password Baru wajib diisi.");
            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage("Password baru minimal 6 karakter.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, newPassword }),
            });

            const data = await res.json();

            if (res.ok && data.status === "success") {
                setSuccessMessage(data.message || "Password berhasil diperbarui! Silakan login kembali.");
                setTimeout(() => {
                    setPassword(newPassword);
                    setMode("login");
                    setSuccessMessage("Password diperbarui. Silakan klik Login untuk masuk.");
                }, 1500);
            } else {
                setErrorMessage(data.message || "Gagal menyetel ulang password.");
            }
        } catch {
            setErrorMessage("Terjadi kesalahan jaringan saat reset password.");
        } finally {
            setLoading(false);
        }
    };

    const isLogin = mode === "login";
    const isRegister = mode === "register";
    const isReset = mode === "reset";

    return (
        <div className="w-full max-w-4xl bg-dark-900/95 border border-white/10 rounded-[2.5rem] shadow-[0_25px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden relative min-h-[620px]">
            
            {/* Tombol Kembalikan ke Beranda Landing */}
            <Link 
                href="/"
                className="absolute top-4 left-4 z-40 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-dark-950/70 hover:bg-dark-950 border border-white/10 text-dark-300 hover:text-neon-cyan font-mono text-xs transition-all backdrop-blur-md"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Beranda</span>
            </Link>

            {/* ════════════════════════════════════════════════════════════════════
               SLIDING CURVED OVERLAY PANEL (Meluncur Kiri <-> Kanan)
            ════════════════════════════════════════════════════════════════════ */}
            <div
                className={`
                    w-full md:w-1/2 min-h-[300px] md:min-h-[620px]
                    absolute top-0 bottom-0 z-30
                    bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#2563EB]
                    p-8 md:p-12 text-white flex flex-col items-center justify-center text-center
                    overflow-hidden transition-all duration-700 cubic-bezier(0.65, 0, 0.35, 1)
                    ${isLogin || isReset 
                        ? "left-0 md:translate-x-0 md:rounded-r-[6rem] md:rounded-l-none rounded-b-[3rem] border-r border-white/10" 
                        : "left-0 md:translate-x-full md:rounded-l-[6rem] md:rounded-r-none rounded-b-[3rem] border-l border-white/10"
                    }
                `}
            >
                {/* Background Cyber Glow & Grid */}
                <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />
                <div className="absolute -top-16 -left-16 w-48 h-48 bg-neon-cyan/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-hyper-violet/40 rounded-full blur-3xl pointer-events-none" />

                {/* Content Inside Sliding Overlay */}
                <div className="relative z-10 space-y-4 max-w-xs transition-all duration-500">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-mono uppercase tracking-widest mb-1 backdrop-blur-sm">
                        <Bot className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
                        <span>Cyber Intel FDS</span>
                    </div>

                    {isLogin && (
                        <div className="space-y-4 animate-fade-in">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic leading-tight">
                                HELLO, <br />
                                <span className="inline-block pr-4 py-1 bg-gradient-to-r from-neon-cyan via-white to-neon-cyan bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
                                    WELCOME!
                                </span>
                            </h2>
                            <p className="text-slate-200 text-xs font-medium leading-relaxed">
                                Don't have an account? Access next-gen fraud protection instantly.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode("register");
                                    setErrorMessage("");
                                    setSuccessMessage("");
                                }}
                                className="mt-4 px-8 py-3 rounded-full border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-dark-950 font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] active:scale-95 cursor-pointer"
                            >
                                Register
                            </button>
                        </div>
                    )}

                    {isRegister && (
                        <div className="space-y-4 animate-fade-in">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic leading-tight">
                                WELCOME <br />
                                <span className="inline-block pr-4 py-1 bg-gradient-to-r from-neon-cyan via-white to-neon-cyan bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
                                    BACK!
                                </span>
                            </h2>
                            <p className="text-slate-200 text-xs font-medium leading-relaxed">
                                Already have an account? Log in to manage your fraud intelligence dashboard.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode("login");
                                    setErrorMessage("");
                                    setSuccessMessage("");
                                }}
                                className="mt-4 px-8 py-3 rounded-full border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-dark-950 font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] active:scale-95 cursor-pointer"
                            >
                                Login
                            </button>
                        </div>
                    )}

                    {isReset && (
                        <div className="space-y-4 animate-fade-in">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase italic leading-tight">
                                RECOVERY <br />
                                <span className="inline-block pr-4 py-1 bg-gradient-to-r from-neon-cyan via-white to-neon-cyan bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]">
                                    MODE!
                                </span>
                            </h2>
                            <p className="text-slate-200 text-xs font-medium leading-relaxed">
                                Lupa kata sandi Anda? Setel ulang kunci akses MongoDB Anda secara aman di sini.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode("login");
                                    setErrorMessage("");
                                    setSuccessMessage("");
                                }}
                                className="mt-4 px-8 py-3 rounded-full border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-dark-950 font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] active:scale-95 cursor-pointer"
                            >
                                Kembalikan ke Login
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════════
               BACKGROUND FORMS CONTAINER (REGISTER DI KIRI, LOGIN/RESET DI KANAN)
            ════════════════════════════════════════════════════════════════════ */}
            <div className="w-full flex flex-col md:flex-row min-h-[620px] relative">

                {/* ─── REGISTER FORM (Berada di Sisi Kiri) ─── */}
                <div 
                    className={`
                        w-full md:w-1/2 p-8 md:p-12 bg-dark-950/90 flex flex-col justify-center
                        transition-all duration-700 ease-in-out
                        ${isRegister ? "opacity-100 translate-x-0" : "opacity-30 pointer-events-none translate-x-[-20px]"}
                    `}
                >
                    <div className="max-w-sm mx-auto w-full space-y-5 pt-8 md:pt-0">
                        <div className="text-center md:text-left space-y-1">
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <h2 className="text-3xl font-black text-white uppercase tracking-wider">Registration</h2>
                                <span className="px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-mono font-bold uppercase">New Account</span>
                            </div>
                            <p className="text-xs text-dark-400 font-medium">Buat akun baru untuk akses FraudGuard AI</p>
                        </div>

                        {/* Alert Messages (Register) */}
                        {isRegister && errorMessage && (
                            <div className="p-3 bg-status-error/10 border border-status-error/30 rounded-xl text-xs font-semibold text-status-error animate-shake">
                                {errorMessage}
                            </div>
                        )}
                        {isRegister && successMessage && (
                            <div className="p-3 bg-status-success/10 border border-status-success/30 rounded-xl text-xs font-semibold text-status-success animate-fade-in">
                                {successMessage}
                            </div>
                        )}

                        {/* Register Form Inputs */}
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    style={{ colorScheme: "dark" }}
                                    className="w-full pl-4 pr-11 py-3 bg-dark-900 border border-white/15 rounded-2xl text-sm font-mono text-white placeholder-dark-500 outline-none focus:border-neon-cyan/80 focus:ring-1 focus:ring-neon-cyan/40 transition-all shadow-inner"
                                />
                                <User className="w-4 h-4 text-neon-cyan absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    style={{ colorScheme: "dark" }}
                                    className="w-full pl-4 pr-11 py-3 bg-dark-900 border border-white/15 rounded-2xl text-sm font-mono text-white placeholder-dark-500 outline-none focus:border-neon-cyan/80 focus:ring-1 focus:ring-neon-cyan/40 transition-all shadow-inner"
                                />
                                <Mail className="w-4 h-4 text-neon-cyan absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    style={{ colorScheme: "dark" }}
                                    className="w-full pl-4 pr-11 py-3 bg-dark-900 border border-white/15 rounded-2xl text-sm font-mono text-white placeholder-dark-500 outline-none focus:border-neon-cyan/80 focus:ring-1 focus:ring-neon-cyan/40 transition-all shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4 text-neon-cyan" /> : <Lock className="w-4 h-4 text-dark-400" />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-neon-cyan via-primary-blue to-hyper-violet text-dark-950 font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 shadow-lg shadow-neon-cyan/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
                            >
                                <span>{loading ? "Registering..." : "Register"}</span>
                            </button>
                        </form>
                    </div>
                </div>


                {/* ─── LOGIN / RESET FORM (Berada di Sisi Kanan) ─── */}
                <div 
                    className={`
                        w-full md:w-1/2 p-8 md:p-12 bg-dark-950/90 flex flex-col justify-center
                        transition-all duration-700 ease-in-out
                        ${isLogin || isReset ? "opacity-100 translate-x-0" : "opacity-30 pointer-events-none translate-x-[20px]"}
                    `}
                >
                    <div className="max-w-sm mx-auto w-full space-y-5 pt-8 md:pt-0">
                        
                        {/* HEADER LOGIN / RESET */}
                        {isReset ? (
                            <div className="text-center md:text-left space-y-1 animate-fade-in">
                                <div className="flex items-center gap-2 justify-center md:justify-start">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-wider">Reset Password</h2>
                                    <span className="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-mono font-bold uppercase">Recovery</span>
                                </div>
                                <p className="text-xs text-dark-400 font-medium">Setel ulang kata sandi akses akun FraudGuard Anda</p>
                            </div>
                        ) : (
                            <div className="text-center md:text-left space-y-1 animate-fade-in">
                                <div className="flex items-center gap-2 justify-center md:justify-start">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-wider">Login</h2>
                                    <span className="px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-mono font-bold uppercase">v2.0</span>
                                </div>
                                <p className="text-xs text-dark-400 font-medium">Masuk ke sistem deteksi FraudGuard AI</p>
                            </div>
                        )}

                        {/* Preset Quick Fill Buttons untuk Akun MongoDB (Hanya Tampil di Mode Login) */}
                        {isLogin && (
                            <div className="bg-dark-900/90 p-3 rounded-2xl border border-white/10 animate-fade-in">
                                <p className="text-[10px] font-mono font-bold text-dark-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-neon-cyan" />
                                    <span>Pilih Akun MongoDB (Pintas 1-Klik):</span>
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {DEMO_ACCOUNTS.map((acc) => (
                                        <button
                                            key={acc.username}
                                            type="button"
                                            onClick={() => handleQuickFill(acc)}
                                            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                                                username === acc.username
                                                    ? "bg-gradient-to-r from-neon-cyan to-primary-blue text-dark-950 font-black shadow-md shadow-neon-cyan/20"
                                                    : "bg-white/5 hover:bg-neon-cyan/10 text-dark-300 hover:text-neon-cyan border border-white/10 hover:border-neon-cyan/30"
                                            }`}
                                        >
                                            {acc.username}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Alert Messages (Login / Reset) */}
                        {(isLogin || isReset) && errorMessage && (
                            <div className="p-3 bg-status-error/10 border border-status-error/30 rounded-xl text-xs font-semibold text-status-error animate-shake">
                                {errorMessage}
                            </div>
                        )}
                        {(isLogin || isReset) && successMessage && (
                            <div className="p-3 bg-status-success/10 border border-status-success/30 rounded-xl text-xs font-semibold text-status-success animate-fade-in">
                                {successMessage}
                            </div>
                        )}

                        {/* FORM RESET PASSWORD */}
                        {isReset ? (
                            <form onSubmit={handleResetSubmit} className="space-y-4 animate-fade-in">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Username atau Email Terdaftar"
                                        style={{ colorScheme: "dark" }}
                                        className="w-full pl-4 pr-11 py-3 bg-dark-900 border border-white/15 rounded-2xl text-sm font-mono text-white placeholder-dark-500 outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/40 transition-all shadow-inner"
                                    />
                                    <User className="w-4 h-4 text-amber-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Password Baru"
                                        style={{ colorScheme: "dark" }}
                                        className="w-full pl-4 pr-11 py-3 bg-dark-900 border border-white/15 rounded-2xl text-sm font-mono text-white placeholder-dark-500 outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/40 transition-all shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4 text-dark-400" />}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-dark-950 font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 shadow-lg shadow-amber-400/20 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <KeyRound className="w-4 h-4 text-dark-950" />
                                    <span>{loading ? "Memproses Reset..." : "Reset Password Sekarang"}</span>
                                </button>

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode("login");
                                            setErrorMessage("");
                                            setSuccessMessage("");
                                        }}
                                        className="text-xs font-medium text-dark-400 hover:text-white transition-colors underline underline-offset-4"
                                    >
                                        Ingat Password Anda? Kembali ke Login
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* FORM LOGIN */
                            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Username"
                                        style={{ colorScheme: "dark" }}
                                        className="w-full pl-4 pr-11 py-3 bg-dark-900 border border-white/15 rounded-2xl text-sm font-mono text-white placeholder-dark-500 outline-none focus:border-neon-cyan/80 focus:ring-1 focus:ring-neon-cyan/40 transition-all shadow-inner"
                                    />
                                    <User className="w-4 h-4 text-neon-cyan absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        style={{ colorScheme: "dark" }}
                                        className="w-full pl-4 pr-11 py-3 bg-dark-900 border border-white/15 rounded-2xl text-sm font-mono text-white placeholder-dark-500 outline-none focus:border-neon-cyan/80 focus:ring-1 focus:ring-neon-cyan/40 transition-all shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4 text-neon-cyan" /> : <Lock className="w-4 h-4 text-dark-400" />}
                                    </button>
                                </div>

                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setMode("reset");
                                            setErrorMessage("");
                                            setSuccessMessage("");
                                        }}
                                        className="text-xs font-medium text-dark-400 hover:text-neon-cyan transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-neon-cyan via-primary-blue to-hyper-violet text-dark-950 font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 shadow-lg shadow-neon-cyan/20 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <span>{loading ? "Authenticating..." : "Login"}</span>
                                </button>
                            </form>
                        )}

                    </div>
                </div>

            </div>

        </div>
    );
}
