import { CreateAuditLogSchema, tableAuditLog } from "@/db/schemas";
import { BaseStorage } from "./base.storage";
import { eq } from "drizzle-orm";

export class AuditLogsStorage extends BaseStorage {
  getAllLogs() {
    return this.db.select().from(tableAuditLog);
  }
  getLogByDate(date: Date) {
    return this.db
      .select()
      .from(tableAuditLog)
      .where(eq(tableAuditLog.createdAt, date));
  }
  createLog(data: CreateAuditLogSchema) {
    return this.db.insert(tableAuditLog).values(data).returning();
  }
}
