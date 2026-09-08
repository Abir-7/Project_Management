import { z } from "zod";

export const createUserAuthSchema = z.object({
  password: z.string().min(8).max(100),
});

export type CreateUserAuthInput = z.infer<typeof createUserAuthSchema>;
