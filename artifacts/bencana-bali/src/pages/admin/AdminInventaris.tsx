import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetInventaris, useCreateInventaris, useCreateTransaksiInventaris,
  useGetTransaksiByInventaris,
  getGetInventarisQueryKey, getGetDashboardStatistikQueryKey
} from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { KategoriBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowUp, ArrowDown, Package } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const KATEGORI_OPTIONS = [
  { value: "pangan", label: "Pangan" },
  { value: "sandang", label: "Sandang" },
  { value: "medis", label: "Medis" },
  { value: "tempat_tinggal", label: "Tempat Tinggal" },
  { value: "air_bersih", label: "Air Bersih" },
  { value: "lainnya", label: "Lainnya" },
];

function TransaksiHistory({ id }: { id: number }) {
  const { data } = useGetTransaksiByInventaris(id);
  if (!data || data.length === 0) return <p className="text-xs text-muted-foreground">Belum ada transaksi.</p>;
  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {data.map(t => (
        <div key={t.id} className="flex items-center gap-2 text-xs">
          {t.jenis === "masuk" ? <ArrowUp className="h-3 w-3 text-green-500" /> : <ArrowDown className="h-3 w-3 text-red-500" />}
          <span className={t.jenis === "masuk" ? "text-green-700 dark:text-green-400 font-medium" : "text-red-700 dark:text-red-400 font-medium"}>
            {t.jenis === "masuk" ? "+" : "-"}{t.jumlah}
          </span>
          <span className="text-muted-foreground">{t.keterangan}</span>
          <span className="text-muted-foreground ml-auto">{new Date(t.created_at).toLocaleDateString("id-ID")}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminInventaris() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: inventaris, isLoading } = useGetInventaris();
  const createInventaris = useCreateInventaris();
  const createTransaksi = useCreateTransaksiInventaris();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({ nama_barang: "", kategori: "", satuan: "", stok_awal: "" });
  const [transaksi, setTransaksi] = useState({ jenis: "masuk", jumlah: "", keterangan: "" });

  const handleAddItem = () => {
    if (!newItem.nama_barang || !newItem.kategori || !newItem.satuan || !newItem.stok_awal) return;
    createInventaris.mutate({
      data: { ...newItem, stok_awal: parseInt(newItem.stok_awal) } as any
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetInventarisQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatistikQueryKey() });
        setNewItem({ nama_barang: "", kategori: "", satuan: "", stok_awal: "" });
        setShowAddForm(false);
        toast({ title: "Barang berhasil ditambahkan" });
      }
    });
  };

  const handleTransaksi = () => {
    if (!selectedItem || !transaksi.jumlah || !transaksi.keterangan) return;
    createTransaksi.mutate({
      id: selectedItem.id,
      data: { jenis: transaksi.jenis as any, jumlah: parseInt(transaksi.jumlah), keterangan: transaksi.keterangan }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetInventarisQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatistikQueryKey() });
        setTransaksi({ jenis: "masuk", jumlah: "", keterangan: "" });
        setSelectedItem(null);
        toast({ title: "Transaksi berhasil dicatat" });
      }
    });
  };

  return (
    <AppLayout
      title="Inventaris"
      backHref="/admin"
      backLabel="Dashboard"
      role="admin"
      actions={
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-1" /> Tambah Barang
        </Button>
      }
    >
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Inventaris</h1>
          <p className="text-sm text-muted-foreground">Catat dan pantau stok barang donasi</p>
        </div>

        {showAddForm && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3"><CardTitle className="text-base">Tambah Barang Baru</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Nama Barang</Label>
                  <Input className="mt-1 h-8 text-xs" value={newItem.nama_barang} onChange={e => setNewItem(f => ({ ...f, nama_barang: e.target.value }))} placeholder="cth: Beras 5kg" />
                </div>
                <div>
                  <Label className="text-xs">Kategori</Label>
                  <Select value={newItem.kategori} onValueChange={v => setNewItem(f => ({ ...f, kategori: v }))}>
                    <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Pilih..." /></SelectTrigger>
                    <SelectContent>{KATEGORI_OPTIONS.map(k => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Satuan</Label>
                  <Input className="mt-1 h-8 text-xs" value={newItem.satuan} onChange={e => setNewItem(f => ({ ...f, satuan: e.target.value }))} placeholder="kg, pcs, liter..." />
                </div>
                <div>
                  <Label className="text-xs">Stok Awal</Label>
                  <Input type="number" className="mt-1 h-8 text-xs" value={newItem.stok_awal} onChange={e => setNewItem(f => ({ ...f, stok_awal: e.target.value }))} />
                </div>
              </div>
              <Button size="sm" onClick={handleAddItem} disabled={createInventaris.isPending}>
                {createInventaris.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
        ) : inventaris && inventaris.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Masuk</TableHead>
                    <TableHead className="text-right">Keluar</TableHead>
                    <TableHead className="text-right">Sisa</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventaris.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{item.nama_barang}</p>
                        <p className="text-xs text-muted-foreground">{item.satuan}</p>
                      </TableCell>
                      <TableCell><KategoriBadge kategori={item.kategori} /></TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-mono text-green-600 dark:text-green-400">+{item.stok_masuk}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-mono text-red-600 dark:text-red-400">-{item.stok_keluar}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={`text-sm font-mono font-bold ${item.stok_sisa <= 5 ? "border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400" : "border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400"}`}>
                          {item.stok_sisa}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setSelectedItem(item)}>
                          <Package className="h-3 w-3 mr-1" /> Transaksi
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Belum ada barang di inventaris. Tambah barang pertama.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={open => { if (!open) setSelectedItem(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaksi: {selectedItem?.nama_barang}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Jenis Transaksi</Label>
                <Select value={transaksi.jenis} onValueChange={v => setTransaksi(f => ({ ...f, jenis: v }))}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Barang Masuk (+)</SelectItem>
                    <SelectItem value="keluar">Barang Keluar (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Jumlah ({selectedItem?.satuan})</Label>
                <Input type="number" className="mt-1 h-8 text-xs" value={transaksi.jumlah} onChange={e => setTransaksi(f => ({ ...f, jumlah: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Keterangan</Label>
              <Textarea rows={2} className="mt-1 text-xs" value={transaksi.keterangan} onChange={e => setTransaksi(f => ({ ...f, keterangan: e.target.value }))} placeholder="Sumber/tujuan barang..." />
            </div>
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Riwayat Transaksi</p>
              {selectedItem && <TransaksiHistory id={selectedItem.id} />}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedItem(null)}>Tutup</Button>
            <Button onClick={handleTransaksi} disabled={createTransaksi.isPending}>
              {createTransaksi.isPending ? "Menyimpan..." : "Catat Transaksi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
