import { Router } from "express";
import { Plan } from "./entities/plan.js";
import { Subscription } from "./entities/subscription.js";
import billingRouter from "./routes/billing.route.js";
export const billingEntities = [Plan, Subscription];

const router = Router();

router.use("/", billingRouter);

export default router;
