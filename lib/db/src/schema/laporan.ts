import { pgTable, text, serial, timestamp, integer, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const laporanTable = pgTable("laporan", {
  id: serial("id").primaryKey(),
  judul: text("judul").notNull(),
  jenis_bencana: text("jenis_bencana").notNull(),
  lokasi: text("lokasi").notNull(),
  koordinat_lat: real("koordinat_lat"),
  koordinat_lng: real("koordinat_lng"),
  deskripsi: text("deskripsi").notNull(),
  nama_pelapor: text("nama_pelapor").notNull(),
  kontak_pelapor: text("kontak_pelapor").notNull(),
  jabatan_pelapor: text("jabatan_pelapor"),
  jumlah_terdampak: integer("jumlah_terdampak"),
  lokasi_pengungsian: text("lokasi_pengungsian"),
  foto_urls: json("foto_urls").$type<string[]>().default([]),
  kronologi: text("kronologi"),
  target_dana: integer("target_dana"),
  status: text("status").notNull().default("menunggu"),
  catatan_admin: text("catatan_admin"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export const insertLaporanSchema = createInsertSchema(laporanTable).omit({ id: true, created_at: true });
export type InsertLaporan = z.infer<typeof insertLaporanSchema>;
export type Laporan = typeof laporanTable.$inferSelect;
