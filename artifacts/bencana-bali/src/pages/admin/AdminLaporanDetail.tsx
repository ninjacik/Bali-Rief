import { useState } from "react";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetLaporanById, useUpdateLaporan, useGetKebutuhanByLaporan,
  useCreateKebutuhan, useUpdateKebutuhan, useGetRelawan, useCreatePenugasan,
  getGetLaporanQueryKey, getGetLaporanByIdQueryKey, getGetKebutuhanByLaporanQueryKey,
  getGetDashboardStatistikQueryKey, getGetLaporanAktifQueryKey, getGetRelawanQueryKey
} from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, JenisBadge } from "@/components/StatusBadge";
import KebutuhanProgress from "@/components/KebutuhanProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Phone, User, CheckCircle2, XCircle, Plus, ClipboardList, Banknote, FileText, ChevronDown, ChevronUp } from "lucide-react";

const KATEGORI_OPTIONS = ["pangan", "sandang", "medis", "tempat_tinggal", "air_bersih", "lainnya"];
const KATEGORI_LABELS: Record<string, string> = {
  pangan: "Pangan", sandang: "Sandang", medis: "Medis",
  tempat_tinggal: "Tempat Tinggal", air_bersih: "Air Bersih", lainnya: "Lainnya"
};

export default function AdminLaporanDetail() {
  const { id } = useParams<{ id: string }>();
  const laporanId = parseInt(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: laporan, isLoading } = useGetLaporanById(laporanId, { query: { enabled: !!laporanId, queryKey: getGetLaporanByIdQueryKey(laporanId) } });
  const { data: kebutuhan } = useGetKebutuhanByLaporan(laporanId, { query: { enabled: !!laporanId, queryKey: getGetKebutuhanByLaporanQueryKey(laporanId) } });
  const { data: relawanList } = useGetRelawan({ status_verifikasi: "terverifikasi" }, { query: { queryKey: getGetRelawanQueryKey({ status_verifikasi: "terverifikasi" }) } });

  const updateLaporan = useUpdateLaporan();
  const createKebutuhan = useCreateKebutuhan();
  const updateKebutuhan = useUpdateKebutuhan();
  const createPenugasan = useCreatePenugasan();

  const [catatan, setCatatan] = useState("");
  const [targetDana, setTargetDana] = useState("");
  const [kronologi, setKronologi] = useState("");
  const [showDanaForm, setShowDanaForm] = useState(false);
  const [newKebutuhan, setNewKebutuhan] = useState({ kategori: "", nama_item: "", jumlah_dibutuhkan: "", satuan: "" });
  const [newPenugasan, setNewPenugasan] = useState({ relawan_id: "", detail_tugas: "", lokasi_tugas: "", link_grup: "" });
  const [showKebutuhanForm, setShowKebutuhanForm] = useState(false);
  const [showPenugasanForm, setShowPenugasanForm] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<Record<number, string>>({});

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetLaporanQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetLaporanByIdQueryKey(laporanId) });
    queryClient.invalidateQueries({ queryKey: getGetDashboardStatistikQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetLaporanAktifQueryKey() });
  };

  const handleVerify = (status: "terverifikasi" | "selesai") => {
    updateLaporan.mutate({ id: laporanId, data: { status, catatan_admin: catatan || undefined } }, {
      onSuccess: () => { invalidateAll(); toast({ title: `Laporan diperbarui ke status: ${status}` }); }
    });
  };

  const handleAddKebutuhan = () => {
    if (!newKebutuhan.kategori || !newKebutuhan.nama_item || !newKebutuhan.jumlah_dibutuhkan || !newKebutuhan.satuan) return;
    createKebutuhan.mutate({
      id: laporanId,
      data: { ...newKebutuhan, jumlah_dibutuhkan: parseInt(newKebutuhan.jumlah_dibutuhkan) } as any
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetKebutuhanByLaporanQueryKey(laporanId) });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatistikQueryKey() });
        setNewKebutuhan({ kategori: "", nama_item: "", jumlah_dibutuhkan: "", satuan: "" });
        setShowKebutuhanForm(false);
        toast({ title: "Kebutuhan berhasil ditambahkan" });
      }
    });
  };

  const handleUpdateProgress = (kebutuhanId: number) => {
    const val = updateProgress[kebutuhanId];
    if (!val) return;
    updateKebutuhan.mutate({ id: kebutuhanId, data: { jumlah_terpenuhi: parseInt(val) } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetKebutuhanByLaporanQueryKey(laporanId) });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatistikQueryKey() });
        setUpdateProgress(p => { const n = { ...p }; delete n[kebutuhanId]; return n; });
        toast({ title: "Progress kebutuhan diperbarui" });
      }
    });
  };

  const handleAddPenugasan = () => {
    if (!newPenugasan.relawan_id || !newPenugasan.detail_tugas || !newPenugasan.lokasi_tugas) return;
    const relawan = relawanList?.find(r => r.id === parseInt(newPenugasan.relawan_id));
    if (!relawan) return;
    createPenugasan.mutate({
      data: {
        laporan_id: laporanId,
        relawan_id: parseInt(newPenugasan.relawan_id),
        detail_tugas: newPenugasan.detail_tugas,
        lokasi_tugas: newPenugasan.lokasi_tugas,
        link_grup: newPenugasan.link_grup || null,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatistikQueryKey() });
        setNewPenugasan({ relawan_id: "", detail_tugas: "", lokasi_tugas: "", link_grup: "" });
        setShowPenugasanForm(false);
        toast({ title: "Penugasan berhasil dibuat" });
      }
    });
  };

  if (isLoading) return (
    <AppLayout title="Detail Laporan" backHref="/admin/laporan" role="admin">
      <Skeleton className="h-64 w-full" />
    </AppLayout>
  );

  if (!laporan) return (
    <AppLayout title="Detail Laporan" backHref="/admin/laporan" role="admin">
      <p className="text-muted-foreground">Laporan tidak ditemukan.</p>
    </AppLayout>
  );

  return (
    <AppLayout title="Detail Laporan" backHref="/admin/laporan" backLabel="Laporan" role="admin">
      <div className="max-w-3xl space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex gap-2 mb-2 flex-wrap">
              <JenisBadge jenis={laporan.jenis_bencana} />
              <StatusBadge status={laporan.status} />
            </div>
            <h1 className="text-xl font-bold">{laporan.judul}</h1>
          </div>
        </div>

        {/* Info */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Informasi Kejadian</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span>{laporan.lokasi}</span>
            </div>
            {laporan.lokasi_pengungsian && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <span>Pengungsian: {laporan.lokasi_pengungsian}</span>
              </div>
            )}
            {laporan.jumlah_terdampak && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{laporan.jumlah_terdampak.toLocaleString()} jiwa terdampak</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{laporan.nama_pelapor}{laporan.jabatan_pelapor ? ` — ${laporan.jabatan_pelapor}` : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{laporan.kontak_pelapor}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <p className="text-muted-foreground">{laporan.deskripsi}</p>
            </div>
          </CardContent>
        </Card>

        {/* Target Dana & Kronologi — hanya untuk laporan terverifikasi */}
        {laporan.status !== "menunggu" && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-green-600" /> Target Dana & Kronologi
                </CardTitle>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"
                  onClick={() => setShowDanaForm(v => !v)}>
                  {showDanaForm ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {showDanaForm ? "Tutup" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Tampilkan nilai aktif */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Target Dana</p>
                  <p className="font-bold text-green-700">
                    {laporan.target_dana ? `Rp ${laporan.target_dana.toLocaleString("id-ID")}` : "Belum diset"}
                  </p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Kronologi</p>
                  <p className="text-xs leading-relaxed line-clamp-2">
                    {laporan.kronologi || <span className="italic text-muted-foreground">Belum diisi</span>}
                  </p>
                </div>
              </div>
              {showDanaForm && (
                <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
                  <div>
                    <Label className="text-xs">Target Dana (Rp)</Label>
                    <Input
                      type="number"
                      className="mt-1 h-8 text-xs"
                      placeholder={laporan.target_dana?.toString() || "cth: 5000000"}
                      value={targetDana}
                      onChange={e => setTargetDana(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Donatur akan melihat progress bar pencapaian target ini.</p>
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Kronologi Kejadian</Label>
                    <Textarea
                      rows={4}
                      className="mt-1 text-xs"
                      placeholder="Tuliskan kronologi kejadian secara urut..."
                      value={kronologi}
                      onChange={e => setKronologi(e.target.value)}
                    />
                  </div>
                  <Button
                    size="sm"
                    disabled={updateLaporan.isPending || (!targetDana && !kronologi)}
                    onClick={() => {
                      const payload: any = {};
                      if (targetDana) payload.target_dana = parseInt(targetDana);
                      if (kronologi) payload.kronologi = kronologi;
                      updateLaporan.mutate({ id: laporanId, data: payload }, {
                        onSuccess: () => {
                          invalidateAll();
                          setTargetDana("");
                          setKronologi("");
                          setShowDanaForm(false);
                          toast({ title: "Berhasil disimpan" });
                        }
                      });
                    }}
                  >
                    {updateLaporan.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Verifikasi */}
        {laporan.status === "menunggu" && (
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
            <CardHeader className="pb-3"><CardTitle className="text-base text-yellow-800 dark:text-yellow-400">Aksi Verifikasi</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Catatan Admin (opsional)</Label>
                <Textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2} className="mt-1" placeholder="Catatan untuk pelapor..." />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleVerify("terverifikasi")} className="flex-1" disabled={updateLaporan.isPending}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Verifikasi
                </Button>
                <Button variant="outline" onClick={() => handleVerify("selesai")} disabled={updateLaporan.isPending}>
                  <XCircle className="h-4 w-4 mr-1" /> Selesai
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kebutuhan */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Kebutuhan Bantuan</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowKebutuhanForm(!showKebutuhanForm)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showKebutuhanForm && (
              <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Kategori</Label>
                    <Select value={newKebutuhan.kategori} onValueChange={v => setNewKebutuhan(f => ({ ...f, kategori: v }))}>
                      <SelectTrigger className="mt-1 h-8 text-xs">
                        <SelectValue placeholder="Pilih..." />
                      </SelectTrigger>
                      <SelectContent>
                        {KATEGORI_OPTIONS.map(k => <SelectItem key={k} value={k}>{KATEGORI_LABELS[k]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Nama Item</Label>
                    <Input className="mt-1 h-8 text-xs" value={newKebutuhan.nama_item} onChange={e => setNewKebutuhan(f => ({ ...f, nama_item: e.target.value }))} placeholder="cth: Beras" />
                  </div>
                  <div>
                    <Label className="text-xs">Jumlah Dibutuhkan</Label>
                    <Input type="number" className="mt-1 h-8 text-xs" value={newKebutuhan.jumlah_dibutuhkan} onChange={e => setNewKebutuhan(f => ({ ...f, jumlah_dibutuhkan: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Satuan</Label>
                    <Input className="mt-1 h-8 text-xs" value={newKebutuhan.satuan} onChange={e => setNewKebutuhan(f => ({ ...f, satuan: e.target.value }))} placeholder="kg, pcs, liter..." />
                  </div>
                </div>
                <Button size="sm" onClick={handleAddKebutuhan} disabled={createKebutuhan.isPending}>
                  {createKebutuhan.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            )}
            <KebutuhanProgress items={kebutuhan || []} />
            {kebutuhan && kebutuhan.length > 0 && (
              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Update Progress:</p>
                {kebutuhan.map(k => (
                  <div key={k.id} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-32 truncate">{k.nama_item}</span>
                    <Input type="number" className="h-7 w-24 text-xs" placeholder={String(k.jumlah_terpenuhi)}
                      value={updateProgress[k.id] || ""} onChange={e => setUpdateProgress(p => ({ ...p, [k.id]: e.target.value }))} />
                    <span className="text-xs text-muted-foreground">/ {k.jumlah_dibutuhkan} {k.satuan}</span>
                    <Button size="sm" className="h-7 px-2 text-xs" onClick={() => handleUpdateProgress(k.id)}>Simpan</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Penugasan */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4" /> Penugasan Relawan
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowPenugasanForm(!showPenugasanForm)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Tugaskan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showPenugasanForm && (
              <div className="border rounded-lg p-4 bg-muted/30 space-y-3 mb-4">
                <div>
                  <Label className="text-xs">Pilih Relawan</Label>
                  <Select value={newPenugasan.relawan_id} onValueChange={v => setNewPenugasan(f => ({ ...f, relawan_id: v }))}>
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue placeholder="Pilih relawan terverifikasi..." />
                    </SelectTrigger>
                    <SelectContent>
                      {relawanList?.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.nama}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Detail Tugas</Label>
                  <Textarea rows={2} className="mt-1 text-xs" value={newPenugasan.detail_tugas} onChange={e => setNewPenugasan(f => ({ ...f, detail_tugas: e.target.value }))} placeholder="Deskripsi tugas yang harus dilakukan..." />
                </div>
                <div>
                  <Label className="text-xs">Lokasi Tugas</Label>
                  <Input className="mt-1 h-8 text-xs" value={newPenugasan.lokasi_tugas} onChange={e => setNewPenugasan(f => ({ ...f, lokasi_tugas: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Link Grup Koordinasi (WhatsApp, Telegram, dll.)</Label>
                  <Input className="mt-1 h-8 text-xs" value={newPenugasan.link_grup} onChange={e => setNewPenugasan(f => ({ ...f, link_grup: e.target.value }))} placeholder="https://..." />
                </div>
                <Button size="sm" onClick={handleAddPenugasan} disabled={createPenugasan.isPending}>
                  {createPenugasan.isPending ? "Menyimpan..." : "Buat Penugasan"}
                </Button>
              </div>
            )}
            {laporan.penugasan && laporan.penugasan.length > 0 ? (
              <div className="space-y-2">
                {laporan.penugasan.map(p => (
                  <div key={p.id} className="border rounded-lg p-3 text-sm flex justify-between items-start">
                    <div>
                      <p className="font-medium">{p.detail_tugas}</p>
                      <p className="text-xs text-muted-foreground">{p.nama_relawan} — {p.lokasi_tugas}</p>
                      {p.link_grup && <a href={p.link_grup} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Link Grup</a>}
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada penugasan untuk laporan ini.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
