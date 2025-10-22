import { InsertServiceSchema, UpdateServiceSchema } from "@/db/schemas";
import { storage } from "@/storage";

export class ServiceService {
  async getAllServices() {
    await storage.service.getAllServices();
  }

  async getServiceByCode(code: string) {
    await storage.service.getServiceByCode(code);
  }

  async updateService(code: string, data: UpdateServiceSchema) {
    const updatedData = {
      code,
      ...data,
    };
    await storage.service.updateService(code, updatedData);
  }

  async createService(data: InsertServiceSchema) {
    await storage.service.createService(data);
  }

  async deleteService(code: string) {
    await storage.service.deleteService(code);
  }
}
