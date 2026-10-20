# Phase 3 — panel Green

- [x] `app/api/panel/panel-policy.ts` — Admin/Operator allow; Parent/Child throw
- [x] `app/api/panel/surface-facade.ts` — panel chrome none; family iphone-15-pro-max; assertPanel
- [x] GET `/api/panel/session` 200 staff / 403 Parent
- [x] GET `/api/panel/catalog` staff drafts envelope / Parent 403
- [x] Do not edit existing tests; panel families stay on SupportPolicy
- [x] Phase tests pass: `npx vitest run tests/panel`
- [x] Brownfield only: skipped (families routes not rewired)
- [x] POST `/api/panel/session` sets Admin|Operator|Parent|Child without password; invalid 400
- [x] Increment tests pass: `npx vitest run tests/panel/panel-session-switch.test.ts`

## Frontend (Pittore)

- [x] `app/(panel)/**` web layout, no phone chrome (`data-chrome="none"`)
- [x] Catalog at `/catalog` uses GET `/api/panel/session` and GET `/api/panel/catalog`
- [x] Parent mock sees 403 / Acesso negado (no Parent/Child screens on panel)
- [x] Type-check, lint, build, `frontend-verification.md`
