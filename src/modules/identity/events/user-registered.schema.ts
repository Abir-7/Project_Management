import { z } from "zod";

export const userRegisteredEventSchema = z.object({
  userId: z.string().uuid(),
  email: z.email(),
  name: z.string(),
  verificationToken: z.string(),
});

export type UserRegisteredEvent = z.infer<typeof userRegisteredEventSchema>;
