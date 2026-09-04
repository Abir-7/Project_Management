# Folder Structure

This project is a **modular monolith**: one deployable service, but the code is split into fully independent vertical-slice modules. Each module owns its routes, business logic, entities, repositories, schemas, and events — and never imports another module. Modules communicate only through domain events; the composition root (`src/app.ts`) wires everything together.

```
src/
├── app.ts                          # Composition root — mounts all module routers,
│                                   #   initializes the event bus, subscribes modules
├── server.ts                       # Bootstrap — starts the HTTP server
│
├── modules/                        # Independent vertical slices (no cross-module imports)
│   ├── auth/                       # Tenant + owner registration, login / refresh (JWT)
│   │   ├── routes/                 #   auth.routes.ts — HTTP layer
│   │   ├── services/               #   auth.service.ts — business logic
│   │   ├── entities/               #   user.entity.ts — TypeORM entity
│   │   ├── repositories/           #   user.repository.ts — data access
│   │   ├── schemas/                #   login.schema.ts, register.schema.ts — Zod validation
│   │   ├── events/                 #   auth.publisher.ts, auth.subscriber.ts
│   │   └── index.ts                #   Module manifest for the composition root
│   │
│   ├── directory/                  # Staff provisioning: Owner→HR, HR→Supervisor,
│   │   │                           #   Supervisor→Leader/Employee, designations
│   │   ├── routes/                 #   hr.routes.ts, supervisor.routes.ts,
│   │   │                           #   leader.routes.ts, employee.routes.ts
│   │   ├── services/               #   One service per role (hr, supervisor, leader, employee)
│   │   ├── entities/               #   user.entity.ts (provisioning view)
│   │   ├── repositories/           #   user.repository.ts
│   │   ├── schemas/                #   create-hr / create-supervisor / create-leader /
│   │   │                           #   create-employee schemas
│   │   ├── events/                 #   directory.publisher.ts, directory.subscriber.ts
│   │   └── index.ts
│   │
│   ├── teams/                      # Teams & team membership (leaders / employees)
│   │   ├── routes/                 #   team.routes.ts
│   │   ├── services/               #   team.service.ts
│   │   ├── entities/               #   team.entity.ts, team-member.entity.ts
│   │   ├── repositories/           #   team.repository.ts
│   │   ├── schemas/                #   create-team, update-team, add-member schemas
│   │   ├── events/                 #   team.publisher.ts, team.subscriber.ts
│   │   └── index.ts
│   │
│   ├── projects/                   # Projects, phases, phase assignments, deadlines
│   │   ├── routes/                 #   project.routes.ts, phase.routes.ts
│   │   ├── services/               #   project.service.ts, phase.service.ts
│   │   ├── entities/               #   project.entity.ts, phase.entity.ts,
│   │   │                           #   phase-assignment.entity.ts
│   │   ├── repositories/           #   project.repository.ts, phase.repository.ts
│   │   ├── schemas/                #   create/update project, create/update phase,
│   │   │                           #   assign-phase, update-phase-status schemas
│   │   ├── events/                 #   project.publisher.ts, project.subscriber.ts
│   │   └── index.ts
│   │
│   └── delivery/                   # Progress updates, notes, deliver → approve / reject
│       ├── routes/                 #   delivery.routes.ts
│       ├── services/               #   delivery.service.ts
│       ├── entities/               #   phase-delivery.entity.ts, phase-note.entity.ts
│       ├── repositories/           #   phase-delivery.repository.ts, phase-note.repository.ts
│       ├── schemas/                #   update-progress, add-note, deliver-phase,
│       │                           #   approve-phase, reject-phase schemas
│       ├── events/                 #   delivery.publisher.ts, delivery.subscriber.ts
│       └── index.ts
│
├── contracts/                      # Types only — no implementation allowed
│   ├── dto/                        # Request/response DTOs, grouped by module
│   │   ├── auth/                   #   login, register, token
│   │   ├── directory/              #   create-hr/supervisor/leader/employee, provision response
│   │   ├── teams/                  #   create-team, update-team, add-member, team response
│   │   ├── projects/               #   create/update project, create/update phase,
│   │   │                           #   assign-phase, project response
│   │   └── delivery/               #   update-progress, add-note, deliver/approve/reject
│   ├── entities/                   # TypeORM entity classes (shared table definitions)
│   │                               #   organization, user, team, team-member, project,
│   │                               #   phase, phase-assignment, phase-note, phase-delivery
│   ├── enums/                      # role, team-role, designation, tech-stack,
│   │                               #   project-status, phase-status, delivery-status
│   ├── events/                     # Domain event shapes (base + per-module)
│   │                               #   base.event.ts, auth/team/project/phase/delivery events
│   ├── common/                     # api-response.dto, pagination.dto, user-context
│   └── index.ts
│
└── shared/                         # Plumbing only — no business logic allowed
    ├── config/                     # env.ts (env parsing), database.config.ts
    ├── database/                   # TypeORM data source setup
    ├── errors/                     # app-error.ts, error.handler.ts
    ├── events/                     # bus.ts — in-process event bus, event types
    ├── logger/                     # logger setup, request.logger.ts (Pino)
    ├── middleware/                 # auth.middleware.ts (JWT), role.guard.ts,
    │                               #   tenant.middleware.ts, validate.middleware.ts
    ├── types/                      # express.d.ts (request augmentation), index.ts
    └── utils/                      # id.ts, jwt.ts, password.ts (bcrypt)
```

## The standard module layout

Every module follows the same shape:

```
src/modules/<name>/
├── routes/          # HTTP layer — one or more routers, exported for the composition root
├── services/        # Business logic
├── entities/        # TypeORM entities (this module's tables only)
├── repositories/    # Data access
├── schemas/         # Zod validation
├── events/          # Events this module publishes / subscribes to
└── index.ts         # Module manifest — what the composition root mounts
```

## Independence rules

- **Zero cross-module imports** — `modules/<name>/` may import only from its own folder and from `shared/` plumbing.
- **Event-based communication** — modules never call each other's functions; they publish/subscribe to domain events (shapes defined in `contracts/events/`) through the in-process bus in `shared/events/bus.ts`.
- **Table ownership** — each module creates and touches only its own tables.
- **`shared/` = plumbing only** — config, logger, errors, middleware, utils. No business logic.
- **`contracts/` = types only** — DTOs, entities, enums, event shapes. No implementation.
- **`app.ts` is the only file that knows all modules** — it mounts routers and wires the event bus.

## Top-level files

```
├── package.json        # Express 5, TypeScript, TypeORM
├── README.md           # Full product spec, architecture, and roadmap
├── folder_stucker.md   # This file
└── .git/
```