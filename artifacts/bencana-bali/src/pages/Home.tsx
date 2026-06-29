import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle, Users, Shield, ArrowRight, Radio, MapPin,
  Package, Heart, FileText, Eye, ChevronRight, Loader2,
  TrendingUp, Clock, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchStats() {
  const res = await fetch(`${BASE}/api/dashboard/statistik`);
  return res.json();
}

const ROLE_CARDS = [
  {
    role: "donatur" as const,
    icon: Heart,
    label: "Donatur",
    color: "text-rose-500",
    borderHover: "hover:border-rose-400",
    iconBg: "bg-rose-50",
    badgeClass: "bg-rose-500 text-white",
    href: "/donatur",
    desc: "Salurkan bantuan dana atau barang untuk korban bencana. Lacak penggunaan donasi secara transparan.",
    features: ["Pilih bencana yang ingin dibantu", "Donasi dana atau barang", "Lacak transparansi bantuan"],
  },
  {
    role: "pelapor" as const,
    icon: FileText,
    label: "Pelapor",
    color: "text-primary",
    borderHover: "hover:border-primary",
    iconBg: "bg-primary/10",
    badgeClass: "bg-primary text-white",
    href: "/pelapor",
    desc: "Ketua RT, Kelian Banjar, atau warga yang ingin melaporkan kejadian bencana dan kebutuhan darurat.",
    features: ["Laporkan kejadian bencana", "Catat lokasi pengungsian", "Daftar kebutuhan darurat"],
  },
  {
    role: "relawan" as const,
    icon: Users,
    label: "Relawan",
    color: "text-secondary",
    borderHover: "hover:border-secondary",
    iconBg: "bg-secondary/10",
    badgeClass: "bg-secondary text-white",
    href: "/relawan",
    desc: "Daftar sebagai relawan lapangan. Lihat laporan aktif, ambil penugasan, dan bergabung ke grup koordinasi.",
    features: ["Lihat laporan aktif", "Ambil tugas relawan", "Bergabung grup koordinasi"],
  },
  {
    role: "admin" as const,
    icon: Shield,
    label: "Admin",
    color: "text-chart-4",
    borderHover: "hover:border-chart-4",
    iconBg: "bg-chart-4/10",
    badgeClass: "bg-chart-4 text-white",
    href: "/admin",
    desc: "Administrator sistem yang memverifikasi laporan, mengelola relawan, dan mendistribusikan bantuan.",
    features: ["Verifikasi laporan & relawan", "Kelola inventaris donasi", "Distribusi tugas relawan"],
  },
];

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-card border rounded-2xl p-5 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color + "/10")}>
        <Icon className={cn("h-6 w-6", color)} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value ?? "—"}</p>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchStats });

  const dashboardHref = user
    ? user.role === "admin" ? "/admin"
    : user.role === "relawan" ? "/relawan"
    : user.role === "pelapor" ? "/pelapor"
    : "/donatur"
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm sm:text-base">Bali Tanggap Bencana</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/transparansi">
                <Eye className="h-4 w-4 mr-1.5" />
                Transparansi
              </Link>
            </Button>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : user ? (
              <Button asChild size="sm">
                <Link href={dashboardHref!}>
                  Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Daftar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative bg-primary text-primary-foreground overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-5 border-primary-foreground/30 text-primary-foreground text-xs font-semibold tracking-wider uppercase px-3 py-1">
              <Radio className="h-3 w-3 mr-1.5 inline" /> Sistem Aktif 24/7
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-5 leading-[1.05]">
              Bali Tanggap
              <br />
              <span className="text-secondary">Bencana</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mb-8 leading-relaxed">
              Platform koordinasi bencana alam terpadu untuk wilayah Bali — menghubungkan pelapor lapangan, relawan, donatur, dan admin dalam satu sistem yang cepat dan terorganisir.
            </p>
            <div className="flex flex-wrap gap-3">
              {!loading && !user && (
                <>
                  <Button asChild size="lg" variant="secondary" className="font-semibold">
                    <Link href="/register">
                      Bergabung Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    <Link href="/transparansi">
                      <Eye className="mr-2 h-5 w-5" /> Lihat Transparansi
                    </Link>
                  </Button>
                </>
              )}
              {!loading && user && dashboardHref && (
                <Button asChild size="lg" variant="secondary" className="font-semibold">
                  <Link href={dashboardHref}>
                    Buka Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-6 mt-10 text-sm text-primary-foreground/60">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>Wilayah Provinsi Bali</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Terverifikasi BPBD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="bg-muted/30 border-b">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={AlertTriangle} label="Laporan Bencana" value={stats.total_laporan} sub={`${stats.laporan_menunggu} menunggu verifikasi`} color="text-primary" />
              <StatCard icon={Users} label="Relawan Aktif" value={stats.relawan_terverifikasi} sub={`${stats.total_relawan} terdaftar`} color="text-secondary" />
              <StatCard icon={Package} label="Item Inventaris" value={stats.total_inventaris} sub={`${stats.stok_kritis} stok kritis`} color="text-chart-4" />
              <StatCard icon={TrendingUp} label="Penugasan Aktif" value={stats.penugasan_aktif} sub="relawan sedang bertugas" color="text-rose-500" />
            </div>
          </div>
        </div>
      )}

      {/* Role Cards */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Pilih Peran Anda</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Setiap peran memiliki akses dan fitur yang berbeda, disesuaikan dengan kebutuhan koordinasi bencana.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ROLE_CARDS.map(card => {
            const Icon = card.icon;
            const isCurrentRole = user?.role === card.role;
            return (
              <Card key={card.role} className={cn(
                "group border-2 transition-all duration-200 cursor-pointer",
                card.borderHover,
                "hover:shadow-lg",
                isCurrentRole && "ring-2 ring-primary"
              )}>
                <CardContent className="p-6 flex flex-col h-full">
                  {isCurrentRole && (
                    <Badge className="self-start mb-3 text-xs bg-primary/10 text-primary border-0">Peran Anda</Badge>
                  )}
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", card.iconBg)}>
                    <Icon className={cn("h-6 w-6", card.color)} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{card.label}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">{card.desc}</p>
                  <div className="space-y-1.5 mb-5">
                    {card.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", card.color)} />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Button asChild size="sm" variant={isCurrentRole ? "default" : "outline"} className="w-full mt-auto">
                    <Link href={card.href}>
                      {isCurrentRole ? "Buka Dashboard" : `Masuk sebagai ${card.label}`}
                      <ChevronRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Transparency CTA */}
      <div className="bg-muted/40 border-y">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" /> Laporan Transparansi Publik
            </h3>
            <p className="text-muted-foreground">
              Semua aktivitas penanganan bencana, foto dokumentasi, dan penyaluran bantuan dapat dipantau oleh siapapun tanpa login.
            </p>
          </div>
          <Button asChild variant="outline" size="lg" className="shrink-0">
            <Link href="/transparansi">
              Lihat Laporan Lengkap <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <footer className="border-t py-10 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <AlertTriangle className="h-3 w-3 text-white" />
          </div>
          <span className="font-semibold text-foreground">Bali Tanggap Bencana</span>
        </div>
        <p>Sistem Koordinasi Resmi Wilayah Bali &mdash; Aktif 24/7</p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs">
          <Link href="/transparansi" className="hover:text-primary hover:underline">Transparansi</Link>
          <span>·</span>
          <Link href="/login" className="hover:text-primary hover:underline">Masuk</Link>
          <span>·</span>
          <Link href="/register" className="hover:text-primary hover:underline">Daftar</Link>
        </div>
      </footer>
    </div>
  );
}
