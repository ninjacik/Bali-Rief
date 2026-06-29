import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const inventarisTable = pgTable("inventaris", {
  id: serial("id").primaryKey(),
  nama_barang: text("nama_barang").notNull(),
  kategori: text("kategori").notNull(),
  satuan: text("satuan").notNull(),
  stok_masuk: integer("stok_masuk").notNull().default(0),
  stok_keluar: integer("stok_keluar").notNull().default(0),
  stok_sisa: integer("stok_sisa").notNull().default(0),
  keterangan: text("keterangan"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export const insertInventarisSchema = createInsertSchema(inventarisTable).omit({ id: true, created_at: true, stok_masuk: true, stok_keluar: true, stok_sisa: true });
export type InsertInventaris = z.infer<typeof insertInventarisSchema>;
export type Inventaris = typeof inventarisTable.$inferSelect;

export const transaksiInventarisTable = pgTable("transaksi_inventaris", {
  id: serial("id").primaryKey(),
  inventaris_id: integer("inventaris_id").notNull(),
  jenis: text("jenis").notNull(),
  jumlah: integer("jumlah").notNull(),
  keterangan: text("keterangan").notNull(),
  laporan_id: integer("laporan_id"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTransaksiInventarisSchema = createInsertSchema(transaksiInventarisTable).omit({ id: true, created_at: true });
export type InsertTransaksiInventaris = z.infer<typeof insertTransaksiInventarisSchema>;
export type TransaksiInventaris = typeof transaksiInventarisTable.$inferSelect;
