import { Router } from "express";
import { db } from "@workspace/db";
import { relawanTable } from "@workspace/db/schema";
import { eq, or } from "drizzle-orm";

const router = Router();

router.get("/relawan", async (req, res) => {
  const { status_verifikasi } = req.query as Record<string, string>;
  const rows = await db.select().from(relawanTable).orderBy(relawanTable.created_at);
  const filtered = status_verifikasi ? rows.filter(r => r.status_verifikasi === status_verifikasi) : rows;
  return res.json(filtered.reverse());
});

router.get("/relawan/cek-email", async (req, res) => {
  const { email } = req.query as Record<string, string>;
  if (!email) return res.json({ terdaftar: false });
  const rows = await db.select().from(relawanTable).where(eq(relawanTable.email, email));
  if (rows.length === 0) return res.json({ terdaftar: false });
  return res.json({ terdaftar: true, relawan: rows[0] });
});

router.post("/relawan", async (req, res) => {
  const body = req.body;

  // Cegah duplikat berdasarkan NIK atau email
  const existing = await db.select().from(relawanTable).where(
    body.email
      ? or(eq(relawanTable.nik, body.nik), eq(relawanTable.email, body.email))
      : eq(relawanTable.nik, body.nik)
  );

  if (existing.length > 0) {
    const dup = existing[0];
    const byNik = dup.nik === body.nik;
    return res.status(409).json({
      message: byNik
        ? "NIK ini sudah terdaftar sebagai relawan. Silakan hubungi admin jika ada kesalahan."
        : "Email ini sudah terdaftar sebagai relawan. Silakan login dengan akun yang sama.",
      relawan_id: dup.id,
    });
  }

  const [row] = await db.insert(relawanTable).values({
    nama: body.nama,
    nik: body.nik,
    no_hp: body.no_hp,
    email: body.email ?? null,
    alamat: body.alamat,
    keahlian: body.keahlian ?? [],
    foto_ktp_url: body.foto_ktp_url ?? null,
  }).returning();
  return res.status(201).json(row);
});

router.get("/relawan/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });
  const [row] = await db.select().from(relawanTable).where(eq(relawanTable.id, id));
  if (!row) return res.status(404).json({ message: "Relawan tidak ditemukan" });
  return res.json(row);
});

const handleVerifikasiRelawan = async (req: any, res: any) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });
  const body = req.body;
  const [updated] = await db.update(relawanTable)
    .set({
      status_verifikasi: body.status_verifikasi,
      catatan_verifikasi: body.catatan_verifikasi ?? null,
    })
    .where(eq(relawanTable.id, id))
    .returning();
  if (!updated) return res.status(404).json({ message: "Relawan tidak ditemukan" });
  return res.json(updated);
};

router.put("/relawan/:id/verifikasi", handleVerifikasiRelawan);
router.patch("/relawan/:id/verifikasi", handleVerifikasiRelawan);

export default router;
