import { useParams } from "wouter";
import { useGetLaporanById, useGetKebutuhanByLaporan, getGetLaporanByIdQueryKey, getGetKebutuhanByLaporanQueryKey } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, JenisBadge } from "@/components/StatusBadge";
import KebutuhanProgress from "@/components/KebutuhanProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Users, Phone, User, Calendar, Image } from "lucide-react";

export default function LaporanDetail() {
  const { id } = useParams<{ id: string }>();
  const laporanId = parseInt(id);

  const { data: laporan, isLoading } = useGetLaporanById(laporanId, { query: { enabled: !!laporanId, queryKey: getGetLaporanByIdQueryKey(laporanId) } });
  const { data: kebutuhan } = useGetKebutuhanByLaporan(laporanId, { query: { enabled: !!laporanId, queryKey: getGetKebutuhanByLaporanQueryKey(laporanId) } });

  if (isLoading) return (
    <AppLayout title="Detail Laporan" backHref="/pelapor" role="pelapor">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    </AppLayout>
  );

  if (!laporan) return (
    <AppLayout title="Detail Laporan" backHref="/pelapor" role="pelapor">
      <p className="text-muted-foreground">Laporan tidak ditemukan.</p>
    </AppLayout>
  );

  return (
    <AppLayout title="Detail Laporan" backHref="/pelapor" backLabel="Dashboard" role="pelapor">
      <div className="max-w-3xl space-y-5">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <JenisBadge jenis={laporan.jenis_bencana} />
            <StatusBadge status={laporan.status} />
          </div>
          <h1 className="text-2xl font-bold">{laporan.judul}</h1>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(laporan.created_at).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Informasi Kejadian</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Lokasi</p>
                <p className="text-muted-foreground">{laporan.lokasi}</p>
              </div>
            </div>
            {laporan.lokasi_pengungsian && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Lokasi Pengungsian</p>
                  <p className="text-muted-foreground">{laporan.lokasi_pengungsian}</p>
                </div>
              </div>
            )}
            {laporan.jumlah_terdampak && (
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Jumlah Terdampak</p>
                  <p className="text-muted-foreground">{laporan.jumlah_terdampak.toLocaleString()} jiwa</p>
                </div>
              </div>
            )}
            <div className="border-t pt-3">
              <p className="font-medium mb-1">Deskripsi</p>
              <p className="text-muted-foreground leading-relaxed">{laporan.deskripsi}</p>
            </div>
            {laporan.catatan_admin && (
              <div className="border-t pt-3">
                <p className="font-medium mb-1 text-primary">Catatan Admin</p>
                <p className="text-muted-foreground">{laporan.catatan_admin}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Pelapor</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{laporan.nama_pelapor}{laporan.jabatan_pelapor ? ` — ${laporan.jabatan_pelapor}` : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{laporan.kontak_pelapor}</span>
            </div>
          </CardContent>
        </Card>

        {laporan.foto_urls && laporan.foto_urls.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Image className="h-4 w-4" /> Dokumentasi</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {laporan.foto_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary underline truncate max-w-[200px]">
                    Foto {i + 1}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Kebutuhan Bantuan</CardTitle></CardHeader>
          <CardContent>
            <KebutuhanProgress items={kebutuhan || []} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
