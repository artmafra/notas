import { CreateUserSchema, UpdateUserSchema } from "@/db/schemas";
import { storage } from "@/storage";

export class UserService {
  async getAllUsers() {
    return storage.user.getAllUsers();
  }
  async createUser(data: CreateUserSchema) {
    return storage.user.createUser(data);
  }
  async updateUser(id: number, data: UpdateUserSchema) {
    return storage.user.updateUser(id, data);
  }
  async deleteUser(id: number) {
    return storage.user.deleteUser(id);
  }
}
