import { DataSource } from "typeorm";
import { env } from "../config/index.js";
import { Branch } from "../../modules/identity/entities/branch.js";
import { Organization } from "../../modules/identity/entities/organization.js";
import { User } from "../../modules/identity/entities/user.js";
import { UserAuth } from "../../modules/identity/entities/user-auth.js";
import { OrganizationMembership } from "../../modules/identity/entities/organization-membership.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.name,
  synchronize: env.database.synchronize,
  logging: env.database.logging,
  entities: [Branch, Organization, User, UserAuth, OrganizationMembership],
});
