import { InsertInvoiceSchema, TaxRegime } from "@/db/schemas";
import { storage } from "@/storage";

export class InvoiceService {
  async createInvoice(data: InsertInvoiceSchema) {
    const supplier = await storage.supplier.getSupplierByCnpj(
      data.supplierCnpj
    );
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    const service = await storage.service.getServiceByCode(data.serviceCode);
    if (!service) {
      throw new Error("Service not found");
    }
    const taxRegime = supplier.taxRegime.toLowerCase() as TaxRegime;
    const rates = service[taxRegime];

    const material = data.materialDeductionCents || 0;
    const value = data.valueCents || 0;

    let tax = 0;

    const inss = data.inssCents || rates.inss;

    if (inss) {
      const taxValue = value * (inss / 100);
      const taxMaterial = material * (inss / 100);
      tax = taxValue - taxMaterial;
    }

    if (rates.cs) {
      if (value * (rates.cs / 100) >= 1000) {
        const taxValue = value * (rates.cs / 100);
        tax += taxValue;
      }
    }

    if (rates.irrf) {
      if (value * (rates.irrf / 100) >= 1000) {
        const taxValue = value * (rates.irrf / 100);
        tax += taxValue;
      }
    }

    if (rates.issqn) {
      const taxValue = value * (rates.issqn / 100);
      tax += taxValue;
    }

    const netAmountCents = value - tax;

    return netAmountCents;

    // await storage.invoice.createInvoice(data);
  }
}
