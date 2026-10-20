# Phase 2 signal — session Green

- [x] `applyRole` aligns `getMockSession().role` to Parent|Child when the current mock role is not Admin/Operator
- [x] Invalid `applyRole` does not mutate mock session
- [x] No `app_user` insert; do not edit `internal/db/mock-session.ts`
- [x] Phase tests pass: `npx vitest run tests/session/mock-session-align.test.ts`
- [x] Brownfield: create `especs/tdd/wave2/session/refactor-fase2-signal.md` (do not apply)
