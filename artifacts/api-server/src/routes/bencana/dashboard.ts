import { Router } from "express";
import { db } from "@workspace/db";
import { laporanTable, relawanTable, inventarisTable, penugasanTable, kebutuhanTable } from "@workspace/db/schema";
import { count, sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/statistik", async (req, res) => {
  const [laporanStats] = await db.select({
    total: count(),
    menunggu: sql<number>`count(*) filter (where status = 'menunggu')`.mapWith(Number),
    terverifikasi: sql<number>`count(*) filter (where status = 'terverifikasi')`.mapWith(Number),
    selesai: sql<number>`count(*) filter (where status = 'selesai')`.mapWith(Number),
  }).from(laporanTable);

  const [relawanStats] = await db.select({
    total: count(),
    terverifikasi: sql<number>`count(*) filter (where status_verifikasi = 'terverifikasi')`.mapWith(Number),
    menunggu: sql<number>`count(*) filter (where status_verifikasi = 'menunggu')`.mapWith(Number),
  }).from(relawanTable);

  const [inventarisStats] = await db.select({
    total: count(),
    kritis: sql<number>`count(*) filter (where stok_sisa <= 5)`.mapWith(Number),
  }).from(inventarisTable);

  const [penugasanStats] = await db.select({
    aktif: sql<number>`count(*) filter (where status = 'aktif')`.mapWith(Number),
  }).from(penugasanTable);

  const [kebutuhanStats] = await db.select({
    total: count(),
    terpenuhi: sql<number>`count(*) filter (where jumlah_terpenuhi >= jumlah_dibutuhkan)`.mapWith(Number),
  }).from(kebutuhanTable);

  return res.json({
    total_laporan: laporanStats?.total ?? 0,
    laporan_menunggu: laporanStats?.menunggu ?? 0,
    laporan_terverifikasi: laporanStats?.terverifikasi ?? 0,
    laporan_selesai: laporanStats?.selesai ?? 0,
    total_relawan: relawanStats?.total ?? 0,
    relawan_terverifikasi: relawanStats?.terverifikasi ?? 0,
    relawan_menunggu: relawanStats?.menunggu ?? 0,
    total_inventaris: inventarisStats?.total ?? 0,
    stok_kritis: inventarisStats?.kritis ?? 0,
    penugasan_aktif: penugasanStats?.aktif ?? 0,
    kebutuhan_total: kebutuhanStats?.total ?? 0,
    kebutuhan_terpenuhi: kebutuhanStats?.terpenuhi ?? 0,
  });
});

export default router;
