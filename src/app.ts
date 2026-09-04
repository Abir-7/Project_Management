import express, { type Express, type Request, type Response } from "express";
import { AppDataSource } from "./shared/database/data-source.js";

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await AppDataSource.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

export default app;
