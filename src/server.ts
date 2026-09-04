import app from "./app.js";
import { AppDataSource } from "./shared/database/data-source.js";

const bootstrap = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }

  app.listen(3000, () => {
    console.log(`Server running on http://localhost:${3000}`);
  });
};

bootstrap();
