import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const kebutuhanTable = pgTable("kebutuhan", {
  id: serial("id").primaryKey(),
  laporan_id: integer("laporan_id").notNull(),
  kategori: text("kategori").notNull(),
  nama_item: text("nama_item").notNull(),
  jumlah_dibutuhkan: integer("jumlah_dibutuhkan").notNull(),
  jumlah_terpenuhi: integer("jumlah_terpenuhi").notNull().default(0),
  satuan: text("satuan").notNull(),
  keterangan: text("keterangan"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertKebutuhanSchema = createInsertSchema(kebutuhanTable).omit({ id: true, created_at: true });
export type InsertKebutuhan = z.infer<typeof insertKebutuhanSchema>;
export type Kebutuhan = typeof kebutuhanTable.$inferSelect;
