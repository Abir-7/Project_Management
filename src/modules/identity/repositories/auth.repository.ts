import { AppDataSource } from "../../../shared/database/data-source.js";
import { UserAuth } from "../entities/user-auth.js";

export const userAuthRepository = AppDataSource.getRepository(UserAuth);
