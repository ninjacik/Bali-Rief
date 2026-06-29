import { Router } from "express";
import { db } from "@workspace/db";
import { inventarisTable, transaksiInventarisTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/inventaris", async (req, res) => {
  const rows = await db.select().from(inventarisTable).orderBy(inventarisTable.nama_barang);
  return res.json(rows);
});

router.post("/inventaris", async (req, res) => {
  const body = req.body;
  const stokAwal = body.stok_awal ?? 0;
  const [row] = await db.insert(inventarisTable).values({
    nama_barang: body.nama_barang,
    kategori: body.kategori,
    satuan: body.satuan,
    keterangan: body.keterangan ?? null,
    stok_masuk: stokAwal,
    stok_keluar: 0,
    stok_sisa: stokAwal,
  }).returning();
  if (stokAwal > 0) {
    await db.insert(transaksiInventarisTable).values({
      inventaris_id: row.id,
      jenis: "masuk",
      jumlah: stokAwal,
      keterangan: "Stok awal",
    });
  }
  return res.status(201).json(row);
});

const handleUpdateInventaris = async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });
  const body = req.body;
  const [updated] = await db.update(inventarisTable)
    .set({ ...body, updated_at: new Date() })
    .where(eq(inventarisTable.id, id))
    .returning();
  if (!updated) return res.status(404).json({ message: "Inventaris tidak ditemukan" });
  return res.json(updated);
};

router.put("/inventaris/:id", handleUpdateInventaris);
router.patch("/inventaris/:id", handleUpdateInventaris);

router.post("/inventaris/:id/transaksi", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });
  const body = req.body;
  const [inventaris] = await db.select().from(inventarisTable).where(eq(inventarisTable.id, id));
  if (!inventaris) return res.status(404).json({ message: "Inventaris tidak ditemukan" });
  const [transaksi] = await db.insert(transaksiInventarisTable).values({
    inventaris_id: id,
    jenis: body.jenis,
    jumlah: body.jumlah,
    keterangan: body.keterangan,
    laporan_id: body.laporan_id ?? null,
  }).returning();
  const newMasuk = body.jenis === "masuk" ? inventaris.stok_masuk + body.jumlah : inventaris.stok_masuk;
  const newKeluar = body.jenis === "keluar" ? inventaris.stok_keluar + body.jumlah : inventaris.stok_keluar;
  await db.update(inventarisTable)
    .set({ stok_masuk: newMasuk, stok_keluar: newKeluar, stok_sisa: newMasuk - newKeluar, updated_at: new Date() })
    .where(eq(inventarisTable.id, id));
  return res.status(201).json(transaksi);
});

router.get("/inventaris/:id/transaksi", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });
  const rows = await db.select().from(transaksiInventarisTable)
    .where(eq(transaksiInventarisTable.inventaris_id, id))
    .orderBy(transaksiInventarisTable.created_at);
  return res.json(rows.reverse());
});

export default router;
