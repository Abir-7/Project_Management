import { z } from "zod";
import { userRegisteredEventSchema } from "./user-registered.schema.js";

export const emailVerificationRequestedEventSchema = userRegisteredEventSchema;

export type EmailVerificationRequestedEvent = z.infer<
  typeof emailVerificationRequestedEventSchema
>;
