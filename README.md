# Multi-Tenant SaaS Project Management System

A **multi-tenant SaaS** project management platform where many companies use the same application while each company's data stays fully isolated. Every company manages its own **people, teams, projects, and phase-based deliverables** under a clear role hierarchy: **Owner → HR → Supervisor → Leader → Employee**.

> **Repository status:** this README describes the full target product. The current code in `src/` is a starter scaffold (Express + TypeORM) covering authentication, organization, project, and generic task endpoints. The domain described below (HR/Supervisor/Leader/Employee roles, Teams, Phases, delivery approvals) is the planned build-out — see [Roadmap](#roadmap).

---

## Table of contents

- [1. Roles & hierarchy](#1-roles--hierarchy)
- [2. Feature list](#2-feature-list)
- [3. Account & onboarding flow](#3-account--onboarding-flow)
- [4. Data model](#4-data-model)
- [5. Phase delivery workflow](#5-phase-delivery-workflow)
- [6. Multi-tenancy & security](#6-multi-tenancy--security)
- [7. API overview](#7-api-overview)
- [8. Tech stack & architecture](#8-tech-stack--architecture)
- [9. Getting started](#9-getting-started)
- [10. Roadmap](#10-roadmap)

---

## 1. Roles & hierarchy

There is **no public self-signup** for company staff. Every account inside a company is provisioned by a higher role. Permissions are **strict per role**: a role can only perform the actions explicitly granted to it below.

```
┌─────────────────────────────────────────────┐
│  OWNER   (creates the company at sign-up)   │
│   └── adds HR accounts                      │
│        └── HR adds Supervisor accounts      │
│             └── Supervisor creates Teams,   │
│                 adds Leaders & Employees    │
│                  └── Leader leads a Team,   │
│                      manages Employees,     │
│                      runs Projects/Phases   │
│                       └── Employee executes │
│                           assigned Phases   │
└─────────────────────────────────────────────┘
```

| Role | Responsibility summary |
|------|------------------------|
| **Owner** | Registers the company (tenant) and becomes its owner. Manages organization profile and adds **HR** accounts. |
| **HR** | Adds **Supervisor** accounts for the company. |
| **Supervisor** | Creates **Teams**; adds **Leader** and **Employee** accounts; assigns Leaders/Employees to Teams. |
| **Leader** | Leads one or more Teams: adds/removes Employees in their Teams, creates Projects with multiple Phases, manages Project & Phase status, assigns Employees **or themselves** to Phases, approves/rejects Phase delivery. |
| **Employee** | Works on Phases they are assigned to: updates progress, adds notes, marks a Phase as delivered for Leader approval. |

---

## 2. Feature list

### 2.1 Owner
- Creates a company account (registers as **Owner** and creates the tenant/organization in one step).
- Edits organization name / slug / plan.
- Adds **HR** users (name, email, temporary password).
- Removes or deactivates HR accounts.
- Views the whole company structure (teams, supervisors, projects) **read-only**.

### 2.2 HR
- Adds **Supervisor** accounts (name, email, temporary password).
- Removes or deactivates Supervisors.
- Views the company structure read-only.

### 2.3 Supervisor
- Creates **Teams** (name, description).
- Adds **Leader** and **Employee** accounts to the company.
- Assigns Leaders and Employees to Teams (a Team can have one or more Leaders; Employees can belong to one or more Teams).
- Removes Leaders/Employees from Teams.
- Deactivates Leader/Employee accounts.
- Views all Teams, Projects, and Phases **read-only** (including progress and notes).

### 2.4 Leader
- Adds Employees to the Teams they lead.
- Removes Employees from the Teams they lead.
- Creates **Projects**, each with **multiple Phases**.
- Updates **Project status**.
- Removes an entire Project (cascades to its Phases).
- Deletes a single Phase from a Project.
- Updates a **Phase status**.
- Assigns **one or multiple Employees** — including **themselves** — to a Phase.
- Approves or rejects an Employee's "delivered" request on a Phase.
- Sets the Phase **deadline**.

### 2.5 Employee
- Updates **progress** (0–100%) of Phases they are assigned to.
- Adds **multiple notes** to an assigned Phase (e.g. blockers, updates).
- Marks a Phase as **delivered** — delivery is only final once the Leader approves it.
- Sees their own assigned Phases and deadlines.

### 2.6 Designations (skill profiles)

Every **Leader** and **Employee** account is provisioned with a **designation** describing their craft. Where a designation has specializations, a `techStack` is required as well:

| Designation | `techStack` options |
|---|---|
| `ai_developer` | — |
| `backend_developer` | `python` or `nodejs` |
| `frontend_developer` | — |
| `app_developer` | `flutter` or `react_native` |
| `devops_developer` | — |

Designations let Supervisors and Leaders pick the right people when assigning Phases (e.g. filter for `backend_developer` with `nodejs`).

### 2.7 Cross-cutting
- Every **Phase has a deadline** with overdue highlighting and notifications.
- Delivery of a Phase requires **two parties**: the Employee marks delivered → the Leader approves (or rejects with a note).
- Full audit trail of Phase status changes, progress updates, delivery requests, and approvals.
- Strict **tenant isolation**: users only ever see their own company's data.

---

## 3. Account & onboarding flow

1. A company owner signs up → `POST /api/auth/register` creates the **Organization** (tenant) and the first user with role `owner`.
2. The Owner creates **HR** accounts.
3. HR creates **Supervisor** accounts.
4. Supervisors create **Teams** and add **Leader** / **Employee** accounts — each with a **designation** (AI, backend, frontend, app, or DevOps developer) — and assign them to Teams.
5. Leaders additionally manage Employee membership of their Teams and run Projects.
6. Everyone else logs in with the account their manager provisioned.

Newly provisioned staff receive a temporary password that should be changed on first login (force-password-change flag).

---

## 4. Data model

```
organizations ───┬──< users            (role: owner | hr | supervisor | leader | employee)
                 ├──< teams
                 ├──< projects ──< phases ──< phase_notes
                 │                       └──< phase_assignments >── users (M:N)
                 └──< projects.created_by (leader)
teams ──< team_members >── users  (role_in_team: leader | employee)
```

### Core entities

| Entity | Key fields | Notes |
|--------|-----------|-------|
| `organizations` | `id`, `name`, `slug`, `plan` | The tenant. One per company. |
| `users` | `id`, `name`, `email`, `passwordHash`, `role`, `designation`, `techStack`, `organizationId`, `mustChangePassword` | Role enum: `owner \| hr \| supervisor \| leader \| employee`; designation & techStack per [2.6](#26-designations-skill-profiles). |
| `teams` | `id`, `name`, `description`, `organizationId` | Created by Supervisors. |
| `team_members` | `teamId`, `userId`, `roleInTeam` (`leader \| employee`) | Join table: which Leaders/Employees belong to which Team. |
| `projects` | `id`, `name`, `description`, `status`, `createdById`, `organizationId` | Status: `draft \| active \| on_hold \| completed \| cancelled`. |
| `phases` | `id`, `projectId`, `name`, `description`, `deadline`, `status`, `progress` (0–100), `createdById` | Status lifecycle in [section 5](#5-phase-delivery-workflow). |
| `phase_assignments` | `phaseId`, `userId` | M:N — a Phase can have one or multiple Employees, plus optionally the Leader themselves (self-assignment). |
| `phase_notes` | `id`, `phaseId`, `authorId`, `content`, `createdAt` | Employees add multiple notes per Phase. |
| `phase_deliveries` | `id`, `phaseId`, `requestedById`, `approvedById`, `status` (`approved \| rejected`), `note`, `timestamps` | Audit trail for the approve/reject flow. |

All tenant-owned tables store `organization_id` (directly or via parent) so every query can be scoped to the authenticated user's tenant.

`users.designation` holds the Leader/Employee skill (`ai_developer`, `backend_developer`, `frontend_developer`, `app_developer`, `devops_developer`); `users.techStack` holds the specialization where applicable (`python`/`nodejs` for backend, `flutter`/`react_native` for app).

---

## 5. Phase delivery workflow

Each Phase moves through these statuses:

```
not_started ──▶ in_progress ──▶ pending_approval ──▶ delivered
                                    │    ▲
                                    │    │  (Leader rejects with note)
                                    └────┘
                                back to in_progress
```

1. A Leader creates a Project and adds Phases, each with a **deadline** and initial status `not_started`.
2. The Leader assigns **one or multiple Employees** — including **themselves** if they want to work on it — to a Phase.
3. Assigned Employees update the Phase **progress** and add **notes** as they work.
4. When an Employee finishes, they mark the Phase **delivered** → status becomes `pending_approval`.
5. The Leader must also confirm:
   - **Approve** → status becomes `delivered` (final). ✅
   - **Reject** (optional note) → status returns to `in_progress` so the Employee can keep working. 🔁
6. Every transition is recorded in `phase_deliveries` for a full audit trail.

---

## 6. Multi-tenancy & security

- **Tenant scoping:** every authenticated request carries `organizationId` (from the JWT); all service queries filter by it. Cross-tenant reads/writes are impossible at the query layer.
- **JWT auth:** access + refresh tokens; role and `organizationId` embedded in the payload for cheap authorization checks.
- **Role guard middleware:** each route declares the roles allowed (e.g. `owner` for adding HR, `leader`/`supervisor` for Project writes, `employee`+ for progress updates).
- **Ownership checks beyond role:** a Leader can only manage Teams they actually lead; an Employee can only update Phases they are assigned to.
- **Passwords:** bcrypt-hashed; temporary passwords flagged for change on first login.
- **Input validation:** Zod schemas on every mutating endpoint.

---

## 7. API overview

| Area | Endpoints (planned) | Allowed roles |
|------|--------------------|---------------|
| Auth | `POST /auth/register` (create company + owner), `POST /auth/login`, `POST /auth/refresh` | public |
| Organization | `GET /organizations`, `PATCH /organizations` | owner |
| Users | `POST /users/hr`, `GET/DELETE /users/hr/:id` | owner |
| Users | `POST /users/supervisors`, `GET/DELETE /users/supervisors/:id` | hr |
| Users | `POST /users/leaders`, `POST /users/employees`, deactivate | supervisor (employees also by leader) |
| Teams | `POST /teams`, `GET /teams`, `PATCH/DELETE /teams/:id` | supervisor |
| Teams | `POST /teams/:id/members`, `DELETE /teams/:id/members/:userId` | supervisor, leader (own team) |
| Projects | `GET /projects`, `POST /projects` (with phases), `PATCH /projects/:id` (status), `DELETE /projects/:id` | leader+ (read: all roles) |
| Phases | `POST /projects/:id/phases`, `PATCH /phases/:id` (status/deadline), `DELETE /phases/:id` | leader |
| Phases | `POST /phases/:id/assignees` (one or many; leader may include self) | leader |
| Phases | `PATCH /phases/:id/progress`, `POST /phases/:id/notes` | assigned employee |
| Phases | `POST /phases/:id/deliver` (mark delivered) | assigned employee |
| Phases | `POST /phases/:id/approve`, `POST /phases/:id/reject` | leader |

---

## 8. Tech stack & architecture

### 8.1 Tech stack

- **Runtime:** Node.js + TypeScript (ESM)
- **API:** Express 5
- **Database:** PostgreSQL via TypeORM (decorator entities)
- **Auth:** JWT (access + refresh), bcrypt password hashing
- **Validation:** Zod
- **Hardening / ops:** Helmet, CORS, Pino logging

### 8.2 True modular monolith — fully independent modules

The project is built as a **true modular monolith**: one deployable service and one database — all the operational simplicity of a monolith — while the code is organized into **fully independent modules**. Each module is a self-contained vertical slice of the product: it owns its routes, business logic, entities, repositories, and validation, and **never imports another module**.

```
src/
├── modules/
│   ├── auth/        # tenant + owner registration, login / refresh (JWT)
│   ├── directory/   # staff provisioning: Owner→HR, HR→Supervisor, designations
│   ├── teams/       # teams & team membership (leaders / employees)
│   ├── projects/    # projects, phases, phase assignments, deadlines
│   └── delivery/    # progress updates, notes, deliver → approve / reject
├── contracts/       # plain interfaces, DTOs & event types (types only, no logic)
├── shared/          # plumbing only: config, logger, error helpers, tenant/auth middleware
└── app.ts           # composition root: mounts routers, wires the event bus
```

Every module is a self-contained folder:

```
src/modules/<name>/
├── routes/          # HTTP layer — one router, exported for the composition root
├── services/        # business logic
├── entities/        # TypeORM entities (this module's tables only)
├── repositories/    # data access
├── schemas/         # Zod validation
├── events/          # events this module publishes / subscribes to
└── index.ts         # module manifest — what the composition root mounts
```

Independence rules:

- **Zero cross-module imports** — code inside `modules/<name>/` may import only from its own folder and from `shared/` plumbing. Importing another module — even its public entry point — is forbidden, enforced by convention today and by import linting later.
- **No shared state and no direct calls** — modules communicate only through **domain events** (event shapes defined in `contracts/`) carried by an in-process event bus that the composition root wires. A module never calls another module's functions, services, or repositories, and never reads another module's tables.
- **Table ownership** — each module creates and touches only its own tables; cross-module SQL does not exist.
- **`shared/` = plumbing only** — config, logger, error helpers, tenant/auth middleware. No business logic may live there.
- **`contracts/` = types only** — plain interfaces, DTOs, and event shapes shared by modules; no implementation may live there.
- **Composition root** — `app.ts` is the only file that knows about all modules: it mounts their routers, initializes the event bus, and subscribes each module to the events it declared. No module imports `app.ts`.
- **Independently developed, tested, and extracted** — because every module is self-contained with inward-only dependencies, it can be built and unit-tested on its own and later lifted out of the monolith into its own service (even its own database) without touching the other modules.

The starter scaffold's flat `src/` (config / entities / middleware / routes / services) is the stepping stone; the build-out reorganizes it into `modules/` + `contracts/` + `shared/`.

---

## 9. Getting started

```bash
npm install

# 1. Configure environment (copy example)
cp .env.example .env
# 2. Edit .env: DATABASE_* credentials, JWT_SECRET, PORT

# 3. Run in development (auto-creates tables via synchronize)
npm run dev

# 4. Build & run in production
npm run build
npm start
```

Health check: `GET http://localhost:3000/health`.

---

## 10. Roadmap

- [ ] Extend `users.role` to `owner | hr | supervisor | leader | employee` and provision endpoints (Owner→HR, HR→Supervisor, Supervisor→Leader/Employee)
- [ ] `teams` + `team_members` entities with supervisor/leader membership management
- [ ] Rework `projects` → owned by Leaders with status enum `draft | active | on_hold | completed | cancelled`
- [ ] Add `phases` (deadline, status lifecycle, progress), `phase_assignments`, `phase_notes`, `phase_deliveries`
- [ ] Replace generic tasks with the Phase delivery workflow (employee delivers → leader approves/rejects)
- [ ] Role guard middleware + strict per-role route protection with tenant scoping
- [ ] Add `designation` (`ai_developer`, `backend_developer`, `frontend_developer`, `app_developer`, `devops_developer`) + `techStack` (`python`/`nodejs`, `flutter`/`react_native`) on `users`, required when provisioning Leaders/Employees
- [ ] Allow a Leader to **self-assign** to a Phase via the same assignees endpoint
- [ ] Force password change on first login for provisioned staff
- [ ] Overdue-deadline notifications & dashboard per role
- [ ] Audit log / activity feed for project & phase events
- [ ] Reorganize the flat `src/` scaffold into the modular-monolith layout (`modules/` + `contracts/` + `shared/`) with hard independence rules (no cross-module imports, event-based communication)
