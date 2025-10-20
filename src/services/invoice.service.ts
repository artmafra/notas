import { storage } from "@/storage";

type CreateInvoiceSchema = {
  supplierCnpj: string;
  serviceCode: string;
  valueCents: number;
  entryDate: string;
  issueDate: string;
  dueDate: string;
  description?: string;
  invoiceNumber: string;
  materialDeductionCents?: number;
};

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

    let cs;
    let inss;
    let irrf;
    let issqn;

    switch (supplier.taxRegime) {
      case "SN":
        cs = service.sn_cs;
        inss = service.sn_inss;
        irrf = service.sn_irrf;
        issqn = service.sn_issqn;
        break;
      case "N":
        cs = service.n_cs;
        inss = service.n_inss;
        irrf = service.n_irrf;
        issqn = service.n_issqn;
        break;
      case "MEI":
        cs = service.mei_cs;
        inss = service.mei_inss;
        irrf = service.mei_irrf;
        issqn = service.mei_issqn;
        break;
    }

    let resultMaterialDeductionCents = data.materialDeductionCents || 0;
    let resultValueCents = data.valueCents;

    if (inss) {
      const inssFloat = parseFloat(inss);
      const inssPercentage = inssFloat / 100;
      if (data.materialDeductionCents) {
        let percentageValueCents = resultValueCents * inssPercentage;
        let percentageMaterialDeductionCents =
          resultMaterialDeductionCents * inssPercentage;
        resultMaterialDeductionCents =
          percentageValueCents - percentageMaterialDeductionCents;
        inss = resultMaterialDeductionCents;
      }
    }

    const netAmountCents = resultValueCents - resultMaterialDeductionCents;

    return netAmountCents;
  }
}
