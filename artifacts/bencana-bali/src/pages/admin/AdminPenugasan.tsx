import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetPenugasan, useUpdatePenugasan, getGetPenugasanQueryKey, getGetDashboardStatistikQueryKey } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MapPin, ExternalLink, CheckCircle2, XCircle, Filter } from "lucide-react";

export default function AdminPenugasan() {
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params = statusFilter !== "all" ? { status: statusFilter as any } : undefined;
  const { data: penugasan, isLoading } = useGetPenugasan(params);
  const updatePenugasan = useUpdatePenugasan();

  const handleUpdate = (id: number, status: "selesai" | "dibatalkan") => {
    updatePenugasan.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPenugasanQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatistikQueryKey() });
        toast({ title: `Penugasan diperbarui: ${status}` });
      }
    });
  };

  return (
    <AppLayout title="Kelola Penugasan" backHref="/admin" backLabel="Dashboard" role="admin">
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Penugasan</h1>
            <p className="text-sm text-muted-foreground">Pantau dan kelola penugasan relawan</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
                <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
        ) : penugasan && penugasan.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Relawan</TableHead>
                    <TableHead>Tugas</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Grup</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {penugasan.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{p.nama_relawan}</p>
                        <p className="text-xs text-muted-foreground">Laporan #{p.laporan_id}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs">{p.detail_tugas}</p>
                        {p.catatan && <p className="text-xs text-muted-foreground mt-0.5">{p.catatan}</p>}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {p.lokasi_tugas}
                        </span>
                      </TableCell>
                      <TableCell>
                        {p.link_grup ? (
                          <a href={p.link_grup} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary flex items-center gap-1 hover:underline">
                            <ExternalLink className="h-3 w-3" /> Buka Grup
                          </a>
                        ) : <span className="text-xs text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString("id-ID")}
                        </span>
                      </TableCell>
                      <TableCell>
                        {p.status === "aktif" && (
                          <div className="flex gap-1">
                            <Button size="sm" className="h-7 px-2 text-xs" onClick={() => handleUpdate(p.id, "selesai")} disabled={updatePenugasan.isPending}>
                              <CheckCircle2 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-destructive" onClick={() => handleUpdate(p.id, "dibatalkan")} disabled={updatePenugasan.isPending}>
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
              Tidak ada penugasan ditemukan.
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
