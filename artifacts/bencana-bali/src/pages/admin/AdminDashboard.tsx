import { Link } from "wouter";
import { useGetDashboardStatistik, useGetLaporanAktif } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JenisBadge, StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, Users, Package, ClipboardList,
  Clock, CheckCircle2, MapPin, ArrowRight, TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useGetDashboardStatistik();
  const { data: laporanAktif, isLoading: loadingLaporan } = useGetLaporanAktif();

  const kebutuhanPct = stats && stats.kebutuhan_total > 0
    ? Math.round((stats.kebutuhan_terpenuhi / stats.kebutuhan_total) * 100) : 0;

  return (
    <AppLayout
      title="Dashboard Admin"
      subtitle="Koordinasi Bencana Bali"
      role="admin"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pusat Komando</h1>
          <p className="text-muted-foreground text-sm mt-1">Statistik real-time sistem koordinasi bencana Bali</p>
        </div>

        {/* Stats Grid */}
        {loadingStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Laporan</p>
                      <p className="text-3xl font-bold mt-1">{stats.total_laporan}</p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                      {stats.laporan_menunggu} menunggu
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                      {stats.laporan_terverifikasi} aktif
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Relawan</p>
                      <p className="text-3xl font-bold mt-1">{stats.total_relawan}</p>
                    </div>
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                      {stats.relawan_terverifikasi} terverifikasi
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                      {stats.relawan_menunggu} pending
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-chart-3">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Inventaris</p>
                      <p className="text-3xl font-bold mt-1">{stats.total_inventaris}</p>
                    </div>
                    <Package className="h-5 w-5 text-chart-3" />
                  </div>
                  <div className="mt-3">
                    {stats.stok_kritis > 0 ? (
                      <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                        {stats.stok_kritis} stok kritis
                      </span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                        Stok aman
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-chart-4">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Penugasan Aktif</p>
                      <p className="text-3xl font-bold mt-1">{stats.penugasan_aktif}</p>
                    </div>
                    <ClipboardList className="h-5 w-5 text-chart-4" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Relawan sedang bertugas</p>
                </CardContent>
              </Card>
            </div>

            {/* Kebutuhan Progress */}
            {stats.kebutuhan_total > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <p className="font-semibold text-sm">Progress Pemenuhan Kebutuhan</p>
                    </div>
                    <span className="text-sm font-bold text-primary">{kebutuhanPct}%</span>
                  </div>
                  <Progress value={kebutuhanPct} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.kebutuhan_terpenuhi} dari {stats.kebutuhan_total} item kebutuhan terpenuhi
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Quick Nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/admin/laporan", label: "Kelola Laporan", icon: AlertTriangle, color: "text-primary" },
            { href: "/admin/relawan", label: "Kelola Relawan", icon: Users, color: "text-secondary" },
            { href: "/admin/inventaris", label: "Inventaris", icon: Package, color: "text-chart-3" },
            { href: "/admin/penugasan", label: "Penugasan", icon: ClipboardList, color: "text-chart-4" },
          ].map(({ href, label, icon: Icon, color }) => (
            <Link key={href} href={href}>
              <Card className="hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${color} shrink-0`} />
                  <span className="text-sm font-medium">{label}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Laporan Aktif */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Laporan Perlu Perhatian
            </h2>
            <Link href="/admin/laporan" className="text-sm text-primary hover:underline">Lihat semua</Link>
          </div>

          {loadingLaporan ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : laporanAktif && laporanAktif.length > 0 ? (
            <div className="space-y-2">
              {laporanAktif.slice(0, 5).map(l => (
                <Link key={l.id} href={`/admin/laporan/${l.id}`}>
                  <Card className="hover:border-primary/40 cursor-pointer transition-all">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex gap-2 shrink-0">
                        <JenisBadge jenis={l.jenis_bencana} />
                        <StatusBadge status={l.status} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{l.judul}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {l.lokasi}
                        </p>
                      </div>
                      {l.jumlah_kebutuhan_pending > 0 && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 shrink-0">
                          {l.jumlah_kebutuhan_pending} kebutuhan
                        </Badge>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Semua laporan sudah tertangani.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
