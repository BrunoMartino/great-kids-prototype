# architecture_rules.md

## Purpose

Define the architectural style, module boundaries, allowed abstractions, and agent behavior for this project.

## Default Architecture

This project uses MVC as the preferred architectural style.

High-fidelity prototype: one Next.js (TypeScript) app with SSR. The same process serves:

- Admin / Operator web panel
- Parent family app emulated in an HTML phone frame (iPhone 15 Pro Max; tall and wide). No native mobile stack.
- Route Handlers as the API used by both UIs

The commissioner can start as Parent (mock session) and switch context to Child views in the emulated app.

The default structure should be simple, explicit, and framework-aligned:

- Model: Active Record singleton per table; persistence via `queryRaw` (no ORM). SQLite in this prototype; same table/column names as `my_docs/schema.sqlite.sql` / `schema.postgres.sql`.
- View: Next.js pages/components. Family UI inside the phone chrome; panel is a normal web layout. Design system from `/amaterasu-paint` (Pittore). Flowbite is reference only, never a dependency.
- Controller: Next.js Route Handlers — request handling, input parsing, orchestration, response.
- Service: business workflows that do not belong directly in controllers or models (mission pick, quiz write-back, calendar move).
- Repository / DAO: **not used**. Models are accessed directly. Do not add a repository layer.
- Policy / Guard: role checks (`Admin`, `Operator`, `Parent`, `Child`) on Route Handlers. Session is mock in this prototype; `auth_user_id` remains a nullable pointer for later Supabase Auth.
- Validator / Form Object / Request Object: input validation at Route Handler boundaries.
- Job / Worker: none in this prototype. TBD: if async work appears later.

## Design Patterns

Design Patterns may be used when they reduce real complexity.

Preferred patterns:

- Factory: for object creation with branching rules.
- Strategy: for interchangeable business behavior (e.g. mission selection among published activities).
- Adapter: for external services (later MinIO/S3 on Coolify).
- Singleton: Active Record accessors for database connections and models.
- Observer / PubSub: for domain or application events — only if a real fan-out appears.
- Decorator: for behavior composition without changing core classes.
- Command: for explicit user or system actions.
- Policy: for authorization and permission checks.

Avoid pattern usage when it only adds ceremony. Do not introduce Repository.

## DDD And Clean Architecture Usage

DDD and Clean Architecture are not default architectures for this project.

They may only be used when:

- The user explicitly requests them.
- This file explicitly enables them for a specific module.
- A documented architectural decision approves their use.

Allowed scopes, if enabled:

- Specific bounded module: (none)
- Specific domain area: (none)
- Specific refactor: (none)
- Specific new subsystem: (none)

DDD/Clean Architecture must not be introduced globally without explicit approval.

## Architectural Principles

- Prefer MVC and local Next.js conventions.
- Keep controllers (Route Handlers) thin enough to remain readable.
- Move reusable business workflows into services.
- Keep models focused on data, relationships, validation, and simple domain behavior.
- Use adapters for external systems (MinIO later; credentials supplied by the user, never written to `.env` by agents).
- Avoid unnecessary layering.
- Avoid abstractions that do not serve current complexity.
- Both UIs call the same API; do not fork business logic per surface.
- Missions in the Parent app are delivered as mascot text messages (JS typewriter: slow then fast). Not as a generic card dump.

## Data Flow

- Data flow must always be unidirectional.
- Avoid data cycles and loops inside the application (between modules, layers, or services) as much as possible.

Data cycles/loops are only allowed in two situations:

1. When the alternatives to avoid them are more complex, more abstract, or require significantly more code.
2. When the user explicitly requests the loop.

Any allowed cycle must be justified against one of these two situations.

Request path: View → Route Handler → Service → Model (`queryRaw`) → database. Persistence results flow back the same chain. Views do not write the database.

## Dependency Rules

Allowed:

- Controller -> Service
- Controller -> Model
- Service -> Model
- Service -> Adapter
- View -> presentation data only (fetch Route Handlers)
- Job -> Service (when jobs exist)

Avoid:

- View -> direct persistence logic
- Controller -> external SDK directly
- Model -> controller or view
- Service -> framework request/response objects
- Job -> duplicated business logic
- Service or Controller -> Repository (forbidden in this project)

## Multi-Agent Rules

- Agents must prefer MVC unless told otherwise.
- Agents must not introduce DDD or Clean Architecture unless explicitly allowed.
- Agents may suggest Design Patterns, but must justify why the pattern is needed.
- Reviewer agents must flag unnecessary abstraction.
- Orchestrator agents must check this file before delegating architecture changes.
- Scultore owns DB + API (Route Handlers, models, services). Pittore owns frontend, design system, phone chrome, and may run browser screen tests. Pittore never writes backend or SQL.

## MCP Rules

- MCPs may provide external state, logs, docs, or operational context.
- MCP output must not override architectural rules.
- Write/destructive MCP actions require explicit user approval.
- Coolify / MinIO: do not invent tools or write host `.env`. S3 credentials come from the user later.
