import { eq } from "drizzle-orm";
import { BaseStorage } from "./base.storage";
import {
  InsertSupplierSchema,
  suppliers,
  UpdateSupplierSchema,
} from "@/db/schemas";

export class SuppliersStorage extends BaseStorage {
  getAllSuppliers() {
    return this.db.select().from(suppliers);
  }

  createSupplier(data: InsertSupplierSchema) {
    return this.db.insert(suppliers).values(data).returning();
  }

  updateSupplier(id: number, data: UpdateSupplierSchema) {
    return this.db
      .update(suppliers)
      .set(data)
      .where(eq(suppliers.id, id))
      .returning();
  }

  deleteSupplier(id: number) {
    return this.db.delete(suppliers).where(eq(suppliers.id, id)).returning();
  }
}
