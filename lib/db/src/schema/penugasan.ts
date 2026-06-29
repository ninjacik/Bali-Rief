import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const penugasanTable = pgTable("penugasan", {
  id: serial("id").primaryKey(),
  laporan_id: integer("laporan_id").notNull(),
  relawan_id: integer("relawan_id").notNull(),
  nama_relawan: text("nama_relawan").notNull(),
  detail_tugas: text("detail_tugas").notNull(),
  lokasi_tugas: text("lokasi_tugas").notNull(),
  link_grup: text("link_grup"),
  qr_code_url: text("qr_code_url"),
  status: text("status").notNull().default("aktif"),
  catatan: text("catatan"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPenugasanSchema = createInsertSchema(penugasanTable).omit({ id: true, created_at: true });
export type InsertPenugasan = z.infer<typeof insertPenugasanSchema>;
export type Penugasan = typeof penugasanTable.$inferSelect;
