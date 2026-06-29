import { Router } from "express";
import { db } from "@workspace/db";
import { laporanTable, kebutuhanTable, inventarisTable, penugasanTable, relawanTable, donasiTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/transparansi/laporan", async (req, res) => {
  const laporan = await db.select().from(laporanTable).orderBy(laporanTable.created_at);

  const kebutuhan = await db.select().from(kebutuhanTable);
  const penugasan = await db.select().from(penugasanTable);
  const relawan = await db.select().from(relawanTable);
  const donasi = await db.select().from(donasiTable);

  const kebutuhanMap: Record<number, typeof kebutuhan> = {};
  for (const k of kebutuhan) {
    if (!kebutuhanMap[k.laporan_id]) kebutuhanMap[k.laporan_id] = [];
    kebutuhanMap[k.laporan_id].push(k);
  }

  const penugasanMap: Record<number, typeof penugasan> = {};
  for (const p of penugasan) {
    if (!penugasanMap[p.laporan_id]) penugasanMap[p.laporan_id] = [];
    penugasanMap[p.laporan_id].push(p);
  }

  const donasiMap: Record<number, typeof donasi> = {};
  for (const d of donasi) {
    const lid = d.laporan_id;
    if (lid == null) continue;
    if (!donasiMap[lid]) donasiMap[lid] = [];
    donasiMap[lid].push(d);
  }

  const result = laporan.reverse().map(l => {
    const pug = penugasanMap[l.id] || [];
    const relawanNama = pug
      .map(p => relawan.find(r => r.id === p.relawan_id)?.nama)
      .filter(Boolean);

    return {
      ...l,
      kebutuhan: kebutuhanMap[l.id] || [],
      relawan_bertugas: relawanNama,
      donasi: donasiMap[l.id] || [],
      foto_penyerahan: FOTO_DUMMY.filter(f => f.laporan_id === l.id),
    };
  });

  return res.json(result);
});

const FOTO_DUMMY = [
  {
    laporan_id: 1,
    url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
    keterangan: "Distribusi sembako kepada pengungsi banjir Ubud",
    tanggal: "2026-06-27",
  },
  {
    laporan_id: 1,
    url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800",
    keterangan: "Relawan mendirikan tenda pengungsian di Balai Banjar",
    tanggal: "2026-06-27",
  },
  {
    laporan_id: 2,
    url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
    keterangan: "Tim SAR melakukan evakuasi korban longsor Kintamani",
    tanggal: "2026-06-27",
  },
  {
    laporan_id: 3,
    url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800",
    keterangan: "Bantuan alat masak diserahkan ke pedagang korban kebakaran Tabanan",
    tanggal: "2026-06-27",
  },
];

export default router;
