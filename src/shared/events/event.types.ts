export interface DomainEvent<TPayload = unknown> {
  id: string;
  name: string;
  payload: TPayload;
  occurredAt: Date;
}
