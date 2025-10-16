import { pgTable, serial, text, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";

export const services = pgTable("services", {
  code: text("code").primaryKey(),
  description: text("description").notNull(),
  debit: text("debit").notNull(),
  sn_issqn: decimal("sn_issqn", { precision: 5, scale: 2 }),
  sn_inss: decimal("sn_inss", { precision: 5, scale: 2 }),
  sn_cs: decimal("sn_cs", { precision: 5, scale: 2 }),
  sn_irrf: decimal("sn_irrf", { precision: 5, scale: 2 }),
  n_issqn: decimal("n_issqn", { precision: 5, scale: 2 }),
  n_inss: decimal("n_inss", { precision: 5, scale: 2 }),
  n_cs: decimal("n_cs", { precision: 5, scale: 2 }),
  n_irrf: decimal("n_irrf", { precision: 5, scale: 2 }),
  mei_issqn: decimal("mei_issqn", { precision: 5, scale: 2 }),
  mei_inss: decimal("mei_inss", { precision: 5, scale: 2 }),
  mei_cs: decimal("mei_cs", { precision: 5, scale: 2 }),
  mei_irrf: decimal("mei_irrf", { precision: 5, scale: 2 }),
  obs: text("obs"),
});

export const insertServiceSchema = createInsertSchema(services);
export const updateServiceSchema = createUpdateSchema(services);

export type InsertServiceSchema = z.infer<typeof insertServiceSchema>;
export type UpdateServiceSchema = z.infer<typeof updateServiceSchema>;
