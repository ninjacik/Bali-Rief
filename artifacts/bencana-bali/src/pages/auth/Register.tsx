import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Eye, EyeOff, Loader2, Users, Shield, Heart, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES: { value: UserRole; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  {
    value: "donatur",
    label: "Donatur",
    desc: "Donasikan barang atau dana untuk membantu korban bencana",
    icon: Heart,
    color: "text-rose-500",
  },
  {
    value: "relawan",
    label: "Relawan",
    desc: "Daftar sebagai relawan lapangan dan ikut membantu evakuasi",
    icon: Users,
    color: "text-secondary",
  },
  {
    value: "pelapor",
    label: "Pelapor",
    desc: "Ketua RT/Banjar yang ingin melaporkan kejadian bencana",
    icon: FileText,
    color: "text-primary",
  },
  {
    value: "admin",
    label: "Admin",
    desc: "Administrator sistem koordinasi bencana",
    icon: Shield,
    color: "text-chart-4",
  },
];

export default function Register() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("donatur");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await register({ nama, email, password, role });
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "relawan") navigate("/relawan");
      else if (user.role === "pelapor") navigate("/pelapor");
      else navigate("/donatur");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Bali Tanggap Bencana</span>
            </div>
          </Link>
        </div>

        <Card className="shadow-lg border-0 ring-1 ring-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Buat Akun</CardTitle>
            <CardDescription>Daftarkan diri Anda dan pilih peran dalam platform koordinasi bencana</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Pilih Peran Anda</Label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(r => {
                    const Icon = r.icon;
                    const selected = role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={cn(
                          "relative flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all",
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/40"
                        )}
                      >
                        {selected && (
                          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </span>
                        )}
                        <Icon className={cn("h-5 w-5", r.color)} />
                        <span className="font-semibold text-sm">{r.label}</span>
                        <span className="text-xs text-muted-foreground leading-tight">{r.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  placeholder="Nama lengkap Anda"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPass(v => !v)}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Daftar sebagai {ROLES.find(r => r.value === role)?.label}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Masuk
              </Link>
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              <Link href="/" className="hover:underline">
                ← Kembali ke beranda
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
