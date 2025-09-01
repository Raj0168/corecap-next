import mongoose from "mongoose";
import { config } from "../config";

declare global {
  var _mongoClientPromise: any;
}

let cached = (global as any)._mongoClientPromise;

export default async function connectDB() {
  if (cached) return cached;

  if (!config.mongoUri) throw new Error("MONGODB_URI not provided in config");

  cached = mongoose.connect(config.mongoUri, {}).then((m) => {
    console.log("MongoDB connected");
    return m;
  });

  (global as any)._mongoClientPromise = cached;
  return cached;
}
