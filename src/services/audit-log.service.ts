import { storage } from "@/storage";
import { CreateAuditLogSchema } from "@/db/schemas";

export class AuditLogService {
  async getAllAuditLogs() {
    return storage.auditLog.getAllAuditLogs();
  }
  async getAuditLogByDate(date: Date) {
    return storage.auditLog.getAuditLogByDate(date);
  }
  async createAuditLog(data: CreateAuditLogSchema) {
    return storage.auditLog.createAuditLog(data);
  }
}
