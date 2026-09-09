import express, { type Express, type Request, type Response } from "express";
import { AppDataSource } from "./shared/database/data-source.js";
import { notFoundMiddleware } from "./shared/middlewares/not-found.middleware.js";
import { errorMiddleware } from "./shared/middlewares/error.middleware.js";
import identityRouter from "./modules/identity/index.js";
const app: Express = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

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

app.use("/api", identityRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
