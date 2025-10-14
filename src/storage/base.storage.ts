import { db } from "@/db/db";

export abstract class BaseStorage {
  protected db = db;
}
