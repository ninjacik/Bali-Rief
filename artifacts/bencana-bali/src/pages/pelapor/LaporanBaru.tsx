import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateLaporan, getGetLaporanQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Plus, Trash2, Package } from "lucide-react";

const JENIS_BENCANA = [
  { value: "banjir", label: "Banjir" },
  { value: "gempa_bumi", label: "Gempa Bumi" },
  { value: "tanah_longsor", label: "Tanah Longsor" },
  { value: "kebakaran", label: "Kebakaran" },
  { value: "angin_kencang", label: "Angin Kencang" },
  { value: "tsunami", label: "Tsunami" },
  { value: "lainnya", label: "Lainnya" },
];

const KATEGORI_OPTIONS = [
  "Makanan", "Minuman", "Pakaian", "Obat-obatan", "Perlengkapan Bayi",
  "Peralatan Dapur", "Tenda / Tempat Tinggal", "Selimut / Matras", "Lainnya",
];

const SATUAN_OPTIONS = ["pcs", "kg", "liter", "dus", "lusin", "sak", "unit", "lembar", "botol"];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type KebutuhanItem = {
  kategori: string;
  nama_item: string;
  jumlah_dibutuhkan: string;
  satuan: string;
  keterangan: string;
};

function emptyKebutuhan(): KebutuhanItem {
  return { kategori: "", nama_item: "", jumlah_dibutuhkan: "", satuan: "pcs", keterangan: "" };
}

export default function LaporanBaru() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createLaporan = useCreateLaporan();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    judul: "",
    jenis_bencana: "",
    lokasi: "",
    deskripsi: "",
    nama_pelapor: "",
    kontak_pelapor: "",
    jabatan_pelapor: "",
    jumlah_terdampak: "",
    lokasi_pengungsian: "",
    foto_urls: "",
  });

  const [kebutuhanList, setKebutuhanList] = useState<KebutuhanItem[]>([emptyKebutuhan()]);

  const handleChange = (key: string, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const updateKebutuhan = (i: number, key: keyof KebutuhanItem, value: string) =>
    setKebutuhanList(list => list.map((item, idx) => idx === i ? { ...item, [key]: value } : item));

  const addKebutuhan = () => setKebutuhanList(list => [...list, emptyKebutuhan()]);
  const removeKebutuhan = (i: number) => setKebutuhanList(list => list.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul || !form.jenis_bencana || !form.lokasi || !form.deskripsi || !form.nama_pelapor || !form.kontak_pelapor) {
      toast({ title: "Lengkapi data", description: "Field bertanda * wajib diisi.", variant: "destructive" });
      return;
    }

    const foto_urls = form.foto_urls ? form.foto_urls.split("\n").map(s => s.trim()).filter(Boolean) : [];
    const validKebutuhan = kebutuhanList.filter(k => k.nama_item && k.jumlah_dibutuhkan && k.kategori);

    setSubmitting(true);
    try {
      // Buat laporan dulu
      const res = await fetch(`${BASE}/api/laporan`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: form.judul,
          jenis_bencana: form.jenis_bencana,
          lokasi: form.lokasi,
          deskripsi: form.deskripsi,
          nama_pelapor: form.nama_pelapor,
          kontak_pelapor: form.kontak_pelapor,
          jabatan_pelapor: form.jabatan_pelapor || null,
          jumlah_terdampak: form.jumlah_terdampak ? parseInt(form.jumlah_terdampak) : null,
          lokasi_pengungsian: form.lokasi_pengungsian || null,
          foto_urls,
        }),
      });
      const laporan = await res.json();

      // Simpan kebutuhan jika ada
      if (validKebutuhan.length > 0) {
        await fetch(`${BASE}/api/laporan/${laporan.id}/kebutuhan-bulk`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validKebutuhan.map(k => ({
            kategori: k.kategori,
            nama_item: k.nama_item,
            jumlah_dibutuhkan: parseInt(k.jumlah_dibutuhkan),
            satuan: k.satuan,
            keterangan: k.keterangan || null,
          }))),
        });
      }

      queryClient.invalidateQueries({ queryKey: getGetLaporanQueryKey() });
      toast({ title: "Laporan berhasil dikirim", description: "Laporan Anda sedang diproses oleh admin." });
      navigate("/pelapor");
    } catch {
      toast({ title: "Gagal mengirim laporan", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Laporan Baru" backHref="/pelapor" backLabel="Dashboard" role="pelapor">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Form Laporan Bencana</h1>
            <p className="text-sm text-muted-foreground">Isi informasi kejadian bencana dengan lengkap dan akurat</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Kejadian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="judul">Judul Laporan *</Label>
                <Input id="judul" placeholder="cth: Banjir Parah di Desa Ubud" value={form.judul}
                  onChange={e => handleChange("judul", e.target.value)} className="mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Jenis Bencana *</Label>
                  <Select value={form.jenis_bencana} onValueChange={v => handleChange("jenis_bencana", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih jenis..." />
                    </SelectTrigger>
                    <SelectContent>
                      {JENIS_BENCANA.map(j => (
                        <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="jumlah_terdampak">Jumlah Terdampak (jiwa)</Label>
                  <Input id="jumlah_terdampak" type="number" placeholder="0" value={form.jumlah_terdampak}
                    onChange={e => handleChange("jumlah_terdampak", e.target.value)} className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="lokasi">Lokasi Kejadian *</Label>
                <Input id="lokasi" placeholder="cth: Banjar Ubud, Desa Ubud, Kec. Ubud, Gianyar" value={form.lokasi}
                  onChange={e => handleChange("lokasi", e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="lokasi_pengungsian">Lokasi Pengungsian</Label>
                <Input id="lokasi_pengungsian" placeholder="cth: Balai Banjar Ubud" value={form.lokasi_pengungsian}
                  onChange={e => handleChange("lokasi_pengungsian", e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="deskripsi">Deskripsi Kejadian *</Label>
                <Textarea id="deskripsi" placeholder="Jelaskan situasi bencana secara detail..." rows={4}
                  value={form.deskripsi} onChange={e => handleChange("deskripsi", e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="foto_urls">URL Foto/Video Dokumentasi</Label>
                <Textarea id="foto_urls" placeholder="Masukkan satu URL per baris..." rows={2}
                  value={form.foto_urls} onChange={e => handleChange("foto_urls", e.target.value)} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Upload ke Google Drive / WhatsApp, lalu masukkan link-nya.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Pelapor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nama_pelapor">Nama Lengkap *</Label>
                  <Input id="nama_pelapor" placeholder="Nama Anda" value={form.nama_pelapor}
                    onChange={e => handleChange("nama_pelapor", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="jabatan_pelapor">Jabatan</Label>
                  <Input id="jabatan_pelapor" placeholder="cth: Ketua RT 03" value={form.jabatan_pelapor}
                    onChange={e => handleChange("jabatan_pelapor", e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="kontak_pelapor">Nomor HP / WhatsApp *</Label>
                <Input id="kontak_pelapor" placeholder="08xxxxxxxxxx" value={form.kontak_pelapor}
                  onChange={e => handleChange("kontak_pelapor", e.target.value)} className="mt-1" />
              </div>
            </CardContent>
          </Card>

          {/* Daftar Kebutuhan */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-secondary" />
                  <CardTitle className="text-base">Daftar Kebutuhan</CardTitle>
                </div>
                <span className="text-xs text-muted-foreground">Opsional — bisa ditambah admin nanti</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {kebutuhanList.map((item, i) => (
                <div key={i} className="border rounded-xl p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted-foreground">Item #{i + 1}</span>
                    {kebutuhanList.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeKebutuhan(i)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Kategori</Label>
                      <Select value={item.kategori} onValueChange={v => updateKebutuhan(i, "kategori", v)}>
                        <SelectTrigger className="mt-1 h-8 text-xs">
                          <SelectValue placeholder="Pilih..." />
                        </SelectTrigger>
                        <SelectContent>
                          {KATEGORI_OPTIONS.map(k => (
                            <SelectItem key={k} value={k}>{k}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Nama Barang</Label>
                      <Input className="mt-1 h-8 text-xs" placeholder="cth: Beras, Selimut..." value={item.nama_item}
                        onChange={e => updateKebutuhan(i, "nama_item", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Jumlah Dibutuhkan</Label>
                      <Input className="mt-1 h-8 text-xs" type="number" placeholder="10" value={item.jumlah_dibutuhkan}
                        onChange={e => updateKebutuhan(i, "jumlah_dibutuhkan", e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Satuan</Label>
                      <Select value={item.satuan} onValueChange={v => updateKebutuhan(i, "satuan", v)}>
                        <SelectTrigger className="mt-1 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SATUAN_OPTIONS.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Keterangan (opsional)</Label>
                    <Input className="mt-1 h-8 text-xs" placeholder="cth: untuk 50 KK pengungsi" value={item.keterangan}
                      onChange={e => updateKebutuhan(i, "keterangan", e.target.value)} />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addKebutuhan} className="w-full gap-1.5 border-dashed">
                <Plus className="h-3.5 w-3.5" /> Tambah Item Kebutuhan
              </Button>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Mengirim..." : "Kirim Laporan"}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
