import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MapPin, Users, Package, Heart, AlertTriangle, Building2,
  Phone, ChevronRight, Check, Loader2, Banknote, Box,
  Images, FileText, Target, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.VITE_API_URL.replace(/\/$/, "");

async function fetchBencanaAktif() {
  const res = await fetch(`${BASE}/api/donatur/bencana-aktif`, { credentials: "include" });
  return res.json();
}

async function submitDonasi(data: any) {
  const res = await fetch(`${BASE}/api/donasi`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  menunggu: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800" },
  terverifikasi: { label: "Aktif", color: "bg-blue-100 text-blue-800" },
  selesai: { label: "Selesai", color: "bg-green-100 text-green-800" },
};

const JENIS_MAP: Record<string, string> = {
  banjir: "Banjir", tanah_longsor: "Tanah Longsor", kebakaran: "Kebakaran",
  gempa_bumi: "Gempa Bumi", angin_kencang: "Angin Kencang", lainnya: "Lainnya",
};

const NOMINAL_OPTIONS = [50000, 100000, 250000, 500000, 1000000];

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatRupiahShort(n: number) {
  if (n >= 1_000_000_000) return "Rp " + (n / 1_000_000_000).toFixed(1) + " M";
  if (n >= 1_000_000) return "Rp " + (n / 1_000_000).toFixed(1) + " Jt";
  if (n >= 1_000) return "Rp " + (n / 1_000).toFixed(0) + " Rb";
  return "Rp " + n;
}

// ──── Sub-komponen progress kebutuhan (ringkasan di kartu) ────
function KebutuhanProgress({ kebutuhan }: { kebutuhan: any[] }) {
  const selesai = kebutuhan.filter(k => k.jumlah_terpenuhi >= k.jumlah_dibutuhkan);
  if (kebutuhan.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <Package className="h-3.5 w-3.5" />
        Kebutuhan Barang ({selesai.length}/{kebutuhan.length} terpenuhi)
      </p>
      <div className="space-y-1.5">
        {kebutuhan.slice(0, 3).map((k: any) => {
          const pct = Math.min(100, Math.round((k.jumlah_terpenuhi / k.jumlah_dibutuhkan) * 100));
          const sisa = Math.max(0, k.jumlah_dibutuhkan - k.jumlah_terpenuhi);
          return (
            <div key={k.id}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-medium truncate max-w-[180px]">{k.nama_item}</span>
                <span className={cn("text-xs", sisa === 0 ? "text-green-600 font-medium" : "text-muted-foreground")}>
                  {sisa === 0 ? "✓" : `Sisa ${sisa} ${k.satuan}`}
                </span>
              </div>
              <Progress value={pct} className={cn("h-1.5", sisa === 0 ? "[&>div]:bg-green-500" : "")} />
            </div>
          );
        })}
        {kebutuhan.length > 3 && (
          <p className="text-xs text-muted-foreground">+{kebutuhan.length - 3} item lainnya</p>
        )}
      </div>
    </div>
  );
}

// ──── Modal: Detail Bencana ────
function DetailModal({ bencana, open, onClose }: { bencana: any; open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"info" | "foto" | "kebutuhan" | "posko">("info");

  if (!bencana) return null;

  const tabs = [
    { key: "info", label: "Kronologi", icon: FileText },
    { key: "foto", label: "Foto", icon: Images },
    { key: "kebutuhan", label: "Kebutuhan", icon: Package },
    { key: "posko", label: "Posko", icon: Building2 },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="p-5 pb-3 border-b sticky top-0 bg-background z-10">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className="text-xs">{JENIS_MAP[bencana.jenis_bencana] || bencana.jenis_bencana}</Badge>
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", STATUS_MAP[bencana.status]?.color)}>
              {STATUS_MAP[bencana.status]?.label}
            </span>
          </div>
          <DialogTitle className="text-base leading-snug">{bencana.judul}</DialogTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <MapPin className="h-3 w-3" />{bencana.lokasi}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors shrink-0",
                  tab === t.key
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}>
                <Icon className="h-3.5 w-3.5" />{t.label}
              </button>
            );
          })}
        </div>

        <div className="p-5 space-y-4">
          {/* Tab: Kronologi */}
          {tab === "info" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Deskripsi Kejadian</p>
                <p className="text-sm leading-relaxed">{bencana.deskripsi}</p>
              </div>
              {bencana.kronologi ? (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Kronologi</p>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{bencana.kronologi}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Kronologi belum tersedia.</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {bencana.jumlah_terdampak && (
                  <div className="bg-muted/40 rounded-lg p-3">
                    <Users className="h-4 w-4 text-primary mb-1" />
                    <p className="font-bold text-lg">{bencana.jumlah_terdampak.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Jiwa Terdampak</p>
                  </div>
                )}
                {bencana.lokasi_pengungsian && (
                  <div className="bg-muted/40 rounded-lg p-3">
                    <MapPin className="h-4 w-4 text-blue-500 mb-1" />
                    <p className="font-semibold text-sm leading-tight">{bencana.lokasi_pengungsian}</p>
                    <p className="text-xs text-muted-foreground">Lokasi Pengungsian</p>
                  </div>
                )}
              </div>
              {bencana.catatan_admin && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Catatan Tim BPBD</p>
                  <p className="text-sm text-blue-800">{bencana.catatan_admin}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Foto */}
          {tab === "foto" && (
            <div>
              {bencana.foto_urls?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {bencana.foto_urls.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Foto ${i + 1}`}
                        className="w-full h-40 object-cover rounded-xl border hover:opacity-90 transition-opacity" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Images className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">Belum ada foto dokumentasi.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Kebutuhan */}
          {tab === "kebutuhan" && (
            <div>
              {bencana.kebutuhan?.length > 0 ? (
                <div className="space-y-2.5">
                  {bencana.kebutuhan.map((k: any) => {
                    const pct = Math.min(100, Math.round((k.jumlah_terpenuhi / k.jumlah_dibutuhkan) * 100));
                    const sisa = Math.max(0, k.jumlah_dibutuhkan - k.jumlah_terpenuhi);
                    return (
                      <div key={k.id} className="border rounded-xl p-3">
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <p className="font-semibold text-sm">{k.nama_item}</p>
                            <p className="text-xs text-muted-foreground">{k.kategori}</p>
                          </div>
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-2",
                            sisa === 0 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          )}>
                            {sisa === 0 ? "✓ Terpenuhi" : `Sisa ${sisa} ${k.satuan}`}
                          </span>
                        </div>
                        <Progress value={pct} className={cn("h-2 mb-1", sisa === 0 ? "[&>div]:bg-green-500" : "")} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{k.jumlah_terpenuhi} / {k.jumlah_dibutuhkan} {k.satuan}</span>
                          <span>{pct}%</span>
                        </div>
                        {k.keterangan && <p className="text-xs text-muted-foreground mt-1 italic">{k.keterangan}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">Belum ada daftar kebutuhan.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Posko */}
          {tab === "posko" && (
            <div className="space-y-3">
              {bencana.posko?.map((p: any, i: number) => (
                <div key={i} className="border rounded-xl p-4">
                  <p className="font-semibold text-sm mb-1">{p.nama}</p>
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-1">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{p.alamat}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <a href={`tel:${p.kontak}`} className="hover:text-primary">{p.kontak}</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ──── Modal: Donasi ────
function DonasiModal({ bencana, open, onClose, onSuccess }: {
  bencana: any; open: boolean; onClose: () => void; onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [step, setStep] = useState<"jenis" | "form">("jenis");
  const [donasiJenis, setDonasiJenis] = useState<"dana" | "barang" | null>(null);
  const [nominalCustom, setNominalCustom] = useState("");
  const [nominalPilihan, setNominalPilihan] = useState<number | null>(null);
  const [metodeBayar, setMetodeBayar] = useState("transfer");
  const [payStep, setPayStep] = useState<"form" | "konfirmasi" | "sukses">("form");
  const [selectedKebutuhan, setSelectedKebutuhan] = useState<any | null>(null);
  const [namaBarang, setNamaBarang] = useState("");
  const [jumlahBarang, setJumlahBarang] = useState("");
  const [pesan, setPesan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setStep("jenis"); setDonasiJenis(null);
    setNominalCustom(""); setNominalPilihan(null); setMetodeBayar("transfer"); setPayStep("form");
    setSelectedKebutuhan(null); setNamaBarang(""); setJumlahBarang(""); setPesan("");
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const nominalFinal = nominalPilihan || parseInt(nominalCustom.replace(/\D/g, ""));
      await submitDonasi({
        laporan_id: bencana?.id,
        jenis: donasiJenis,
        jumlah_dana: donasiJenis === "dana" ? nominalFinal : null,
        nama_barang: donasiJenis === "barang" ? namaBarang : null,
        jumlah_barang: donasiJenis === "barang" ? parseInt(jumlahBarang || "1") : null,
        kebutuhan_id: donasiJenis === "barang" && selectedKebutuhan ? selectedKebutuhan.id : null,
        nama_donatur: user?.nama || "Donatur",
        kontak_donatur: user?.email || "",
        pesan,
      });
      onSuccess();
      setPayStep("sukses");
    } finally {
      setSubmitting(false);
    }
  }

  const nominalFinal = nominalPilihan || parseInt(nominalCustom.replace(/\D/g, "") || "0");

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { onClose(); reset(); } }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base leading-tight pr-6">Donasi — {bencana?.judul}</DialogTitle>
        </DialogHeader>

        {/* Pilih jenis */}
        {step === "jenis" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Pilih jenis donasi:</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setDonasiJenis("dana"); setStep("form"); setPayStep("form"); }}
                className="flex flex-col items-center gap-3 rounded-xl border-2 p-5 hover:border-primary hover:bg-primary/5 transition-all text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Banknote className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Donasi Dana</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Transfer ke rekening resmi</p>
                </div>
              </button>
              <button onClick={() => { setDonasiJenis("barang"); setStep("form"); }}
                className="flex flex-col items-center gap-3 rounded-xl border-2 p-5 hover:border-primary hover:bg-primary/5 transition-all text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Box className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Donasi Barang</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Antarkan ke posko terdekat</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Form Dana */}
        {step === "form" && donasiJenis === "dana" && payStep === "form" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {NOMINAL_OPTIONS.map(n => (
                <button key={n} onClick={() => { setNominalPilihan(n); setNominalCustom(""); }}
                  className={cn("rounded-lg border-2 py-2 px-1.5 text-xs font-semibold transition-all",
                    nominalPilihan === n ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-muted-foreground/40")}>
                  {formatRupiah(n)}
                </button>
              ))}
            </div>
            <div>
              <Label className="text-xs">Atau nominal lain</Label>
              <Input placeholder="Rp 0" value={nominalCustom} onChange={e => { setNominalCustom(e.target.value); setNominalPilihan(null); }} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Metode Pembayaran</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[{ v: "transfer", l: "Transfer Bank" }, { v: "qris", l: "QRIS" }, { v: "ewallet", l: "e-Wallet" }].map(m => (
                  <button key={m.v} onClick={() => setMetodeBayar(m.v)}
                    className={cn("rounded-lg border-2 py-2 px-1.5 text-xs font-semibold transition-all",
                      metodeBayar === m.v ? "border-primary bg-primary/5 text-primary" : "border-border")}>
                    {m.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Pesan (opsional)</Label>
              <Textarea placeholder="Semangat..." value={pesan} onChange={e => setPesan(e.target.value)} rows={2} className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("jenis")} className="flex-1">Kembali</Button>
              <Button onClick={() => setPayStep("konfirmasi")} disabled={!nominalFinal} className="flex-1">Lanjut Bayar</Button>
            </div>
          </div>
        )}

        {step === "form" && donasiJenis === "dana" && payStep === "konfirmasi" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/50 p-4 space-y-3">
              <p className="font-semibold text-sm">Konfirmasi Donasi Dana</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jumlah</span>
                  <span className="font-bold text-lg text-green-600">{formatRupiah(nominalFinal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metode</span>
                  <span className="font-medium capitalize">{metodeBayar.replace("_", " ")}</span>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Rekening Tujuan</p>
                <div className="bg-card rounded-lg p-3 space-y-1">
                  <p className="font-bold">BNI — 012 345 6789</p>
                  <p className="text-sm">a.n. BPBD Provinsi Bali</p>
                  <p className="text-xs text-muted-foreground">Kode unik: BTB-{bencana?.id?.toString().padStart(4, "0")}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPayStep("form")} className="flex-1">Kembali</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-green-600 hover:bg-green-700">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Konfirmasi
              </Button>
            </div>
          </div>
        )}

        {/* Form Barang */}
        {step === "form" && donasiJenis === "barang" && payStep !== "sukses" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Antarkan ke Posko Terdekat
              </p>
              <div className="space-y-2">
                {bencana?.posko?.slice(0, 2).map((p: any, i: number) => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-amber-100">
                    <p className="font-semibold text-xs">{p.nama}</p>
                    <p className="text-xs text-muted-foreground">{p.alamat}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{p.kontak}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {bencana?.kebutuhan?.filter((k: any) => k.jumlah_terpenuhi < k.jumlah_dibutuhkan).length > 0 && (
              <div>
                <Label className="text-xs font-semibold">Pilih dari Daftar Kebutuhan</Label>
                <p className="text-xs text-muted-foreground mb-1.5">Klik untuk memilih, atau isi manual</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {bencana.kebutuhan.filter((k: any) => k.jumlah_terpenuhi < k.jumlah_dibutuhkan).map((k: any) => {
                    const sisa = k.jumlah_dibutuhkan - k.jumlah_terpenuhi;
                    const pct = Math.round((k.jumlah_terpenuhi / k.jumlah_dibutuhkan) * 100);
                    const isSelected = selectedKebutuhan?.id === k.id;
                    return (
                      <button key={k.id}
                        onClick={() => { setSelectedKebutuhan(k); setNamaBarang(k.nama_item); }}
                        className={cn("w-full text-left rounded-lg border-2 px-3 py-2 transition-all",
                          isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-medium">{k.nama_item}</span>
                          <span className="text-xs text-muted-foreground">Sisa {sisa} {k.satuan}</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs">Nama Barang *</Label>
              <Input placeholder="cth: Beras, Selimut..." value={namaBarang}
                onChange={e => { setNamaBarang(e.target.value); setSelectedKebutuhan(null); }} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Jumlah</Label>
              <Input type="number" placeholder="10" value={jumlahBarang} onChange={e => setJumlahBarang(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Pesan (opsional)</Label>
              <Textarea placeholder="Semangat..." value={pesan} onChange={e => setPesan(e.target.value)} rows={2} className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("jenis")} className="flex-1">Kembali</Button>
              <Button onClick={handleSubmit} disabled={submitting || !namaBarang} className="flex-1">
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Daftarkan Donasi
              </Button>
            </div>
          </div>
        )}

        {/* Sukses */}
        {payStep === "sukses" && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-600">
                {donasiJenis === "dana" ? "Donasi Dana Terdaftar!" : "Donasi Barang Terdaftar!"}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {donasiJenis === "dana"
                  ? "Silakan transfer ke rekening BPBD Bali. Terima kasih!"
                  : `Antarkan ${namaBarang} ke posko terdekat. Terima kasih!`}
              </p>
            </div>
            <Button onClick={() => { onClose(); reset(); }} className="w-full">Selesai</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ──── Kartu Bencana ────
function BencanaCard({ bencana, onDonasi, onDetail }: {
  bencana: any;
  onDonasi: () => void;
  onDetail: () => void;
}) {
  const [showKebutuhan, setShowKebutuhan] = useState(false);
  const terkumpul = bencana.total_dana_terkumpul || 0;
  const target = bencana.target_dana || 0;
  const danaPct = target > 0 ? Math.min(100, Math.round((terkumpul / target) * 100)) : null;

  return (
    <Card className="overflow-hidden border hover:shadow-md transition-shadow">
      <div className="flex items-stretch">
        <div className={cn("w-1.5 shrink-0",
          bencana.jenis_bencana === "banjir" ? "bg-blue-500" :
          bencana.jenis_bencana === "kebakaran" ? "bg-red-500" :
          bencana.jenis_bencana === "gempa_bumi" ? "bg-orange-500" : "bg-amber-500")} />
        <div className="flex-1 p-5">
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className="text-xs">{JENIS_MAP[bencana.jenis_bencana] || bencana.jenis_bencana}</Badge>
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", STATUS_MAP[bencana.status]?.color)}>
              {STATUS_MAP[bencana.status]?.label}
            </span>
          </div>
          <h2 className="text-lg font-bold leading-snug mb-1">{bencana.judul}</h2>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5" /><span>{bencana.lokasi}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{bencana.deskripsi}</p>

          {/* Progress Dana */}
          {target > 0 && (
            <div className="mb-4 bg-green-50 border border-green-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Target className="h-3.5 w-3.5 text-green-600" />
                <span className="text-xs font-semibold text-green-700">Target Dana</span>
              </div>
              <div className="flex items-end justify-between mb-1.5">
                <div>
                  <span className="text-lg font-bold text-green-800">{formatRupiahShort(terkumpul)}</span>
                  <span className="text-xs text-green-600 ml-1">terkumpul</span>
                </div>
                <span className="text-xs text-muted-foreground">dari {formatRupiahShort(target)}</span>
              </div>
              <Progress value={danaPct!} className="h-2.5 [&>div]:bg-green-500" />
              <p className="text-xs text-green-600 mt-1 text-right font-medium">{danaPct}%</p>
            </div>
          )}

          {/* Progress Kebutuhan (ringkasan) */}
          {bencana.kebutuhan?.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowKebutuhan(v => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2 w-full">
                <Package className="h-3.5 w-3.5" />
                Kebutuhan Barang ({bencana.kebutuhan.filter((k: any) => k.jumlah_terpenuhi >= k.jumlah_dibutuhkan).length}/{bencana.kebutuhan.length} terpenuhi)
                {showKebutuhan ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
              </button>
              {showKebutuhan && <KebutuhanProgress kebutuhan={bencana.kebutuhan} />}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onDetail} className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Lihat Detail
            </Button>
            <Button size="sm" onClick={onDonasi} className="gap-1.5 flex-1">
              <Heart className="h-3.5 w-3.5" />
              Donasikan Bantuan
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ──── Main Page ────
export default function DonaturDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: bencana = [], isLoading } = useQuery({
    queryKey: ["donatur-bencana-aktif"],
    queryFn: fetchBencanaAktif,
  });

  const [donasiTarget, setDonasiTarget] = useState<any | null>(null);
  const [detailTarget, setDetailTarget] = useState<any | null>(null);

  function handleDonasiSuccess() {
    queryClient.invalidateQueries({ queryKey: ["donatur-bencana-aktif"] });
  }

  return (
    <AppLayout title="Dashboard Donatur" subtitle="Bali Tanggap Bencana" role="donatur" showLogout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Halo, {user?.nama} 👋</h1>
          <p className="text-muted-foreground mt-1">Berikut bencana yang sedang aktif dan membutuhkan bantuan Anda.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : bencana.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Heart className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium mb-1">Belum ada bencana yang membutuhkan donasi</p>
              <p className="text-sm">Laporan bencana baru akan muncul setelah diverifikasi admin.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bencana.map((b: any) => (
              <BencanaCard
                key={b.id}
                bencana={b}
                onDonasi={() => setDonasiTarget(b)}
                onDetail={() => setDetailTarget(b)}
              />
            ))}
          </div>
        )}
      </div>

      <DetailModal
        bencana={detailTarget}
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
      />

      <DonasiModal
        bencana={donasiTarget}
        open={!!donasiTarget}
        onClose={() => setDonasiTarget(null)}
        onSuccess={handleDonasiSuccess}
      />
    </AppLayout>
  );
}
