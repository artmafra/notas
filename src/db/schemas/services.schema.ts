import { pgTable, serial, text, decimal } from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  debit: text("debit").notNull(),
  sn_issqn: decimal("issqn", { precision: 5, scale: 2 }),
  sn_inss: decimal("inss", { precision: 5, scale: 2 }),
  sn_cs: decimal("cs", { precision: 5, scale: 2 }),
  sn_irrf: decimal("irrf", { precision: 5, scale: 2 }),
  n_issqn: decimal("issqn", { precision: 5, scale: 2 }),
  n_inss: decimal("inss", { precision: 5, scale: 2 }),
  n_cs: decimal("cs", { precision: 5, scale: 2 }),
  n_irrf: decimal("irrf", { precision: 5, scale: 2 }),
  mei_issqn: decimal("issqn", { precision: 5, scale: 2 }),
  mei_inss: decimal("inss", { precision: 5, scale: 2 }),
  mei_cs: decimal("cs", { precision: 5, scale: 2 }),
  mei_irrf: decimal("irrf", { precision: 5, scale: 2 }),
  obs: text("obs"),
});
