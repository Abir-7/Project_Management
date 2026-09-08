import { AppDataSource } from "../../../shared/database/data-source.js";
import { Branch } from "../entities/branch.js";

export const branchRepository = AppDataSource.getRepository(Branch);
