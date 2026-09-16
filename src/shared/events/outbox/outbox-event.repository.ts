import { AppDataSource } from "../../../bootstrap/data-source.js";
import { OutboxEvent } from "./outbox-event.entity.js";

export const outboxEventRepository = AppDataSource.getRepository(OutboxEvent);
