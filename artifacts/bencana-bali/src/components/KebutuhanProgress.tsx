import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Kebutuhan {
  id: number;
  kategori: string;
  nama_item: string;
  jumlah_dibutuhkan: number;
  jumlah_terpenuhi: number;
  satuan: string;
  keterangan?: string | null;
}

const KATEGORI_COLORS: Record<string, string> = {
  pangan: "bg-orange-500",
  sandang: "bg-blue-500",
  medis: "bg-red-500",
  tempat_tinggal: "bg-purple-500",
  air_bersih: "bg-cyan-500",
  lainnya: "bg-gray-500",
};

const KATEGORI_LABELS: Record<string, string> = {
  pangan: "Pangan",
  sandang: "Sandang",
  medis: "Medis",
  tempat_tinggal: "Tempat Tinggal",
  air_bersih: "Air Bersih",
  lainnya: "Lainnya",
};

export default function KebutuhanProgress({ items }: { items: Kebutuhan[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Belum ada kebutuhan yang dicatat.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map(item => {
        const pct = item.jumlah_dibutuhkan > 0
          ? Math.min(100, Math.round((item.jumlah_terpenuhi / item.jumlah_dibutuhkan) * 100))
          : 0;
        const colorClass = KATEGORI_COLORS[item.kategori] || "bg-gray-500";

        return (
          <div key={item.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", colorClass)} />
                <span className="text-sm font-medium">{item.nama_item}</span>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {KATEGORI_LABELS[item.kategori] || item.kategori}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {item.jumlah_terpenuhi}/{item.jumlah_dibutuhkan} {item.satuan}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={pct} className="h-2 flex-1" />
              <span className={cn(
                "text-xs font-bold w-10 text-right",
                pct === 100 ? "text-green-600" : pct > 50 ? "text-yellow-600" : "text-red-600"
              )}>
                {pct}%
              </span>
            </div>
            {item.keterangan && (
              <p className="text-xs text-muted-foreground">{item.keterangan}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
