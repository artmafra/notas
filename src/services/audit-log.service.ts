import { storage } from "@/storage";
import { CreateAuditLogSchema } from "@/db/schemas";

export class AuditLogService {
  async getAllLogs() {
    return storage.auditLog.getAllLogs();
  }
  async getLogByDate(date: Date) {
    return storage.auditLog.getLogByDate(date);
  }
  async createLog(data: CreateAuditLogSchema) {
    return storage.auditLog.createLog(data);
  }
}
