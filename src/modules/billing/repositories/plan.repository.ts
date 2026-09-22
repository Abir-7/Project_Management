import { AppDataSource } from "../../../bootstrap/data-source.js";

import { Plan } from "../entities/plan.js";

export const planRepository = AppDataSource.getRepository(Plan);
