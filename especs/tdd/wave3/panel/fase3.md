# Phase 3 — panel (admin-panel) Green

## Context

Wave 3 lane `panel`. Red tests import missing PanelPolicy, SurfaceFacade, `/api/panel/session`, `/api/panel/catalog`.

Red tests:

- `tests/panel/panel-policy.test.ts`
- `tests/panel/surface-facade.test.ts`
- `tests/panel/panel-api.test.ts`

Axes: Admin/Operator allow; Parent/Child 403; empty role deny; panel chrome none; family chrome iphone-15-pro-max; catalog lists drafts for Admin. No doubles.

## Red command

```bash
npx vitest run tests/panel
```

Expected: fail — cannot resolve `@/app/api/panel/panel-policy`, `surface-facade`, `session/route`, `catalog/route`.

## Green steps

DB: none. Range 030200–030299 unused. Wave 0 schema already has family/mission/plan.

1. `app/api/panel/panel-policy.ts` — GoF Policy (project Policy class, same shape as `StaffPolicy`). `PanelPolicy.assertStaff(p_role)` allows Admin|Operator; Parent/Child/empty throw.
2. `app/api/panel/surface-facade.ts` — GoF Facade (`BuilderFacade` style: class composing subsystem). `panelSurface()` → `{ chrome: "none" }`; `familySurface()` → `{ chrome: "iphone-15-pro-max" }`; `assertPanel(p_role)` delegates to PanelPolicy.
3. `app/api/panel/session/route.ts` — GET 200 `{ role }` for Admin|Operator via Facade + `getMockSession()`; Parent 403 `{ error: "forbidden" }`.
4. `app/api/panel/catalog/route.ts` — GET staff missions envelope `{ id, missions: [...] }` including drafts (`Mission.instance.list()`); Parent 403. Same process as family APIs.
5. Existing `app/api/panel/families/**` keep `SupportPolicy` + `getMockSession()` (do not edit those tests). Optionally also call `SurfaceFacade.assertPanel` only if behavior stays 403/200 as today.
6. `p_` params, typed, no `any`, `queryRaw`, no ORM, no FE under `app/(panel)/**`.

Do not: Flowbite; real SSO; write chrome.

## Verification

```bash
npx vitest run tests/panel tests/family/panel-families-api.test.ts tests/family/support-policy.test.ts
```

## Frontend

Pittore: `app/(panel)/**` — no phone chrome; catalog opens for staff.

## Increment — mock role switch (Pittore signal)

Red: `tests/panel/panel-session-switch.test.ts` — POST missing (`POST is not a function`).

7. `app/api/panel/session/route.ts` — add `POST`. Body `{ role }` accepts `Admin|Operator|Parent|Child` with no password. Sets `getMockSession().role`. 200 `{ role }`. Unknown/missing role 400; do not mutate store. Ignore extra `password`. GET stays staff-gated (Parent/Child 403). Family `applyRole` already skips overwrite when mock is Admin/Operator — do not change that.

## Brownfield

After Green: `especs/tdd/wave3/panel/refactor-fase3.md` if families routes are touched; skip if only new files.
