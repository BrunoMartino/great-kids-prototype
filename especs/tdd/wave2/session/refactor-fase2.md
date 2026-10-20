# Brownfield — session presentation store (phase 2)

Do not apply this playbook.

`internal/db/mock-session.ts` stays the Wave 0 health/catalog role store. Do not edit it in this Green.

The session presentation store is new and lives in `app/api/session/presentation-strategy.ts` (in-memory `present` + current `PresentationStrategy`). Health and catalog continue to read `getMockSession()`. Context switch (Parent/Child view) reads the presentation store only.
