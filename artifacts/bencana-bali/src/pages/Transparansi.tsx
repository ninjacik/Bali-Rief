import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, MapPin, Users, Camera, FileText,
  ChevronDown, ChevronUp, Heart, Package, Home, Box, Banknote, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE = import.meta.env.VITE_API_URL.replace(/\/$/, "");

async function fetchTransparansi() {
  const res = await fetch(`${BASE}/api/transparansi/laporan`);
  return res.json();
}

const STATUS_COLORS: Record<string, string> = {
  menunggu: "bg-yellow-100 text-yellow-800",
  terverifikasi: "bg-blue-100 text-blue-800",
  selesai: "bg-green-100 text-green-800",
};
const STATUS_LABELS: Record<string, string> = {
  menunggu: "Menunggu", terverifikasi: "Aktif", selesai: "Selesai",
};
const JENIS_LABELS: Record<string, string> = {
  banjir: "Banjir", tanah_longsor: "Tanah Longsor", kebakaran: "Kebakaran",
  gempa_bumi: "Gempa Bumi", angin_kencang: "Angin Kencang", lainnya: "Lainnya",
};

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function exportSemuaLaporanPDF(laporan: any[]) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Transparansi - Bali Tanggap Bencana", 14, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 14, 22);

  const totalDampak = laporan.reduce((s, l) => s + (l.jumlah_terdampak || 0), 0);
  const totalDonasi = laporan.reduce((s, l) => s + (l.donasi?.length || 0), 0);
  const totalDana = laporan.reduce((s, l) =>
    s + (l.donasi || []).filter((d: any) => d.jenis === "dana").reduce((x: number, d: any) => x + (d.jumlah_dana || 0), 0), 0);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan", 14, 32);

  autoTable(doc, {
    startY: 36,
    head: [["Total Kejadian", "Jiwa Terdampak", "Total Donasi", "Total Dana"]],
    body: [[
      laporan.length.toString(),
      totalDampak.toLocaleString("id-ID"),
      totalDonasi.toString(),
      "Rp " + totalDana.toLocaleString("id-ID"),
    ]],
    theme: "grid",
    headStyles: { fillColor: [220, 38, 38] },
  });

  const tableData = laporan.map(l => [
    l.judul,
    JENIS_LABELS[l.jenis_bencana] || l.jenis_bencana,
    l.lokasi,
    STATUS_LABELS[l.status] || l.status,
    (l.jumlah_terdampak || 0).toLocaleString("id-ID"),
    (l.donasi?.length || 0).toString(),
    new Date(l.created_at).toLocaleDateString("id-ID"),
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["Judul", "Jenis", "Lokasi", "Status", "Terdampak", "Donasi", "Tanggal"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [220, 38, 38] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 45 },
      2: { cellWidth: 35 },
    },
  });

  doc.save(`transparansi-bali-tanggap-bencana-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function exportSatuLaporanPDF(laporan: any) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Bali Tanggap Bencana", 14, 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 14, 22);

  // Judul laporan
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(laporan.judul, 14, 32);

  // Info dasar
  autoTable(doc, {
    startY: 38,
    head: [["Field", "Detail"]],
    body: [
      ["Jenis Bencana", JENIS_LABELS[laporan.jenis_bencana] || laporan.jenis_bencana],
      ["Lokasi", laporan.lokasi],
      ["Status", STATUS_LABELS[laporan.status] || laporan.status],
      ["Jumlah Terdampak", (laporan.jumlah_terdampak || 0).toLocaleString("id-ID") + " jiwa"],
      ["Lokasi Pengungsian", laporan.lokasi_pengungsian || "-"],
      ["Nama Pelapor", laporan.nama_pelapor],
      ["Jabatan Pelapor", laporan.jabatan_pelapor || "-"],
      ["Kontak Pelapor", laporan.kontak_pelapor],
      ["Tanggal Laporan", new Date(laporan.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })],
    ],
    theme: "grid",
    headStyles: { fillColor: [220, 38, 38] },
    styles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 50, fontStyle: "bold" } },
  });

  // Deskripsi
  const afterInfo = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Deskripsi", 14, afterInfo);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const deskripsiLines = doc.splitTextToSize(laporan.deskripsi || "-", 180);
  doc.text(deskripsiLines, 14, afterInfo + 6);

  // Kebutuhan
  if (laporan.kebutuhan?.length > 0) {
    const afterDeskripsi = afterInfo + 6 + deskripsiLines.length * 5 + 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Daftar Kebutuhan", 14, afterDeskripsi);

    autoTable(doc, {
      startY: afterDeskripsi + 4,
      head: [["Item", "Dibutuhkan", "Terpenuhi", "Satuan", "Status"]],
      body: laporan.kebutuhan.map((k: any) => {
        const sisa = Math.max(0, k.jumlah_dibutuhkan - k.jumlah_terpenuhi);
        return [
          k.nama_item,
          k.jumlah_dibutuhkan,
          k.jumlah_terpenuhi,
          k.satuan,
          sisa === 0 ? "Terpenuhi" : `Sisa ${sisa}`,
        ];
      }),
      theme: "striped",
      headStyles: { fillColor: [220, 38, 38] },
      styles: { fontSize: 8 },
    });
  }

  // Donasi
  const donasiDana = (laporan.donasi || []).filter((d: any) => d.jenis === "dana");
  const donasiBarang = (laporan.donasi || []).filter((d: any) => d.jenis === "barang");
  const totalDana = donasiDana.reduce((s: number, d: any) => s + (d.jumlah_dana || 0), 0);

  if (laporan.donasi?.length > 0) {
    const afterKebutuhan = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Donasi (${laporan.donasi.length} total — Dana: ${formatRupiah(totalDana)})`, 14, afterKebutuhan);

    autoTable(doc, {
      startY: afterKebutuhan + 4,
      head: [["Donatur", "Jenis", "Jumlah", "Tanggal"]],
      body: laporan.donasi.map((d: any) => [
        d.nama_donatur,
        d.jenis === "dana" ? "Dana" : "Barang",
        d.jenis === "dana" ? formatRupiah(d.jumlah_dana) : `${d.jumlah_barang} × ${d.nama_barang}`,
        new Date(d.created_at).toLocaleDateString("id-ID"),
      ]),
      theme: "striped",
      headStyles: { fillColor: [220, 38, 38] },
      styles: { fontSize: 8 },
    });
  }

  // Relawan
  if (laporan.relawan_bertugas?.length > 0) {
    const afterDonasi = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Relawan Bertugas", 14, afterDonasi);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(laporan.relawan_bertugas.join(", "), 14, afterDonasi + 6);
  }

  doc.save(`laporan-${laporan.id}-${laporan.judul.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

function LaporanCard({ laporan }: { laporan: any }) {
  const [expandKebutuhan, setExpandKebutuhan] = useState(false);
  const [expandDonasi, setExpandDonasi] = useState(false);

  const donasiDana = (laporan.donasi || []).filter((d: any) => d.jenis === "dana");
  const donasiBarang = (laporan.donasi || []).filter((d: any) => d.jenis === "barang");
  const totalDana = donasiDana.reduce((s: number, d: any) => s + (d.jumlah_dana || 0), 0);

  return (
    <Card className="overflow-hidden border hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className="text-xs">{JENIS_LABELS[laporan.jenis_bencana] || laporan.jenis_bencana}</Badge>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", STATUS_COLORS[laporan.status])}>
                {STATUS_LABELS[laporan.status]}
              </span>
            </div>
            <CardTitle className="text-lg leading-snug">{laporan.judul}</CardTitle>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5" />{laporan.lokasi}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportSatuLaporanPDF(laporan)}
            className="shrink-0 flex items-center gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{laporan.deskripsi}</p>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <Users className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">{laporan.jumlah_terdampak?.toLocaleString() || "-"}</p>
            <p className="text-xs text-muted-foreground">Jiwa Terdampak</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <Package className="h-4 w-4 text-secondary mx-auto mb-1" />
            <p className="text-xl font-bold">{laporan.kebutuhan?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Item Kebutuhan</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <Heart className="h-4 w-4 text-rose-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{laporan.donasi?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Donasi Masuk</p>
          </div>
        </div>

        {(donasiDana.length > 0 || donasiBarang.length > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {donasiDana.length > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Banknote className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">Total Dana</span>
                </div>
                <p className="font-bold text-green-800">{formatRupiah(totalDana)}</p>
                <p className="text-xs text-green-600">{donasiDana.length} donatur</p>
              </div>
            )}
            {donasiBarang.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Box className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">Donasi Barang</span>
                </div>
                <p className="font-bold text-amber-800">{donasiBarang.length} donasi</p>
                <p className="text-xs text-amber-600">dari {new Set(donasiBarang.map((d: any) => d.nama_donatur)).size} donatur</p>
              </div>
            )}
          </div>
        )}

        {laporan.foto_penyerahan?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5" /> Dokumentasi Penyerahan Bantuan
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {laporan.foto_penyerahan.map((f: any, i: number) => (
                <div key={i} className="group relative rounded-lg overflow-hidden">
                  <img src={f.url} alt={f.keterangan}
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-xs leading-tight">{f.keterangan}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {laporan.relawan_bertugas?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Relawan Bertugas</p>
            <div className="flex flex-wrap gap-2">
              {laporan.relawan_bertugas.map((nama: string, i: number) => (
                <span key={i} className="text-xs bg-secondary/10 text-secondary rounded-full px-2.5 py-1 font-medium">{nama}</span>
              ))}
            </div>
          </div>
        )}

        {laporan.kebutuhan?.length > 0 && (
          <div>
            <button onClick={() => setExpandKebutuhan(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              <FileText className="h-3.5 w-3.5" />
              {expandKebutuhan ? "Sembunyikan" : "Lihat"} detail kebutuhan ({laporan.kebutuhan.length} item)
              {expandKebutuhan ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {expandKebutuhan && (
              <div className="mt-2 space-y-2">
                {laporan.kebutuhan.map((k: any) => {
                  const pct = Math.min(100, Math.round((k.jumlah_terpenuhi / k.jumlah_dibutuhkan) * 100));
                  const sisa = Math.max(0, k.jumlah_dibutuhkan - k.jumlah_terpenuhi);
                  return (
                    <div key={k.id} className="bg-muted/40 rounded-lg px-3 py-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{k.nama_item}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                          sisa === 0 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
                          {sisa === 0 ? "✓ Terpenuhi" : `Sisa ${sisa} ${k.satuan}`}
                        </span>
                      </div>
                      <Progress value={pct} className={cn("h-1.5 mb-1", sisa === 0 ? "[&>div]:bg-green-500" : "")} />
                      <p className="text-xs text-muted-foreground">
                        {k.jumlah_terpenuhi} / {k.jumlah_dibutuhkan} {k.satuan} ({pct}%)
                        {k.keterangan && ` — ${k.keterangan}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {laporan.donasi?.length > 0 && (
          <div>
            <button onClick={() => setExpandDonasi(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:underline">
              <Heart className="h-3.5 w-3.5" />
              {expandDonasi ? "Sembunyikan" : "Lihat"} semua donasi ({laporan.donasi.length})
              {expandDonasi ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {expandDonasi && (
              <div className="mt-2 space-y-1.5">
                {laporan.donasi.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      {d.jenis === "dana"
                        ? <Banknote className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        : <Box className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      }
                      <span className="font-medium">{d.nama_donatur}</span>
                      {d.pesan && <span className="text-muted-foreground text-xs hidden sm:inline truncate max-w-[120px]">"{d.pesan}"</span>}
                    </div>
                    <div className="text-right shrink-0">
                      {d.jenis === "dana"
                        ? <span className="font-bold text-green-700">{formatRupiah(d.jumlah_dana)}</span>
                        : <span className="text-amber-700 font-medium">{d.jumlah_barang} × {d.nama_barang}</span>
                      }
                      <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString("id-ID")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Dilaporkan oleh: <strong>{laporan.nama_pelapor}</strong>
          {laporan.jabatan_pelapor && ` (${laporan.jabatan_pelapor})`}
          {" · "}
          {new Date(laporan.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Transparansi() {
  const { data: laporan = [], isLoading } = useQuery({
    queryKey: ["transparansi-laporan"],
    queryFn: fetchTransparansi,
  });

  const totalDampak = laporan.reduce((s: number, l: any) => s + (l.jumlah_terdampak || 0), 0);
  const totalDonasi = laporan.reduce((s: number, l: any) => s + (l.donasi?.length || 0), 0);
  const totalDana = laporan.reduce((s: number, l: any) =>
    s + (l.donasi || []).filter((d: any) => d.jenis === "dana").reduce((x: number, d: any) => x + (d.jumlah_dana || 0), 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon"><Home className="h-4 w-4" /></Button>
            </Link>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">Transparansi</span>
              <span className="text-muted-foreground text-sm hidden sm:block">— Bali Tanggap Bencana</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportSemuaLaporanPDF(laporan)}
              disabled={isLoading || laporan.length === 0}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export Semua
            </Button>
            <Badge variant="outline" className="text-xs">Akses Publik</Badge>
          </div>
        </div>
      </header>

      <div className="bg-primary text-primary-foreground py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Badge variant="outline" className="mb-4 border-primary-foreground/30 text-primary-foreground text-xs font-semibold uppercase tracking-wider">
            Laporan Transparansi
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Dokumentasi & Laporan Lengkap</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Semua aktivitas penanganan bencana, penyaluran bantuan, dan keterlibatan relawan dapat diakses publik di sini.
          </p>
          <div className="grid grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-2xl font-bold">{laporan.length}</p>
              <p className="text-xs text-primary-foreground/70 mt-1">Total Kejadian</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-2xl font-bold">{totalDampak.toLocaleString()}</p>
              <p className="text-xs text-primary-foreground/70 mt-1">Jiwa Terdampak</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-2xl font-bold">{totalDonasi}</p>
              <p className="text-xs text-primary-foreground/70 mt-1">Donasi Masuk</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-lg font-bold">{totalDana >= 1000000 ? (totalDana / 1000000).toFixed(1) + "Jt" : (totalDana / 1000).toFixed(0) + "Rb"}</p>
              <p className="text-xs text-primary-foreground/70 mt-1">Total Dana</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Memuat data...</div>
        ) : laporan.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Belum ada laporan bencana tercatat.</div>
        ) : (
          laporan.map((l: any) => <LaporanCard key={l.id} laporan={l} />)
        )}
      </div>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>Bali Tanggap Bencana — Laporan ini diperbarui secara real-time.</p>
        <Link href="/" className="text-primary hover:underline mt-1 block">← Kembali ke Beranda</Link>
      </footer>
    </div>
  );
}