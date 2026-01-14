import { InvoiceService } from "./invoice.service";
import { ServiceService } from "./services.service";
import { SupplierService } from "./suppliers.service";
import { UserService } from "./user.service";
import { AuditLogService } from "./audit-log.service";

export class Services {
  invoice: InvoiceService;
  user: UserService;
  supplier: SupplierService;
  service: ServiceService;
  auditLog: AuditLogService;

  constructor() {
    this.invoice = new InvoiceService();
    this.user = new UserService();
    this.supplier = new SupplierService();
    this.service = new ServiceService();
    this.auditLog = new AuditLogService();
  }
}

export const service = new Services();
