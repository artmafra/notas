import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";

// Users table
export const tableUsers = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(tableUsers);
export const updateUserSchema = createUpdateSchema(tableUsers);

export const createUserSchema = insertUserSchema.pick({
  email: true,
  password: true,
});

// Export types for TypeScript
export type User = typeof tableUsers.$inferSelect;
export type InsertUserSchema = z.infer<typeof insertUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
