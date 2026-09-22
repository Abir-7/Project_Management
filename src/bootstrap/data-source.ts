import { createDataSource } from "../shared/database/data-source.js";

import { identityEntities } from "../modules/identity/index.js";
import { OutboxEvent } from "../shared/events/outbox/outbox-event.entity.js";
import { billingEntities } from "../modules/billing/index.js";

export const AppDataSource = createDataSource([
  ...identityEntities,
  OutboxEvent,
  ...billingEntities,
]);
