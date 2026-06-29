import { useParams } from "wouter";
import { useGetRelawanById, useGetPenugasan, getGetRelawanByIdQueryKey, getGetPenugasanQueryKey } from "@workspace/api-client-react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Phone, Mail, MapPin, CreditCard, ExternalLink } from "lucide-react";

export default function RelawanDetail() {
  const { id } = useParams<{ id: string }>();
  const relawanId = parseInt(id);

  const { data: relawan, isLoading } = useGetRelawanById(relawanId, { query: { enabled: !!relawanId, queryKey: getGetRelawanByIdQueryKey(relawanId) } });
  const { data: penugasan } = useGetPenugasan({ relawan_id: relawanId }, { query: { enabled: !!relawanId, queryKey: getGetPenugasanQueryKey({ relawan_id: relawanId }) } });

  if (isLoading) return (
    <AppLayout title="Profil Relawan" backHref="/relawan" role="relawan">
      <div className="space-y-4"><Skeleton className="h-40 w-full" /></div>
    </AppLayout>
  );

  if (!relawan) return (
    <AppLayout title="Profil Relawan" backHref="/relawan" role="relawan">
      <p className="text-muted-foreground">Relawan tidak ditemukan.</p>
    </AppLayout>
  );

  return (
    <AppLayout title="Profil Relawan" backHref="/relawan" backLabel="Dashboard" role="relawan">
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{relawan.nama}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Terdaftar: {new Date(relawan.created_at).toLocaleDateString("id-ID")}
            </p>
          </div>
          <StatusBadge status={relawan.status_verifikasi} />
        </div>

        {relawan.status_verifikasi === "menunggu" && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-400">
            Pendaftaran Anda sedang dalam proses verifikasi oleh admin. Harap menunggu konfirmasi.
          </div>
        )}

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Data Pribadi</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span>{relawan.nama}</span></div>
            <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" /><span>NIK: {relawan.nik}</span></div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{relawan.no_hp}</span></div>
            {relawan.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{relawan.email}</span></div>}
            <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5" /><span>{relawan.alamat}</span></div>
          </CardContent>
        </Card>

        {relawan.keahlian && relawan.keahlian.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Keahlian</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {relawan.keahlian.map(k => (
                  <Badge key={k} variant="secondary">{k}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {relawan.catatan_verifikasi && (
          <Card>
            <CardContent className="p-4 text-sm">
              <p className="font-medium mb-1">Catatan Verifikasi:</p>
              <p className="text-muted-foreground">{relawan.catatan_verifikasi}</p>
            </CardContent>
          </Card>
        )}

        {penugasan && penugasan.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Penugasan</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {penugasan.map(p => (
                <div key={p.id} className="border rounded-lg p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <p className="font-medium">{p.detail_tugas}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{p.lokasi_tugas}</p>
                  {p.link_grup && (
                    <a href={p.link_grup} target="_blank" rel="noopener noreferrer"
                      className="text-primary text-xs flex items-center gap-1 mt-1 hover:underline">
                      <ExternalLink className="h-3 w-3" /> Bergabung ke Grup
                    </a>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
