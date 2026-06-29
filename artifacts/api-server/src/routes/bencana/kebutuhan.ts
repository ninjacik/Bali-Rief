import { Router } from "express";
import { db } from "@workspace/db";
import { kebutuhanTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/laporan/:id/kebutuhan", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });
  const rows = await db.select().from(kebutuhanTable).where(eq(kebutuhanTable.laporan_id, id));
  return res.json(rows);
});

router.post("/laporan/:id/kebutuhan", async (req, res) => {
  const laporan_id = parseInt(req.params.id);
  if (isNaN(laporan_id)) return res.status(400).json({ message: "ID tidak valid" });
  const body = req.body;
  const [row] = await db.insert(kebutuhanTable).values({
    laporan_id,
    kategori: body.kategori,
    nama_item: body.nama_item,
    jumlah_dibutuhkan: body.jumlah_dibutuhkan,
    jumlah_terpenuhi: body.jumlah_terpenuhi ?? 0,
    satuan: body.satuan,
    keterangan: body.keterangan ?? null,
  }).returning();
  return res.status(201).json(row);
});

const handleUpdateKebutuhan = async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });
  const body = req.body;
  const [updated] = await db.update(kebutuhanTable)
    .set({ jumlah_terpenuhi: body.jumlah_terpenuhi })
    .where(eq(kebutuhanTable.id, id))
    .returning();
  if (!updated) return res.status(404).json({ message: "Kebutuhan tidak ditemukan" });
  return res.json(updated);
};

router.put("/kebutuhan/:id", handleUpdateKebutuhan);
router.patch("/kebutuhan/:id", handleUpdateKebutuhan);

export default router;
