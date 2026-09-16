import "reflect-metadata";
import { DataSource } from "typeorm";

import { env } from "../config/index.js";

export const createDataSource = (entities: Function[]): DataSource => {
  return new DataSource({
    type: "postgres",
    host: env.database.host,
    port: env.database.port,
    username: env.database.username,
    password: env.database.password,
    database: env.database.name,
    entities,
  });
};
