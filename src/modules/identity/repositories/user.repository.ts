import { AppDataSource } from "../../../shared/database/data-source.js";
import { User } from "../entities/user.js";

export const userRepository = AppDataSource.getRepository(User);
