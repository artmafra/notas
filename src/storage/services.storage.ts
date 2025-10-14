import {
  InsertServiceSchema,
  services,
  UpdateServiceSchema,
} from "@/db/schemas";
import { eq } from "drizzle-orm";
import { BaseStorage } from "./base.storage";

export class ServicesStorage extends BaseStorage {
  getAllServices() {
    return this.db.select().from(services);
  }

  createService(data: InsertServiceSchema) {
    return this.db.insert(services).values(data).returning();
  }

  updateService(id: number, data: UpdateServiceSchema) {
    return this.db
      .update(services)
      .set(data)
      .where(eq(services.id, id))
      .returning();
  }

  deleteService(id: number) {
    return this.db.delete(services).where(eq(services.id, id)).returning();
  }
}
