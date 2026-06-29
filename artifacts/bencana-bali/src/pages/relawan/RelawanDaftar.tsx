import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCreateRelawan, getGetRelawanQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Users, Loader2 } from "lucide-react";

const KEAHLIAN_OPTIONS = [
  "Medis", "SAR (Search & Rescue)", "Logistik", "Komunikasi", "Transportasi", "Psikologi", "Memasak", "Lainnya"
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function RelawanDaftar() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const createRelawan = useCreateRelawan();
  const [checking, setChecking] = useState(true);

  const [form, setForm] = useState({
    nama: "", nik: "", no_hp: "", email: "", alamat: "", foto_ktp_url: "",
  });
  const [keahlian, setKeahlian] = useState<string[]>([]);

  // Cek saat mount — jika sudah terdaftar, redirect ke profil
  useEffect(() => {
    if (!user?.email) { setChecking(false); return; }
    fetch(`${BASE}/api/relawan/cek-email?email=${encodeURIComponent(user.email)}`, {
      credentials: "include",
    })
      .then(r => r.json())
      .then((data: { terdaftar: boolean; relawan?: any }) => {
        if (data.terdaftar && data.relawan) {
          toast({
            title: "Sudah terdaftar",
            description: "Anda sudah memiliki data relawan. Mengarahkan ke profil Anda...",
          });
          navigate(`/relawan/${data.relawan.id}`);
        } else {
          // Pre-fill email dari akun
          setForm(f => ({ ...f, email: user.email, nama: user.nama || "" }));
          setChecking(false);
        }
      })
      .catch(() => {
        setForm(f => ({ ...f, email: user?.email || "", nama: user?.nama || "" }));
        setChecking(false);
      });
  }, [user]);

  const handleChange = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const toggleKeahlian = (k: string) =>
    setKeahlian(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.nik || !form.no_hp || !form.alamat) {
      toast({ title: "Lengkapi data", description: "Field bertanda * wajib diisi.", variant: "destructive" });
      return;
    }
    createRelawan.mutate({
      data: {
        nama: form.nama,
        nik: form.nik,
        no_hp: form.no_hp,
        email: form.email || null,
        alamat: form.alamat,
        keahlian,
        foto_ktp_url: form.foto_ktp_url || null,
      }
    }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getGetRelawanQueryKey() });
        toast({ title: "Pendaftaran berhasil", description: "Data Anda sedang diverifikasi oleh admin." });
        navigate(`/relawan/${data.id}`);
      },
      onError: (err: any) => {
        const msg = err?.message || "";
        toast({
          title: "Gagal mendaftar",
          description: msg.includes("NIK") || msg.includes("Email") || msg.includes("sudah")
            ? msg
            : "Terjadi kesalahan saat mendaftar. Coba lagi.",
          variant: "destructive",
        });
      }
    });
  };

  if (checking) {
    return (
      <AppLayout title="Daftar Relawan" backHref="/relawan" backLabel="Dashboard" role="relawan">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Daftar Relawan" backHref="/relawan" backLabel="Dashboard" role="relawan">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Pendaftaran Relawan</h1>
            <p className="text-sm text-muted-foreground">Daftar sebagai relawan koordinasi bencana Bali</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Data Pribadi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nama">Nama Lengkap *</Label>
                  <Input id="nama" value={form.nama} onChange={e => handleChange("nama", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="nik">NIK (KTP) *</Label>
                  <Input id="nik" placeholder="16 digit" maxLength={16} value={form.nik} onChange={e => handleChange("nik", e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="no_hp">No. HP / WhatsApp *</Label>
                  <Input id="no_hp" value={form.no_hp} onChange={e => handleChange("no_hp", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} className="mt-1" readOnly={!!user?.email} />
                </div>
              </div>
              <div>
                <Label htmlFor="alamat">Alamat Lengkap *</Label>
                <Textarea id="alamat" rows={3} value={form.alamat} onChange={e => handleChange("alamat", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="foto_ktp_url">URL Foto KTP</Label>
                <Input id="foto_ktp_url" placeholder="Link foto KTP (Google Drive, dll.)" value={form.foto_ktp_url} onChange={e => handleChange("foto_ktp_url", e.target.value)} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Upload foto KTP ke Google Drive lalu masukkan link yang bisa diakses.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Keahlian</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {KEAHLIAN_OPTIONS.map(k => (
                  <div key={k} className="flex items-center gap-2">
                    <Checkbox id={k} checked={keahlian.includes(k)} onCheckedChange={() => toggleKeahlian(k)} />
                    <Label htmlFor={k} className="text-sm cursor-pointer">{k}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" variant="secondary" disabled={createRelawan.isPending}>
            {createRelawan.isPending ? "Mendaftar..." : "Kirim Pendaftaran"}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
