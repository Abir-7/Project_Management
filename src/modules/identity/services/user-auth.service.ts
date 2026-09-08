import { StatusCodes } from "http-status-codes";
import { AppError } from "../../../shared/errors/app-error.js";

import type { CreateUserAuthInput } from "../schemas/user-auth.schema.js";
import { userAuthRepository } from "../repositories/auth.repository.js";
import { hashValue } from "../../../shared/utils/hash.js";

class UserAuthService {
  async createUserAuth({
    userId,
    password,
  }: CreateUserAuthInput & { userId: string }) {
    const existingAuth = await userAuthRepository.findOne({
      where: { userId },
    });

    if (existingAuth) {
      throw new AppError({
        statusCode: StatusCodes.CONFLICT,
        message: "Authentication record already exists for this user",
      });
    }

    const passwordHash = await hashValue(password);

    const userAuth = userAuthRepository.create({
      userId,
      passwordHash,
    });

    return userAuthRepository.save(userAuth);
  }

  async getAuthByUserId(userId: string) {
    return userAuthRepository.findOne({
      where: { userId },
    });
  }
}

export const userAuthService = new UserAuthService();
