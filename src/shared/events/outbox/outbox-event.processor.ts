import { outboxEventRepository } from "./outbox-event.repository.js";
import { userRegisteredHandler } from "../../../modules/identity/events/user-registered.handler.js";
import { IDENTITY_EVENTS } from "../../../modules/identity/events/identity.events.js";
import { OutboxEvent } from "./outbox-event.entity.js";

class OutboxEventProcessor {
  async process(): Promise<void> {
    const events = await outboxEventRepository.manager.transaction(
      async (manager) => {
        return manager
          .getRepository(OutboxEvent)
          .createQueryBuilder("event")
          .setLock("pessimistic_write")
          .setOnLocked("skip_locked")
          .where("event.processedAt IS NULL")
          .andWhere("event.failedAt IS NULL")
          .andWhere("event.nextAttemptAt <= :now", {
            now: new Date(),
          })
          .orderBy("event.createdAt", "ASC")
          .take(10)
          .getMany();
      },
    );

    for (const event of events) {
      await this.processEvent(event.id);
    }
  }

  private async processEvent(eventId: string): Promise<void> {
    const event = await outboxEventRepository.findOne({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      return;
    }

    if (event.processedAt || event.failedAt) {
      return;
    }

    try {
      await this.handleEvent(event.eventName, event.payload);

      event.processedAt = new Date();

      await outboxEventRepository.save(event);
    } catch (error) {
      await this.handleFailure(event, error);
    }
  }

  private async handleEvent(
    eventName: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    switch (eventName) {
      case IDENTITY_EVENTS.USER_REGISTERED:
        await userRegisteredHandler.handle(payload);
        return;

      default:
        throw new Error(`Unknown event: ${eventName}`);
    }
  }

  private async handleFailure(
    event: {
      id: string;
      attempts: number;
      maxAttempts: number;
      nextAttemptAt: Date;
      failedAt: Date | null;
      lastError: string | null;
    },
    error: unknown,
  ): Promise<void> {
    event.attempts += 1;

    event.lastError =
      error instanceof Error ? error.message : "Unknown event processing error";

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

export const outboxEventProcessor = new OutboxEventProcessor();
