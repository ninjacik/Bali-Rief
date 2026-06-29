import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const donasiTable = pgTable("donasi", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id"),
  laporan_id: integer("laporan_id"),
  jenis: text("jenis").notNull(),
  jumlah_dana: integer("jumlah_dana"),
  nama_barang: text("nama_barang"),
  jumlah_barang: integer("jumlah_barang"),
  nama_donatur: text("nama_donatur").notNull(),
  kontak_donatur: text("kontak_donatur"),
  pesan: text("pesan"),
  status: text("status").notNull().default("menunggu"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDonasiSchema = createInsertSchema(donasiTable).omit({ id: true, created_at: true, status: true });
export type InsertDonasi = z.infer<typeof insertDonasiSchema>;
export type Donasi = typeof donasiTable.$inferSelect;
