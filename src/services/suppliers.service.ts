import { InsertSupplierSchema, UpdateSupplierSchema } from "@/db/schemas";
import { storage } from "@/storage";

export class SupplierService {
  async getAllSuppliers() {
    await storage.supplier.getAllSuppliers();
  }

  async getSupplierByCnpj(cnpj: string) {
    await storage.supplier.getSupplierByCnpj(cnpj);
  }

  async createSupplier(data: InsertSupplierSchema) {
    await storage.supplier.createSupplier(data);
  }

  async updateSupplier(cnpj: string, data: UpdateSupplierSchema) {
    const updatedData = {
      cnpj,
      ...data,
    };

    await storage.supplier.updateSupplier(cnpj, updatedData);
  }

  async deleteSupplier(cnpj: string) {
    await storage.supplier.deleteSupplier(cnpj);
  }
}
