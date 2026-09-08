import { StatusCodes } from "http-status-codes";
import { AppError } from "../../../shared/errors/app-error.js";
import { userRepository } from "../repositories/user.repository.js";
import type { CreateUserInput } from "../schemas/user.schema.js";

class UserService {
  async createUser({ name, email, designation, techStack }: CreateUserInput) {
    const existingUser = await userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new AppError({
        statusCode: StatusCodes.CONFLICT,
        message: "User with this email already exists",
      });
    }

    const user = userRepository.create({
      name,
      email,
      designation: designation ?? null,
      techStack: techStack ?? null,
    });

    return userRepository.save(user);
  }

  async getUserById(id: string) {
    return userRepository.findOne({
      where: { id },
    });
  }
}

export const userService = new UserService();
