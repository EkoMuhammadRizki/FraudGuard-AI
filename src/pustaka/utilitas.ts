// Utility helpers for FraudGuard AI

export function cn(...classes: (string | undefined | false | null)[]): string {
    return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat("id-ID").format(num);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

export function getRiskColor(level: "rendah" | "sedang" | "tinggi" | "kritis"): string {
    const colors = {
        rendah: "text-emerald-400",
        sedang: "text-amber-warning",
        tinggi: "text-red-rose-light",
        kritis: "text-red-rose",
    };
    return colors[level];
}

export function getRiskBgColor(level: "rendah" | "sedang" | "tinggi" | "kritis"): string {
    const colors = {
        rendah: "bg-emerald-500/20 border-emerald-500/30",
        sedang: "bg-amber-warning/20 border-amber-warning/30",
        tinggi: "bg-red-rose-light/20 border-red-rose-light/30",
        kritis: "bg-red-rose/20 border-red-rose/30",
    };
    return colors[level];
}
