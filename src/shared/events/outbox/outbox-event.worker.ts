import type { OutboxEventProcessor } from "./outbox-event.processor.js";

class OutboxEventWorker {
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(private readonly processor: OutboxEventProcessor) {}

  start(): void {
    if (this.interval) {
      return;
    }

    this.interval = setInterval(() => {
      void this.run();
    }, 5_000);

    void this.run();
  }

  stop(): void {
    if (!this.interval) {
      return;
    }

    clearInterval(this.interval);
    this.interval = null;
  }

  private async run(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    try {
      await this.processor.process();
    } catch (error) {
      console.error("Outbox worker failed:", error);
    } finally {
      this.isRunning = false;
    }
  }
}

export const createOutboxEventWorker = (
  processor: OutboxEventProcessor,
): OutboxEventWorker => {
  return new OutboxEventWorker(processor);
};
