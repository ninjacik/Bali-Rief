import { Router } from "express";
import { db } from "@workspace/db";
import { laporanTable, kebutuhanTable, penugasanTable } from "@workspace/db/schema";
import { eq, ne, count, sql } from "drizzle-orm";

const router = Router();

router.get("/laporan", async (req, res) => {
  const { status } = req.query as Record<string, string>;
  const rows = await db.select().from(laporanTable).orderBy(laporanTable.created_at);
  const filtered = status ? rows.filter(r => r.status === status) : rows;
  res.json(filtered.reverse());
});

router.post("/laporan", async (req, res) => {
  const body = req.body;
  const [row] = await db.insert(laporanTable).values({
    judul: body.judul,
    jenis_bencana: body.jenis_bencana,
    lokasi: body.lokasi,
    koordinat_lat: body.koordinat_lat ?? null,
    koordinat_lng: body.koordinat_lng ?? null,
    deskripsi: body.deskripsi,
    nama_pelapor: body.nama_pelapor,
    kontak_pelapor: body.kontak_pelapor,
    jabatan_pelapor: body.jabatan_pelapor ?? null,
    jumlah_terdampak: body.jumlah_terdampak ?? null,
    lokasi_pengungsian: body.lokasi_pengungsian ?? null,
    foto_urls: body.foto_urls ?? [],
  }).returning();
  return res.status(201).json(row);
});

router.get("/laporan/aktif", async (req, res) => {
  const rows = await db
    .select({
      id: laporanTable.id,
      judul: laporanTable.judul,
      jenis_bencana: laporanTable.jenis_bencana,
      lokasi: laporanTable.lokasi,
      status: laporanTable.status,
      jumlah_terdampak: laporanTable.jumlah_terdampak,
      created_at: laporanTable.created_at,
    })
    .from(laporanTable)
    .where(ne(laporanTable.status, "selesai"))
    .orderBy(laporanTable.created_at);

  if (rows.length === 0) return res.json([]);

  const kebutuhanCounts = await db
    .select({
      laporan_id: kebutuhanTable.laporan_id,
      cnt: count(),
    })
    .from(kebutuhanTable)
    .groupBy(kebutuhanTable.laporan_id);

  const countMap: Record<number, number> = {};
  for (const k of kebutuhanCounts) countMap[k.laporan_id] = k.cnt;

  const result = rows.reverse().map(r => ({
    ...r,
    jumlah_kebutuhan_pending: countMap[r.id] || 0,
  }));

  return res.json(result);
});

router.get("/laporan/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });

  const [laporan] = await db.select().from(laporanTable).where(eq(laporanTable.id, id));
  if (!laporan) return res.status(404).json({ message: "Laporan tidak ditemukan" });

  const penugasan = await db.select().from(penugasanTable).where(eq(penugasanTable.laporan_id, id));

  return res.json({ ...laporan, penugasan });
});

const handleUpdateLaporan = async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });

  const body = req.body;
  const [updated] = await db.update(laporanTable)
    .set({ ...body, updated_at: new Date() })
    .where(eq(laporanTable.id, id))
    .returning();

  if (!updated) return res.status(404).json({ message: "Laporan tidak ditemukan" });
  return res.json(updated);
};

router.put("/laporan/:id", handleUpdateLaporan);
router.patch("/laporan/:id", handleUpdateLaporan);

// Tambah banyak kebutuhan sekaligus (dipakai form pelapor)
router.post("/laporan/:id/kebutuhan-bulk", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });
  const items = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.json([]);
  const rows = await db.insert(kebutuhanTable).values(
    items.map((k: any) => ({
      laporan_id: id,
      kategori: k.kategori,
      nama_item: k.nama_item,
      jumlah_dibutuhkan: k.jumlah_dibutuhkan,
      satuan: k.satuan,
      keterangan: k.keterangan ?? null,
    }))
  ).returning();
  return res.status(201).json(rows);
});

export default router;
