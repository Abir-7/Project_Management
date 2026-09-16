import { AppDataSource } from "../../../bootstrap/data-source.js";
import { Branch } from "../entities/branch.js";

export const branchRepository = AppDataSource.getRepository(Branch);
