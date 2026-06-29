import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [location, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = new URLSearchParams(location.split("?")[1] ?? "").get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (redirectTo) {
        navigate(decodeURIComponent(redirectTo));
      } else if (user.role === "admin") navigate("/admin");
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
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
            <CardTitle className="text-2xl">Masuk</CardTitle>
            <CardDescription>Masuk ke akun Anda untuk mengakses platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
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
                Masuk
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Belum punya akun?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Daftar sekarang
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
