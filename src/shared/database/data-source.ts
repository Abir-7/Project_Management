import { DataSource } from "typeorm";
import { env } from "../config/index.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.name,
  synchronize: env.database.synchronize,
  logging: env.database.logging,
  entities: [],
});
