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

  updateService(code: string, data: UpdateServiceSchema) {
    return this.db
      .update(services)
      .set(data)
      .where(eq(services.code, code))
      .returning();
  }

  deleteService(code: string) {
    return this.db.delete(services).where(eq(services.code, code)).returning();
  }

  getServiceByCode(code: string) {
    return this.db
      .select()
      .from(services)
      .where(eq(services.code, code))
      .then((res) => res[0]);
  }
}
