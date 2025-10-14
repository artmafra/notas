import { InvoicesStorage } from "./invoices.storage";
import { ServicesStorage } from "./services.storage";
import { SuppliersStorage } from "./suppliers.storage";

export class DatabaseStorage {
  invoice: InvoicesStorage;
  supplier: SuppliersStorage;
  service: ServicesStorage;

  constructor() {
    this.invoice = new InvoicesStorage();
    this.supplier = new SuppliersStorage();
    this.service = new ServicesStorage();
  }
}

export const storage = new DatabaseStorage();
