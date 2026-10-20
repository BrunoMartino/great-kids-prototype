# Phase 2 signal — session brownfield playbook (do not apply)

## Context

Green aligned `applyRole` with `getMockSession()` for Parent/Child only. Tests: `tests/session/mock-session-align.test.ts`.

## Legacy inventory

- `internal/db/mock-session.ts` — process mock role store (Wave 0)
- `app/api/session/presentation-strategy.ts` — presentation store (Wave 2)

## Replacement map

None now. Two stores remain: presentation (family) and mock session (panel staff). Alignment is one-way Parent/Child.

## Removal steps

Do not merge stores until real auth exists.

## Do not touch

Persisted tests; `.env`; panel `getMockSession()` callers.

## Obsolete tests

None.

## Verification

`npx vitest run tests/session`
