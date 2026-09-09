import { StatusCodes } from "http-status-codes";
import { AppError } from "../../../shared/errors/app-error.js";
import { branchRepository } from "../repositories/branch.repository.js";
import type { CreateBranchInput } from "../schemas/branch.schema.js";

class BranchService {
  async createBranch({
    organizationId,
    name,
    address,
    phone,
  }: CreateBranchInput) {
    const existingBranch = await branchRepository.findOne({
      where: {
        organizationId,
        name,
      },
    });

    if (existingBranch) {
      throw new AppError({
        statusCode: StatusCodes.CONFLICT,
        message: "Branch with this name already exists in this organization",
      });
    }

    const branch = branchRepository.create({
      organizationId,
      name,
      address: address ?? null,
      phone: phone ?? null,
    });

    return branchRepository.save(branch);
  }

  async getBranchById(id: string) {
    return branchRepository.findOne({
      where: { id },
    });
  }
}

export const branchService = new BranchService();
