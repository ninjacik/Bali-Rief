import { useState } from "react";
import { Link } from "wouter";
import { useGetLaporan } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, JenisBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Users, Calendar, ArrowRight, Filter } from "lucide-react";

export default function AdminLaporan() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const params = statusFilter !== "all" ? { status: statusFilter as any } : undefined;
  const { data: laporan, isLoading } = useGetLaporan(params);

  return (
    <AppLayout title="Kelola Laporan" backHref="/admin" backLabel="Dashboard" role="admin">
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Laporan</h1>
            <p className="text-sm text-muted-foreground">Verifikasi dan kelola laporan bencana</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="menunggu">Menunggu</SelectItem>
                <SelectItem value="terverifikasi">Terverifikasi</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : laporan && laporan.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Laporan</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Terdampak</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {laporan.map(l => (
                    <TableRow key={l.id} className="hover:bg-muted/40 cursor-pointer">
                      <TableCell>
                        <p className="font-medium text-sm">{l.judul}</p>
                        <p className="text-xs text-muted-foreground">{l.nama_pelapor}</p>
                      </TableCell>
                      <TableCell><JenisBadge jenis={l.jenis_bencana} /></TableCell>
                      <TableCell>
                        <p className="text-xs flex items-center gap-1"><MapPin className="h-3 w-3" />{l.lokasi}</p>
                      </TableCell>
                      <TableCell>
                        {l.jumlah_terdampak ? (
                          <span className="text-xs flex items-center gap-1"><Users className="h-3 w-3" />{l.jumlah_terdampak.toLocaleString()}</span>
                        ) : <span className="text-xs text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell><StatusBadge status={l.status} /></TableCell>
                      <TableCell>
                        <span className="text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(l.created_at).toLocaleDateString("id-ID")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/laporan/${l.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
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
              Tidak ada laporan ditemukan.
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
