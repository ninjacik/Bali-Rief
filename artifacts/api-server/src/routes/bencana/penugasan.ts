import { Router } from "express";
import { db } from "@workspace/db";
import { penugasanTable, relawanTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/penugasan", async (req, res) => {
  const { status, relawan_id, laporan_id } = req.query as Record<string, string>;
  const rows = await db.select().from(penugasanTable).orderBy(penugasanTable.created_at);
  let filtered = rows.reverse();
  if (status) filtered = filtered.filter(r => r.status === status);
  if (relawan_id) filtered = filtered.filter(r => r.relawan_id === parseInt(relawan_id));
  if (laporan_id) filtered = filtered.filter(r => r.laporan_id === parseInt(laporan_id));
  return res.json(filtered);
});

router.post("/penugasan", async (req, res) => {
  const body = req.body;
  const [relawan] = await db.select({ nama: relawanTable.nama })
    .from(relawanTable)
    .where(eq(relawanTable.id, body.relawan_id));
  const [row] = await db.insert(penugasanTable).values({
    laporan_id: body.laporan_id,
    relawan_id: body.relawan_id,
    nama_relawan: relawan?.nama ?? "Relawan",
    detail_tugas: body.detail_tugas,
    lokasi_tugas: body.lokasi_tugas,
    link_grup: body.link_grup ?? null,
    qr_code_url: body.qr_code_url ?? null,
    catatan: body.catatan ?? null,
  }).returning();
  return res.status(201).json(row);
});

const handleUpdatePenugasan = async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });
  const body = req.body;
  const [updated] = await db.update(penugasanTable)
    .set({ status: body.status, catatan: body.catatan ?? undefined })
    .where(eq(penugasanTable.id, id))
    .returning();
  if (!updated) return res.status(404).json({ message: "Penugasan tidak ditemukan" });
  return res.json(updated);
};

router.put("/penugasan/:id", handleUpdatePenugasan);
router.patch("/penugasan/:id", handleUpdatePenugasan);

export default router;
