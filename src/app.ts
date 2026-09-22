import express, { type Express, type Request, type Response } from "express";

import { notFoundMiddleware } from "./shared/middlewares/not-found.middleware.js";
import { errorMiddleware } from "./shared/middlewares/error.middleware.js";

import { createResolveTenant } from "./shared/middlewares/resolve-tenant.js";
import createIdentityRouter, {
  tenantService,
} from "./modules/identity/index.js";
import { AppDataSource } from "./bootstrap/data-source.js";
import billingRouter from "./modules/billing/index.js";
const app: Express = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

const resolveTenantMiddleware = createResolveTenant(tenantService);

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await AppDataSource.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not connected",
    });
  }
});
// route
app.use("/api/identity", createIdentityRouter(resolveTenantMiddleware));
app.use("/api/billing", billingRouter);
//middleware
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
