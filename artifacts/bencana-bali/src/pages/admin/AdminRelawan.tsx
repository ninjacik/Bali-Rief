import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetRelawan, useVerifikasiRelawan, getGetRelawanQueryKey, getGetDashboardStatistikQueryKey } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Filter, ExternalLink } from "lucide-react";

export default function AdminRelawan() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [action, setAction] = useState<"terverifikasi" | "ditolak" | null>(null);
  const [catatan, setCatatan] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params = statusFilter !== "all" ? { status_verifikasi: statusFilter as any } : undefined;
  const { data: relawan, isLoading } = useGetRelawan(params);
  const verifikasi = useVerifikasiRelawan();

  const handleVerify = () => {
    if (!selected || !action) return;
    verifikasi.mutate({ id: selected.id, data: { status_verifikasi: action, catatan_verifikasi: catatan || null } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRelawanQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatistikQueryKey() });
        toast({ title: action === "terverifikasi" ? "Relawan terverifikasi" : "Relawan ditolak" });
        setSelected(null); setAction(null); setCatatan("");
      }
    });
  };

  return (
    <AppLayout title="Kelola Relawan" backHref="/admin" backLabel="Dashboard" role="admin">
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Relawan</h1>
            <p className="text-sm text-muted-foreground">Verifikasi KTP dan kelola relawan</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="menunggu">Menunggu Verifikasi</SelectItem>
                <SelectItem value="terverifikasi">Terverifikasi</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
        ) : relawan && relawan.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Keahlian</TableHead>
                    <TableHead>KTP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relawan.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{r.nama}</p>
                        <p className="text-xs text-muted-foreground">{r.alamat}</p>
                      </TableCell>
                      <TableCell><span className="text-xs font-mono">{r.nik}</span></TableCell>
                      <TableCell>
                        <p className="text-xs">{r.no_hp}</p>
                        {r.email && <p className="text-xs text-muted-foreground">{r.email}</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(r.keahlian || []).slice(0, 2).map(k => (
                            <Badge key={k} variant="secondary" className="text-xs px-1.5">{k}</Badge>
                          ))}
                          {(r.keahlian || []).length > 2 && (
                            <Badge variant="outline" className="text-xs px-1.5">+{(r.keahlian || []).length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.foto_ktp_url ? (
                          <a href={r.foto_ktp_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary flex items-center gap-1 hover:underline">
                            <ExternalLink className="h-3 w-3" /> Lihat KTP
                          </a>
                        ) : <span className="text-xs text-muted-foreground">Tidak ada</span>}
                      </TableCell>
                      <TableCell><StatusBadge status={r.status_verifikasi} /></TableCell>
                      <TableCell>
                        {r.status_verifikasi === "menunggu" && (
                          <div className="flex gap-1">
                            <Button size="sm" className="h-7 px-2 text-xs" onClick={() => { setSelected(r); setAction("terverifikasi"); }}>
                              <CheckCircle2 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-destructive" onClick={() => { setSelected(r); setAction("ditolak"); }}>
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
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
              Tidak ada relawan ditemukan.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={open => { if (!open) { setSelected(null); setAction(null); setCatatan(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "terverifikasi" ? "Verifikasi Relawan" : "Tolak Relawan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm">Relawan: <strong>{selected?.nama}</strong></p>
            <div>
              <Label>Catatan (opsional)</Label>
              <Textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={3} className="mt-1" placeholder="Alasan verifikasi/penolakan..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelected(null); setAction(null); setCatatan(""); }}>Batal</Button>
            <Button onClick={handleVerify} disabled={verifikasi.isPending}
              className={action === "ditolak" ? "bg-destructive hover:bg-destructive/90" : ""}>
              {verifikasi.isPending ? "Menyimpan..." : action === "terverifikasi" ? "Verifikasi" : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
