# Phase 2 signal — family brownfield playbook (do not apply)

## Context

Green: plan/invite/members consult `getPresentation` + `ContextPolicy`. Tests: `tests/family/presentation-writes.test.ts`.

## Legacy inventory

- `InvitePolicy` titular checks still run after ContextPolicy
- Address PUT still uses `getMockSession()` + `AddressPolicy`

## Replacement map

Callers already rewired on plan/invite/members. Address remains on mock session (aligned for Parent/Child).

## Removal steps

Optional later: address PUT same presentation path. Do not apply in Green.

## Do not touch

Persisted tests; panel `/api/panel/**`; `.env`.

## Obsolete tests

None.

## Verification

`npx vitest run tests/family`
