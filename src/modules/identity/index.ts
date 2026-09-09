import { Router } from "express";

import authRouter from "./routes/auth.route.js";
import organizationRouter from "./routes/organization.route.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/organizations", organizationRouter);

export default router;
