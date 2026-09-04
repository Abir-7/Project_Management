import "reflect-metadata";
import { config } from "dotenv";
import { resolve } from "node:path";

// Load .env once, from project root
config({ path: resolve(import.meta.dirname, "../../../.env") });

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),

  database: {
    host: required("DATABASE_HOST"),
    port: Number(required("DATABASE_PORT")),
    username: required("DATABASE_USER"),
    password: required("DATABASE_PASSWORD"),
    name: required("DATABASE_NAME"),
    synchronize: process.env.DB_SYNCHRONIZE === "true",
    logging: process.env.DB_LOGGING === "true",
  },
} as const;
