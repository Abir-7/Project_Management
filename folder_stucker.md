# Folder Structure

This project is a **modular monolith**: one deployable service and one database, but the code is split into fully independent vertical-slice modules. Each module owns its routes, business logic, entities, repositories, schemas, and events — and never imports another module. Modules communicate only through domain events; the composition root (`src/app.ts`) wires everything together.

Module boundaries are defined by **table ownership**, not by feature names: a module is the only code that creates and touches its tables. Applying that rule collapses the old feature-based split into three modules:

- `identity` — owns `organizations` + `users`. Registration (company + owner), login / refresh, org profile, and staff provisioning (Owner → HR → Supervisor → Leader/Employee) all read and write these two tables, so they cannot be separate modules. JWT signing/verification has no tables of its own, so it is plumbing (`shared/middleware`), not a module.
- `teams` — owns `teams` + `team_members`.
- `projects` — owns the full phase lifecycle: `projects`, `phases`, `phase_assignments`, `phase_notes`, `phase_deliveries`. Project CRUD, progress updates, notes, and the deliver → approve/reject workflow all mutate these tables, so they live in one module.

Future modules (e.g. notifications, audit/activity feed) can be added as event subscribers that own their own tables — no existing module needs to change.

```
src/
├── app.ts                          # Composition root — imports every module manifest, mounts
│                                   #   routers, registers module entities with the DataSource,
│                                   #   initializes the event bus, subscribes modules
├── server.ts                       # Bootstrap — starts the HTTP server
│
├── modules/                        # Independent vertical slices (no cross-module imports)
│   ├── identity/                   # Organization & staff accounts: tenant+owner registration,
│   │   │                           #   login / refresh (JWT), provisioning (Owner→HR→Supervisor→
│   │   │                           #   Leader/Employee), designations / techStack, org profile
│   │   ├── routes/                 #   auth.routes.ts (register/login/refresh), org.routes.ts,
│   │   │                           #   provisioning.routes.ts (hr / supervisor / leader / employee)
│   │   ├── services/               #   auth.service.ts, org.service.ts, provisioning.service.ts
│   │   ├── entities/               #   organization.entity.ts, user.entity.ts
│   │   ├── repositories/           #   organization.repository.ts, user.repository.ts
│   │   ├── schemas/                #   register, login, refresh, create-hr / create-supervisor /
│   │   │                           #   create-leader / create-employee, update-org schemas
│   │   ├── events/                 #   identity.publisher.ts, identity.subscriber.ts
│   │   └── index.ts                #   Module manifest — exports router + entities
│   │
│   ├── teams/                      # Teams & team membership (leaders / employees)
│   │   ├── routes/                 #   team.routes.ts
│   │   ├── services/               #   team.service.ts
│   │   ├── entities/               #   team.entity.ts, team-member.entity.ts
│   │   ├── repositories/           #   team.repository.ts
│   │   ├── schemas/                #   create-team, update-team, add-member schemas
│   │   ├── events/                 #   team.publisher.ts, team.subscriber.ts
│   │   └── index.ts                #   Module manifest — exports router + entities
│   │
│   └── projects/                   # Full phase lifecycle: projects, phases, assignments,
│       │                           #   deadlines, notes, progress, deliver → approve / reject
│       ├── routes/                 #   project.routes.ts, phase.routes.ts, delivery.routes.ts
│       ├── services/               #   project.service.ts, phase.service.ts, delivery.service.ts
│       ├── entities/               #   project.entity.ts, phase.entity.ts,
│       │                           #   phase-assignment.entity.ts, phase-note.entity.ts,
│       │                           #   phase-delivery.entity.ts
│       ├── repositories/           #   project.repository.ts, phase.repository.ts,
│       │                           #   phase-delivery.repository.ts, phase-note.repository.ts
│       ├── schemas/                #   create/update project & phase, assign-phase,
│       │                           #   update-progress, add-note, deliver / approve / reject schemas
│       ├── events/                 #   project.publisher.ts, project.subscriber.ts
│       └── index.ts                #   Module manifest — exports router + entities
│
├── contracts/                      # Types only — no implementation allowed
│   ├── dto/                        # Request/response DTOs, grouped by module
│   │   ├── identity/               #   register, login, token, provision, org profile
│   │   ├── teams/                  #   create-team, update-team, add-member, team response
│   │   └── projects/               #   project / phase / delivery DTOs
│   ├── enums/                      # role, team-role, designation, tech-stack,
│   │                               #   project-status, phase-status, delivery-status
│   ├── events/                     # Domain event payloads (base + per module):
│   │                               #   organization-registered, user-provisioned,
│   │                               #   team-membership-changed, phase-assigned,
│   │                               #   delivery-requested, delivery-decided, ...
│   ├── common/                     # api-response.dto, pagination.dto, user-context
│   └── index.ts
│
└── shared/                         # Plumbing only — no business logic allowed
    ├── config/                     # env.ts (env parsing)
    ├── database/                   # TypeORM data source setup + register-entities helper
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
└── index.ts         # Module manifest — exports the router and the entity classes
```

## Independence rules

- **Zero cross-module imports** — `modules/<name>/` may import only from its own folder, from `contracts/` (types), and from `shared/` plumbing. Importing another module — even its public entry point — is forbidden, enforced by convention today and by import linting later.
- **Event-based communication** — modules never call each other's functions; they publish/subscribe to domain events (payload shapes defined in `contracts/events/`) through the in-process bus in `shared/events/bus.ts`.
- **Table ownership** — each module creates and touches only its own tables. Cross-module SQL does not exist.
- **Cross-module references are scalar columns only** — e.g. `team_members.user_id` or `phase_assignments.user_id` store plain ids. A module never declares a TypeORM relation to — or joins — another module's table (that would require importing its entity). Referential integrity is enforced by database foreign keys. If a screen needs display fields owned by another module (say a user's name next to a team member), the consuming module keeps a small event-fed read model of just the fields it needs.
- **`contracts/` = types only** — DTOs, enums, and event payloads. TypeORM entity classes are implementation, so they live in the module that owns the table, never in `contracts/`.
- **`shared/` = plumbing only** — config, logger, errors, middleware, utils, event bus. No business logic.
- **Entity registration stays out of `shared/`** — `shared/database` exposes a `register-entities` helper but never imports module code. Each module manifest (`index.ts`) exports its entity classes; `app.ts` collects them and registers them with the DataSource before bootstrap.
- **`app.ts` is the only file that knows all modules** — it imports the manifests, mounts routers, registers entities, and wires the event bus. No module imports `app.ts`.

## Top-level files

```
├── package.json        # Express 5, TypeScript, TypeORM
├── README.md           # Full product spec, architecture, and roadmap
├── folder_stucker.md   # This file
└── .git/
```
