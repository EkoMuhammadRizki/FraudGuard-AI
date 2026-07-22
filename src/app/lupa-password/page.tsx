import UnifiedAuthCard from "@/komponen/auth/unified-auth-card";

export default function LupaPasswordPage() {
    return (
        <div className="min-h-screen bg-dark-950 text-white flex items-center justify-center relative overflow-hidden py-10 px-4 font-sans">
            <UnifiedAuthCard initialMode="reset" />
        </div>
    );
}
