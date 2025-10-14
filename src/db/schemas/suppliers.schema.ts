import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  cnpj: text("cnpj").notNull().unique(),
  name: text("name").notNull().unique(),
  city: text("city").notNull(),
  taxRegime: text("taxRegime", { enum: ["SN", "N", "MEI"] }).notNull(),
  obs: text("obs"),
});

export const insertSupplierSchema = createInsertSchema(suppliers).extend({
  cnpj: z
    .string()
    .trim()
    .regex(/^\d{14}$/),
  name: z.string().trim().toUpperCase(),
  city: z.string().trim(),
});
export const updateSupplierSchema = createUpdateSchema(suppliers);

export type InsertSupplierSchema = z.infer<typeof insertSupplierSchema>;
export type UpdateSupplierSchema = z.infer<typeof updateSupplierSchema>;
