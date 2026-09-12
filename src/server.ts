import app from "./app.js";
import { env } from "./shared/config/index.js";
import { AppDataSource } from "./shared/database/data-source.js";
import { outboxEventWorker } from "./shared/events/outbox/outbox-event.worker.js";

let server: ReturnType<typeof app.listen>;

const startServer = () => {
  server = app.listen(env.port, () => {
    console.log(`🚀 Server running on http://localhost:${env.port}`);
  });
};

const shutdown = async () => {
  console.log("🛑 Shutting down...");

  if (server) {
    server.close();
  }

  outboxEventWorker.stop();

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }

  console.log("✅ Shutdown complete");
};

const bootstrap = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected");
    outboxEventWorker.start();
    console.log("✅ Worker starts");
    startServer();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});

void bootstrap();
