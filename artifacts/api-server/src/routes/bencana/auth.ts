import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const { nama, email, password, role } = req.body;
  if (!nama || !email || !password || !role) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }
  const validRoles = ["admin", "relawan", "donatur", "pelapor"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    return res.status(409).json({ message: "Email sudah terdaftar" });
  }
  const password_hash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ nama, email, password_hash, role }).returning();
  const session = (req as any).session;
  session.userId = user.id;
  session.role = user.role;
  return res.status(201).json({ id: user.id, nama: user.nama, email: user.email, role: user.role });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi" });
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    return res.status(401).json({ message: "Email atau password salah" });
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: "Email atau password salah" });
  }
  const session = (req as any).session;
  session.userId = user.id;
  session.role = user.role;
  return res.json({ id: user.id, nama: user.nama, email: user.email, role: user.role });
});

router.post("/auth/logout", (req, res) => {
  (req as any).session.destroy(() => {
    res.json({ message: "Logout berhasil" });
  });
});

router.get("/auth/me", async (req, res) => {
  const session = (req as any).session;
  if (!session.userId) {
    return res.status(401).json({ message: "Belum login" });
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
  if (!user) {
    return res.status(401).json({ message: "User tidak ditemukan" });
  }
  return res.json({ id: user.id, nama: user.nama, email: user.email, role: user.role });
});

export default router;
