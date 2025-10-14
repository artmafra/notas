import {
  InsertInvoiceSchema,
  invoices,
  UpdateInvoiceSchema,
} from "@/db/schemas";
import { BaseStorage } from "./base.storage";
import { eq } from "drizzle-orm";

export class InvoicesStorage extends BaseStorage {
  getAllInvoices() {
    return this.db.select().from(invoices);
  }

  createInvoice(data: InsertInvoiceSchema) {
    return this.db.insert(invoices).values(data).returning();
  }

  updateInvoice(id: number, data: UpdateInvoiceSchema) {
    return this.db
      .update(invoices)
      .set(data)
      .where(eq(invoices.id, id))
      .returning();
  }

  deleteInvoice(id: number) {
    return this.db.delete(invoices).where(eq(invoices.id, id)).returning();
  }
}
