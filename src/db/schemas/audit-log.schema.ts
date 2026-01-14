import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

export const tableAuditLog = pgTable("auditlog", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  tableName: text("table_name").notNull(),
  recordId: text("record_id").notNull(),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  ipAddress: text("ip_address"),
  userAgente: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const createAuditLogSchema = createInsertSchema(tableAuditLog);

export type CreateAuditLogSchema = z.infer<typeof createAuditLogSchema>;
