import { InvoiceService } from "./invoice.service";
import { UserService } from "./user.service";

export class Services {
  invoice: InvoiceService;
  user: UserService;

  constructor() {
    this.invoice = new InvoiceService();
    this.user = new UserService();
  }
}

export const service = new Services();
