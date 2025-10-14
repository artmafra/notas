import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { suppliers } from "./suppliers.schema";
import { services } from "./services.schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";

export const invoices = pgTable("invoice", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  serviceCode: text("service_code")
    .notNull()
    .references(() => services.code),
  entryDate: timestamp("entry_date").notNull().defaultNow(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  valueCents: integer("value_cents").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  materialDeductionCents: integer("material_deduction_cents")
    .notNull()
    .default(0),
  issqnCents: integer("issqn_cents").notNull(),
  csCents: integer("cs_cents").notNull(),
  inssCents: integer("inss_cents").notNull(),
  netAmountCents: integer("net_amount_cents").notNull(), // Líquido a receber
});

export const insertInvoiceSchema = createInsertSchema(invoices);
export const updateInvoiceSchema = createUpdateSchema(invoices);

export type InsertInvoiceSchema = z.infer<typeof insertInvoiceSchema>;
export type UpdateInvoiceSchema = z.infer<typeof updateInvoiceSchema>;
