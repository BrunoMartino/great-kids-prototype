# testing_expectation.md

## Purpose

Define the testing expectations for an MVC project using pragmatic Design Patterns.

## Testing Philosophy

- Test behavior, not implementation details.
- Keep tests close to the level of risk.
- Domain invariants must be tested directly.
- Bug fixes require regression tests.
- Avoid testing framework internals.
- Runner: Vitest on backend/API (Route Handlers, services, models, invariants).
- Frontend: no unit tests in this prototype. Pittore verifies screens in the browser (cohesion, animation, phone chrome, Parent/Child context switch).
- Coverage focus: observable behavior and invariants, not implementation snapshots.

## MVC Test Expectations

Controller tests:

- Verify request handling, authorization, response status, redirects, and payload shape.
- Mock or isolate external services when appropriate.
- Avoid testing complex business rules only through controllers.

Model tests:

- Verify validations, relationships, scopes, simple domain behavior, and persistence rules.
- Cover critical constraints (`queryRaw` + SQLite checks: enums, JSON valid, FKs, uniques).

Service tests:

- Verify business workflows.
- Cover branching rules, failure modes, and side effects.
- Prefer these for non-trivial business logic (mission pick must refuse unpublished rows).

Policy / Guard tests:

- Verify access rules.
- Cover allowed and denied cases (Admin, Operator, Parent, Child mock context).

Adapter tests:

- Verify mapping between project code and external systems.
- Avoid real external calls in regular test suites unless explicitly marked.
- MinIO/S3: TBD when credentials exist; until then adapters stay uncalled in CI.

Job tests:

- Verify enqueueing, idempotency, retry behavior, and service invocation.
- No jobs in this prototype.

## Design Pattern Test Expectations

Factory:

- Test creation rules and invalid inputs.

Strategy:

- Test each strategy independently.
- Test strategy selection separately.

Adapter:

- Test request/response mapping.
- Test external failure handling.

Command:

- Test success, validation failure, and side effects.

Policy:

- Test permission matrix clearly.

## Minimum Requirements

Every change should include:

- Relevant automated tests (Vitest) for backend behavior.
- Regression coverage for fixed bugs (new tests only; never edit or delete existing tests).
- Tests for affected domain invariants.
- Manual verification notes only when automation is insufficient (Pittore browser notes).

## Agent Rules

- Agents must add focused tests for changed behavior.
- Agents must not add broad brittle tests just to increase coverage.
- Reviewer agents must flag missing invariant tests.
- Test agents must report what was run and what was not run.
- Agents must not edit or remove tests already in the repo. Obsolete tests are listed for the user to delete.
- Pittore may drive the browser; Scultore does not write frontend tests.
