import { Link, useLocation } from "wouter";
import { useGetLaporanAktif, useGetPenugasan } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, JenisBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MapPin, AlertTriangle, ClipboardList, ExternalLink, Clock, CheckCircle2, XCircle, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.VITE_API_URL.replace(/\/$/, "");

export default function RelawanDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: laporanAktif, isLoading: loadingLaporan } = useGetLaporanAktif();
  const { data: penugasan, isLoading: loadingPenugasan } = useGetPenugasan({ status: "aktif" });

  // Cek apakah user ini sudah punya data relawan (by email)
  const { data: cekRelawan, isLoading: loadingCek } = useQuery({
    queryKey: ["relawan-cek-email", user?.email],
    queryFn: async () => {
      if (!user?.email) return { terdaftar: false };
      const res = await fetch(`${BASE}/api/relawan/cek-email?email=${encodeURIComponent(user.email)}`, {
        credentials: "include",
      });
      return res.json() as Promise<{ terdaftar: boolean; relawan?: any }>;
    },
    enabled: !!user?.email,
  });

  const sudahDaftar = cekRelawan?.terdaftar;
  const dataRelawan = cekRelawan?.relawan;

  const statusIcon = dataRelawan?.status_verifikasi === "terverifikasi"
    ? <CheckCircle2 className="h-4 w-4 text-green-600" />
    : dataRelawan?.status_verifikasi === "ditolak"
    ? <XCircle className="h-4 w-4 text-red-600" />
    : <Clock className="h-4 w-4 text-yellow-600" />;

  const statusText = dataRelawan?.status_verifikasi === "terverifikasi"
    ? "Anda telah terverifikasi sebagai relawan aktif"
    : dataRelawan?.status_verifikasi === "ditolak"
    ? "Pendaftaran Anda ditolak. Hubungi admin untuk informasi lebih lanjut."
    : "Pendaftaran Anda sedang menunggu verifikasi admin";

  const statusBg = dataRelawan?.status_verifikasi === "terverifikasi"
    ? "bg-green-50 border-green-200 text-green-800"
    : dataRelawan?.status_verifikasi === "ditolak"
    ? "bg-red-50 border-red-200 text-red-800"
    : "bg-yellow-50 border-yellow-200 text-yellow-800";

  return (
    <AppLayout
      title="Dashboard Relawan"
      role="relawan"
      actions={
        !loadingCek && !sudahDaftar ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/relawan/daftar">
              <Plus className="h-4 w-4 mr-1" /> Daftar Relawan
            </Link>
          </Button>
        ) : null
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pusat Relawan</h1>
          <p className="text-muted-foreground text-sm mt-1">Lihat laporan aktif dan penugasan Anda</p>
        </div>

        {/* Status pendaftaran relawan */}
        {!loadingCek && sudahDaftar && dataRelawan && (
          <div className={`flex items-start gap-3 border rounded-xl px-4 py-3 ${statusBg}`}>
            <span className="mt-0.5">{statusIcon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{statusText}</p>
              {dataRelawan.catatan_verifikasi && (
                <p className="text-xs mt-0.5 opacity-80">Catatan admin: {dataRelawan.catatan_verifikasi}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 h-7 px-2 text-xs border-current"
              onClick={() => navigate(`/relawan/${dataRelawan.id}`)}
            >
              <UserCheck className="h-3.5 w-3.5 mr-1" /> Lihat Profil
            </Button>
          </div>
        )}

        {!loadingCek && !sudahDaftar && (
          <Card className="border-dashed">
            <CardContent className="py-6 text-center">
              <UserCheck className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm font-medium mb-1">Belum terdaftar sebagai relawan</p>
              <p className="text-xs text-muted-foreground mb-3">Daftarkan diri Anda untuk bisa ditugaskan ke lokasi bencana</p>
              <Button asChild size="sm" variant="secondary">
                <Link href="/relawan/daftar">
                  <Plus className="h-4 w-4 mr-1" /> Daftar Sekarang
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Laporan Aktif */}
          <div>
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Laporan Aktif
            </h2>
            {loadingLaporan ? (
              <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
            ) : laporanAktif && laporanAktif.length > 0 ? (
              <div className="space-y-3">
                {laporanAktif.map(l => (
                  <Card key={l.id} className="hover:border-primary/40 transition-all">
                    <CardContent className="p-4">
                      <div className="flex gap-2 mb-1.5 flex-wrap">
                        <JenisBadge jenis={l.jenis_bencana} />
                        <StatusBadge status={l.status} />
                        {l.jumlah_kebutuhan_pending > 0 && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            {l.jumlah_kebutuhan_pending} kebutuhan
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-sm">{l.judul}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {l.lokasi}
                      </p>
                      {l.jumlah_terdampak && (
                        <p className="text-xs text-muted-foreground mt-0.5">{l.jumlah_terdampak.toLocaleString()} jiwa terdampak</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Tidak ada laporan aktif saat ini.
                </CardContent>
              </Card>
            )}
          </div>

          {/* Penugasan Aktif */}
          <div>
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-secondary" />
              Penugasan Aktif
            </h2>
            {loadingPenugasan ? (
              <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
            ) : penugasan && penugasan.length > 0 ? (
              <div className="space-y-3">
                {penugasan.map(p => (
                  <Card key={p.id} className="hover:border-secondary/40 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{p.detail_tugas}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" /> {p.lokasi_tugas}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">Relawan: {p.nama_relawan}</p>
                          {p.link_grup && (
                            <a href={p.link_grup} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                              <ExternalLink className="h-3 w-3" /> Bergabung ke Grup
                            </a>
                          )}
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Belum ada penugasan aktif.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
