import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  cnpj: text("cnpj").notNull().unique(),
  name: text("name").notNull().unique(),
  city: text("city").notNull(),
  taxRegime: text("taxRegime").notNull(),
  obs: text("obs"),
});
