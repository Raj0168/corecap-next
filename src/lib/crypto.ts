import bcrypt from "bcryptjs";
import { config } from "../config";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, config.saltRounds);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
