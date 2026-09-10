import { userRegisteredEventSchema } from "./user-registered.schema.js";

class UserRegisteredHandler {
  async handle(payload: Record<string, unknown>): Promise<void> {
    const event = userRegisteredEventSchema.parse(payload);

    console.log(`Send verification email to ${event.email}`);

    // Email service later.
  }
}

export const userRegisteredHandler = new UserRegisteredHandler();
