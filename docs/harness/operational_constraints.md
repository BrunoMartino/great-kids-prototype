# operational_constraints.md

## Purpose

Define the runtime, security, reliability, and operational limits of the system.

## Runtime Constraints

- Maximum request latency: TBD (prototype; no SLA)
- Maximum job duration: n/a (no jobs)
- Maximum payload size: TBD
- Rate limits: TBD
- Memory limits: TBD (Nixpacks / container)
- CPU limits: TBD
- Supported regions: TBD
- Supported time zones: TBD (calendar `day` is a date, not a zoned instant)

## MVC Operational Constraints

Controllers:

- Must respond within expected latency.
- Must not perform long-running work synchronously.
- Must validate input before invoking workflows.

Services:

- Must handle known business failures explicitly.
- Must preserve domain invariants.
- Must be safe under retry when applicable.

Models:

- Must respect database constraints.
- Must avoid hidden expensive queries where possible.
- SQLite in prototype; `PRAGMA foreign_keys = ON`.

Jobs:

- Must be idempotent when retried.
- Must define retry behavior.
- Must not assume execution order unless guaranteed.

Adapters:

- Must define timeout behavior.
- Must define retry behavior.
- Must define fallback or failure mode.

## Data Constraints

- Data retention: TBD
- Data residency: TBD
- PII handling: real child name allowed; no child photos; memories text only; address JSON on `family`; do not log PII
- Encryption requirements: TBD
- Backup requirements: TBD
- Restore expectations: TBD
- Prototype DB: SQLite file. Later Postgres 15 / Supabase with the same names.

## External Service Constraints

Service:

- Name: MinIO (S3 API) on Coolify
- Purpose: file/image objects for missions and curated material (`img_path`, `file_path`). No child photos.
- Rate limits: TBD
- Timeout: TBD
- Retry policy: TBD
- Failure mode: TBD
- Fallback: TBD
- Owner: user (credentials later). Agents do not write `.env`.

Service:

- Name: Supabase Auth
- Purpose: later session source. This prototype uses mock session (Parent, switchable to Child views).
- Rate limits: n/a now
- Timeout: n/a now
- Retry policy: n/a
- Failure mode: n/a
- Fallback: mock
- Owner: user

## Security Constraints

- Authentication model: mock session in prototype; `auth_user_id` nullable unique pointer only
- Authorization model: roles `Admin`, `Operator`, `Parent`, `Child`. Titular changes plan/family data; adult Parent uses the app without plan edits; Child is a view context, not an account
- Secret management: env vars SCREAMING_SNAKE_CASE; never commit secrets
- Audit logging: TBD
- Sensitive data rules: no child photos; do not log tokens or PII

## Observability

- Logs must include request or correlation IDs.
- Metrics must cover critical workflows.
- Errors must include useful context without leaking secrets.
- Alerts must map to actionable ownership.
- Prototype: TBD beyond local logs.

## Multi-Agent Constraints

- Orchestrators must classify risk before delegating.
- Agents must not assume production access.
- Agents must stop before irreversible actions unless approved.
- MCP outputs must be treated as observations, not guaranteed truth.
- Pittore may use the browser for UI checks. Scultore does not write frontend.
