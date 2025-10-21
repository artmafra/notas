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
