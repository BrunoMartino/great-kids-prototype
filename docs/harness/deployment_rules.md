# deployment_rules.md

## Purpose

Define deployment, migration, rollout, rollback, and production safety rules.

## Release Principles

- Deployments must be reproducible.
- Configuration must be environment-based.
- Secrets must never be committed. Agents never write `.env`; names go in `.env.example` only.
- Risky changes should use feature flags.
- Feature flags: TBD (not used in this prototype).
- Rollback or mitigation must be known before production release.
- Single repo. Production-shaped deploy: Nixpacks. Local/dev: Docker Compose + Dockerfile.
- Prototype database: SQLite. Later the same schema names run on Postgres 15 / Supabase.

## Pre-Deployment Checklist

- Tests pass.
- Lint/type checks pass.
- Database migrations reviewed.
- Feature flags configured when needed.
- Observability added for risky workflows.
- Rollback plan documented for high-risk changes.

## MVC Deployment Considerations

Controllers:

- Verify routes, auth, and response compatibility.

Models:

- Verify migrations, validations, indexes, and data compatibility.

Services:

- Verify business workflow changes and side effects.

Jobs:

- Verify queue compatibility, retries, and idempotency.

Adapters:

- Verify external credentials, timeouts, and failure behavior.
- MinIO/S3 on Coolify: user supplies access later. Do not invent buckets or keys.

## Database Rules

- Prefer forward-compatible migrations.
- Avoid destructive schema changes in the same release that depends on them.
- Use expand-and-contract for risky changes.
- Backfills must be idempotent or resumable.
- Long migrations require monitoring.
- Keep SQLite and Postgres 15 files aligned (same tables and columns). Study SQL lives in `my_docs/` until copied into the app.

## Rollback Rules

- Code rollback must not break newer data.
- Migrations must document rollback safety.
- External side effects may require compensating actions.
- Feature flags should support fast mitigation.

## Agent Rules

- Agents must not deploy unless explicitly asked.
- Agents must surface deployment risk before acting.
- Agents must not change production config or secrets without approval.
- Orchestrators must separate build, verification, deployment, and post-deploy checks.
