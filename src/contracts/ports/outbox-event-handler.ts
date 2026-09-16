export interface OutboxEventHandler {
  handle(payload: Record<string, unknown>): Promise<void>;
}
