import { InvoiceService } from "./invoice.service";
import { ServiceService } from "./services.service";
import { SupplierService } from "./suppliers.service";
import { UserService } from "./user.service";

export class Services {
  invoice: InvoiceService;
  user: UserService;
  supplier: SupplierService;
  service: ServiceService;

  constructor() {
    this.invoice = new InvoiceService();
    this.user = new UserService();
    this.supplier = new SupplierService();
    this.service = new ServiceService();
  }
}

export const service = new Services();
