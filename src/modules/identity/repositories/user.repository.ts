import { AppDataSource } from "../../../bootstrap/data-source.js";
import { User } from "../entities/user.js";

export const userRepository = AppDataSource.getRepository(User);
