import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  menunggu: { label: "Menunggu", class: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400" },
  terverifikasi: { label: "Terverifikasi", class: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400" },
  selesai: { label: "Selesai", class: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400" },
  ditolak: { label: "Ditolak", class: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400" },
  aktif: { label: "Aktif", class: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400" },
  dibatalkan: { label: "Dibatalkan", class: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400" },
};

const JENIS_CONFIG: Record<string, { label: string; class: string }> = {
  banjir: { label: "Banjir", class: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  gempa_bumi: { label: "Gempa Bumi", class: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
  tanah_longsor: { label: "Tanah Longsor", class: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400" },
  kebakaran: { label: "Kebakaran", class: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
  angin_kencang: { label: "Angin Kencang", class: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400" },
  tsunami: { label: "Tsunami", class: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400" },
  lainnya: { label: "Lainnya", class: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, class: "bg-gray-100 text-gray-600" };
  return <Badge variant="outline" className={cn("text-xs font-semibold", cfg.class)}>{cfg.label}</Badge>;
}

export function JenisBadge({ jenis }: { jenis: string }) {
  const cfg = JENIS_CONFIG[jenis] || { label: jenis, class: "bg-gray-100 text-gray-600" };
  return <Badge variant="outline" className={cn("text-xs", cfg.class)}>{cfg.label}</Badge>;
}

export function KategoriBadge({ kategori }: { kategori: string }) {
  const labels: Record<string, string> = {
    pangan: "Pangan", sandang: "Sandang", medis: "Medis",
    tempat_tinggal: "Tempat Tinggal", air_bersih: "Air Bersih", lainnya: "Lainnya",
  };
  return <Badge variant="outline" className="text-xs">{labels[kategori] || kategori}</Badge>;
}
