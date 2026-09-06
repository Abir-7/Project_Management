import express, { type Express, type Request, type Response } from "express";
import { AppDataSource } from "./shared/database/data-source.js";
import { notFoundMiddleware } from "./shared/middlewares/not-found.middleware.js";
import { errorMiddleware } from "./shared/middlewares/error.middleware.js";
import { asyncHandler } from "./shared/middlewares/async-handler.js";

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get(
  "/health",
  asyncHandler(async (req: Request, res: Response) => {
    await AppDataSource.query("SELECT 1");
    res.json({
      status: "ok",
      database: "connected",
    });
  }),
);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
