import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  designation: z.string().max(100).optional(),
  techStack: z.string().max(100).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
