// Utility helpers for Amankan Fraud
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
