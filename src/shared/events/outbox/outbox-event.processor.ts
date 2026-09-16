import { outboxEventRepository } from "./outbox-event.repository.js";
// import { userRegisteredHandler } from "../../../modules/identity/events/handler/user-registered.handler.js";
// import { IDENTITY_EVENTS } from "../../../modules/identity/events/identity.events.js";
import { OutboxEvent } from "./outbox-event.entity.js";
import { randomUUID } from "node:crypto";
import type { OutboxEventHandler } from "../../../contracts/ports/outbox-event-handler.js";

// import { emailVerificationRequestedHandler } from "../../../modules/identity/events/handler/email-verification-requested.handler.js";
export class OutboxEventProcessor {
  private readonly workerId = randomUUID();

  constructor(private readonly handlers: Map<string, OutboxEventHandler>) {}

  async process(): Promise<void> {
    const events = await this.claimEvents();

    for (const event of events) {
      await this.processEvent(event);
    }
  }

  private async claimEvents(): Promise<OutboxEvent[]> {
    return outboxEventRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(OutboxEvent);
      const events = await repository
        .createQueryBuilder("event")
        .setLock("pessimistic_write")
        .setOnLocked("skip_locked")
        .where("event.processedAt IS NULL")
        .andWhere("event.failedAt IS NULL")
        .andWhere("event.nextAttemptAt <= :now", {
          now: new Date(),
        })
        .andWhere(
          `(event.lockedAt IS NULL OR event.lockedAt < :lockExpiredAt)`,
          {
            lockExpiredAt: new Date(Date.now() - 5 * 60 * 1000),
          },
        )
        .orderBy("event.createdAt", "ASC")
        .take(10)
        .getMany();
      if (events.length === 0) {
        return [];
      }
      const now = new Date();
      for (const event of events) {
        event.lockedAt = now;
        event.lockedBy = this.workerId;
      }
      await repository.save(events);
      return events;
    });
  }

  private async processEvent(event: OutboxEvent): Promise<void> {
    const isOwner = event.lockedBy === this.workerId;

    if (!isOwner) {
      return;
    }

    try {
      await this.handleEvent(event.eventName, event.payload);

      event.processedAt = new Date();
      event.lockedAt = null;
      event.lockedBy = null;
      event.lastError = null;

      await outboxEventRepository.save(event);
    } catch (error) {
      await this.handleFailure(event, error);
    }
  }

  private async handleEvent(
    eventName: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const handler = this.handlers.get(eventName);
    if (!handler) {
      throw new Error(`Unknown event: ${eventName}`);
    }

    await handler.handle(payload);
  }

  private async handleFailure(
    event: OutboxEvent,
    error: unknown,
  ): Promise<void> {
    event.attempts += 1;

    event.lastError =
      error instanceof Error ? error.message : "Unknown event processing error";

    event.lockedAt = null;
    event.lockedBy = null;

    if (event.attempts >= event.maxAttempts) {
      event.failedAt = new Date();

      await outboxEventRepository.save(event);

      return;
    }

    const delay = Math.min(1000 * 2 ** (event.attempts - 1), 60_000);

    event.nextAttemptAt = new Date(Date.now() + delay);

    await outboxEventRepository.save(event);
  }
}

// export const outboxEventProcessor = new OutboxEventProcessor();

export const createOutboxEventProcessor = (
  handlers: Map<string, OutboxEventHandler>,
): OutboxEventProcessor => {
  return new OutboxEventProcessor(handlers);
};
