import {
  InsertInvoiceSchema,
  tableInvoices,
  UpdateInvoiceSchema,
} from "@/db/schemas";
import { eq } from "drizzle-orm";
import { BaseStorage } from "./base.storage";

export class InvoicesStorage extends BaseStorage {
  getAllInvoices() {
    return this.db.select().from(tableInvoices);
  }

  getInvoiceById(id: number) {
    return this.db.select().from(tableInvoices).where(eq(tableInvoices.id, id));
  }

  getInvoiceByDueDate(dueDate: Date) {
    return this.db
      .select()
      .from(tableInvoices)
      .where(eq(tableInvoices.dueDate, dueDate));
  }
  getInvoiceByIssueDate(issueDate: Date) {
    return this.db
      .select()
      .from(tableInvoices)
      .where(eq(tableInvoices.issueDate, issueDate));
  }

  getInvoiceByEntryDate(entryDate: Date) {
    return this.db
      .select()
      .from(tableInvoices)
      .where(eq(tableInvoices.entryDate, entryDate));
  }

  createInvoice(data: InsertInvoiceSchema) {
    return this.db.insert(tableInvoices).values(data).returning();
  }

  updateInvoice(id: number, data: UpdateInvoiceSchema) {
    return this.db
      .update(tableInvoices)
      .set(data)
      .where(eq(tableInvoices.id, id))
      .returning();
  }

  deleteInvoice(id: number) {
    return this.db
      .delete(tableInvoices)
      .where(eq(tableInvoices.id, id))
      .returning();
  }
}
