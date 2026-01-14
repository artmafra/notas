import { AuditLogsStorage } from "./audit-log.storage";
import { InvoicesStorage } from "./invoices.storage";
import { ServicesStorage } from "./services.storage";
import { SuppliersStorage } from "./suppliers.storage";
import { UsersStorage } from "./users.storage";

export class DatabaseStorage {
  invoice: InvoicesStorage;
  supplier: SuppliersStorage;
  service: ServicesStorage;
  user: UsersStorage;
  auditLog: AuditLogsStorage;

  constructor() {
    this.invoice = new InvoicesStorage();
    this.supplier = new SuppliersStorage();
    this.service = new ServicesStorage();
    this.user = new UsersStorage();
    this.auditLog = new AuditLogsStorage();
  }
}

export const storage = new DatabaseStorage();
