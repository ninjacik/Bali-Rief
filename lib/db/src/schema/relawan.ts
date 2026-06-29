import { pgTable, text, serial, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const relawanTable = pgTable("relawan", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  nik: text("nik").notNull(),
  no_hp: text("no_hp").notNull(),
  email: text("email"),
  alamat: text("alamat").notNull(),
  keahlian: json("keahlian").$type<string[]>().default([]),
  foto_ktp_url: text("foto_ktp_url"),
  status_verifikasi: text("status_verifikasi").notNull().default("menunggu"),
  catatan_verifikasi: text("catatan_verifikasi"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRelawanSchema = createInsertSchema(relawanTable).omit({ id: true, created_at: true });
export type InsertRelawan = z.infer<typeof insertRelawanSchema>;
export type Relawan = typeof relawanTable.$inferSelect;
