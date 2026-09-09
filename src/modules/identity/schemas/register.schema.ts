import { z } from "zod";

import { createUserSchema } from "./user.schema.js";
import { createUserAuthSchema } from "./user-auth.schema.js";

export const registerSchema = createUserSchema.extend(
  createUserAuthSchema.shape,
);

export type RegisterInput = z.infer<typeof registerSchema>;
