import { AppDataSource } from "../../../bootstrap/data-source.js";
import { UserAuth } from "../entities/user-auth.js";

export const userAuthRepository = AppDataSource.getRepository(UserAuth);
