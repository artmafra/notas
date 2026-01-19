import {
  CreateInvoiceSchema,
  TaxRegime,
  UpdateInvoiceSchema,
} from "@/db/schemas";
import { storage } from "@/storage";

export class InvoiceService {
  async createInvoice(data: CreateInvoiceSchema) {
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

    const inss = data.inssPercent || rates.inss;

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

    await storage.invoice.createInvoice({
      ...data,
      netAmountCents,
    });
  }

  async getAllInvoices() {
    return await storage.invoice.getAllInvoices();
  }

  async getInvoiceById(id: number) {
    await storage.invoice.getInvoiceById(id);
  }

  async getInvoiceByDueDate(dueDate: Date) {
    await storage.invoice.getInvoiceByDueDate(dueDate);
  }

  async getInvoiceByIssueDate(issueDate: Date) {
    await storage.invoice.getInvoiceByIssueDate(issueDate);
  }

  async getInvoiceByEntryDate(entryDate: Date) {
    await storage.invoice.getInvoiceByEntryDate(entryDate);
  }

  async updateInvoice(id: number, data: UpdateInvoiceSchema) {
    const updatedData = {
      id,
      ...data,
    };
    await storage.invoice.updateInvoice(id, updatedData);
  }

  async deleteInvoice(id: number) {
    await storage.invoice.deleteInvoice(id);
  }
}
