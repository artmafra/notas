import { tableServices, tableSuppliers } from "@/db/schemas";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";

export const tableInvoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  supplierCnpj: text("supplier_cnpj")
    .notNull()
    .references(() => tableSuppliers.cnpj),
  serviceCode: text("service_code")
    .notNull()
    .references(() => tableServices.code),
  entryDate: timestamp("entry_date").notNull().defaultNow(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  valueCents: integer("value_cents").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  materialDeductionCents: integer("material_deduction_cents")
    .notNull()
    .default(0),
  netAmountCents: integer("net_amount_cents").notNull(), // Líquido a receber
});

export const insertInvoiceSchema = createInsertSchema(tableInvoices).omit({
  id: true,
});
export const updateInvoiceSchema = createUpdateSchema(tableInvoices);

export const createInvoiceSchema = insertInvoiceSchema
  .omit({
    netAmountCents: true,
  })
  .extend({
    inssPercent: z.number().optional(),
    csPercent: z.number().optional(),
    issqnPercent: z.number().optional(),
  });

export type Invoice = typeof tableInvoices.$inferSelect;
export type InsertInvoiceSchema = z.infer<typeof insertInvoiceSchema>;
export type UpdateInvoiceSchema = z.infer<typeof updateInvoiceSchema>;
export type CreateInvoiceSchema = z.infer<typeof createInvoiceSchema>;
