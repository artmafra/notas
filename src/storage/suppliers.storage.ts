import { eq } from "drizzle-orm";
import { BaseStorage } from "./base.storage";
import {
  InsertSupplierSchema,
  tableSuppliers,
  UpdateSupplierSchema,
} from "@/db/schemas";

export class SuppliersStorage extends BaseStorage {
  getAllSuppliers() {
    return this.db.select().from(tableSuppliers);
  }

  createSupplier(data: InsertSupplierSchema) {
    return this.db.insert(tableSuppliers).values(data).returning();
  }

  updateSupplier(cnpj: string, data: UpdateSupplierSchema) {
    return this.db
      .update(tableSuppliers)
      .set(data)
      .where(eq(tableSuppliers.cnpj, cnpj))
      .returning();
  }

  deleteSupplier(cnpj: string) {
    return this.db
      .delete(tableSuppliers)
      .where(eq(tableSuppliers.cnpj, cnpj))
      .returning();
  }

  getSupplierByCnpj(cnpj: string) {
    return this.db
      .select()
      .from(tableSuppliers)
      .where(eq(tableSuppliers.cnpj, cnpj))
      .then((res) => res[0]);
  }
}
