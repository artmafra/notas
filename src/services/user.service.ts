import { CreateUserSchema, UpdateUserSchema } from "@/db/schemas";
import { storage } from "@/storage";
import bcrypt from "bcrypt";

export class UserService {
  async getAllUsers() {
    return storage.user.getAllUsers();
  }
  async createUser(data: CreateUserSchema) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return storage.user.createUser({
      ...data,
      password: hashedPassword,
    });
  }

  async verifyPassword(plainPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateUser(id: number, data: UpdateUserSchema) {
    return storage.user.updateUser(id, data);
  }
  async deleteUser(id: number) {
    return storage.user.deleteUser(id);
  }
}
