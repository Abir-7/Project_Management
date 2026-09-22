import { AppDataSource } from "../../../bootstrap/data-source.js";

import { Subscription } from "../entities/subscription.js";

export const subscriptionRepository = AppDataSource.getRepository(Subscription);
