import { InvoiceService } from "./invoice.service";

export class Services {
  invoice: InvoiceService;

  constructor() {
    this.invoice = new InvoiceService();
  }
}

export const service = new Services();
