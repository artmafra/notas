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

  updateSupplier(cnpj: string, data: UpdateSupplierSchema) {
    return this.db
      .update(suppliers)
      .set(data)
      .where(eq(suppliers.cnpj, cnpj))
      .returning();
  }

  deleteSupplier(cnpj: string) {
    return this.db
      .delete(suppliers)
      .where(eq(suppliers.cnpj, cnpj))
      .returning();
  }

  getSupplierByCnpj(cnpj: string) {
    return this.db
      .select()
      .from(suppliers)
      .where(eq(suppliers.cnpj, cnpj))
      .then((res) => res[0]);
  }
}
