import {
  InsertServiceSchema,
  tableServices,
  UpdateServiceSchema,
} from "@/db/schemas";
import { eq } from "drizzle-orm";
import { BaseStorage } from "./base.storage";

export class ServicesStorage extends BaseStorage {
  getAllServices() {
    return this.db.select().from(tableServices);
  }

  createService(data: InsertServiceSchema) {
    return this.db.insert(tableServices).values(data).returning();
  }

  updateService(code: string, data: UpdateServiceSchema) {
    return this.db
      .update(tableServices)
      .set(data)
      .where(eq(tableServices.code, code))
      .returning();
  }

  deleteService(code: string) {
    return this.db
      .delete(tableServices)
      .where(eq(tableServices.code, code))
      .returning();
  }

  getServiceByCode(code: string) {
    return this.db
      .select()
      .from(tableServices)
      .where(eq(tableServices.code, code))
      .then((res) => res[0]);
  }
}
