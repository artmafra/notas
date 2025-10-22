import { InvoicesStorage } from "./invoices.storage";
import { ServicesStorage } from "./services.storage";
import { SuppliersStorage } from "./suppliers.storage";
import { UsersStorage } from "./users.storage";

export class DatabaseStorage {
  invoice: InvoicesStorage;
  supplier: SuppliersStorage;
  service: ServicesStorage;
  user: UsersStorage;

  constructor() {
    this.invoice = new InvoicesStorage();
    this.supplier = new SuppliersStorage();
    this.service = new ServicesStorage();
    this.user = new UsersStorage();
  }
}

export const storage = new DatabaseStorage();
