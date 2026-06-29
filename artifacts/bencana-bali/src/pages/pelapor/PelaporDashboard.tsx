import { Link } from "wouter";
import { useGetLaporan } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, JenisBadge } from "@/components/StatusBadge";
import { Plus, MapPin, Users, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PelaporDashboard() {
  const { data: laporan, isLoading } = useGetLaporan();

  return (
    <AppLayout
      title="Dashboard Pelapor"
      subtitle="Bali Tanggap Bencana"
      role="pelapor"
      actions={
        <Button asChild size="sm">
          <Link href="/pelapor/laporan-baru">
            <Plus className="h-4 w-4 mr-1" /> Laporan Baru
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Laporan Bencana</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Semua laporan bencana yang telah disampaikan
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : laporan && laporan.length > 0 ? (
          <div className="space-y-3">
            {laporan.map(l => (
              <Link key={l.id} href={`/pelapor/laporan/${l.id}`}>
                <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                  <CardContent className="p-5">
                    {l.status === "menunggu" && (
                      <div className="flex items-center gap-2 mb-3 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>Menunggu verifikasi admin — laporan belum terlihat oleh donatur</span>
                      </div>
                    )}
                    {l.status === "terverifikasi" && (
                      <div className="flex items-center gap-2 mb-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Terverifikasi — laporan sudah ditampilkan kepada donatur</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <JenisBadge jenis={l.jenis_bencana} />
                          <StatusBadge status={l.status} />
                        </div>
                        <h3 className="font-semibold text-sm truncate">{l.judul}</h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {l.lokasi}
                          </span>
                          {l.jumlah_terdampak && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {l.jumlah_terdampak} jiwa
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(l.created_at).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground mb-4">Belum ada laporan. Buat laporan pertama Anda.</p>
              <Button asChild>
                <Link href="/pelapor/laporan-baru">
                  <Plus className="h-4 w-4 mr-1" /> Buat Laporan
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
