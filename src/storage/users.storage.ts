import { InsertUserSchema, tableUsers, UpdateUserSchema } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { BaseStorage } from "./base.storage";

export class UsersStorage extends BaseStorage {
  getAllUsers() {
    return this.db.select().from(tableUsers);
  }

  createUser(data: InsertUserSchema) {
    return this.db.insert(tableUsers).values(data).returning();
  }

  updateUser(id: number, data: UpdateUserSchema) {
    return this.db
      .update(tableUsers)
      .set(data)
      .where(eq(tableUsers.id, id))
      .returning();
  }

  deleteUser(id: number) {
    return this.db.delete(tableUsers).where(eq(tableUsers.id, id)).returning();
  }
}
