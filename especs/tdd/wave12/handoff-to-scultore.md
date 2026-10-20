# Handoff to Scultore — Wave 12

Wave 12 Frontend painted (Pittore-only). Phone scale, hamburger drawer, `/child`, paint tokens. No backend, Vitest, `.env`, or Babylon Gate.

## Files written per lane

Family (`app/(family)/**`) + `MASTER.md`:

- `MASTER.md` — rewritten cheerful tokens (no terracotta/cream)
- `layout.tsx` — new CSS vars; desk is 100dvh, no bottom ContextSwitchControl
- `chrome/phone-chrome-frame.tsx` — PhoneScale wrapper
- `chrome/phone-chrome-decorator.tsx` — FamilyDrawer inside bezel; updated token fallbacks
- `chrome/phone-scale.tsx` — scale outer frame to 100dvh × width
- `chrome/family-drawer.tsx` — hamburger top-right; drawer opacity+transform
- `chrome/seeded-family.ts` — demo `familyId` `c10a0003-3333-4333-8333-000000000010`
- `chrome/family-nav.tsx` — returns null (drawer owns nav)
- `chrome/index.ts` — exports
- `context-switch/family-session-context.tsx` — `familyId` seeded; Sair uses `POST /api/session/context` `{ role: "Parent" }`
- `context-switch/context-switch-screen.tsx` — **Convidar familiar**
- Session contexts + screens: hide family/mission id fields; seed family + published missions
- `child/**` — `/child` chosen + history + add note
- `plan/**` — Alterar plano / Convidar familiar
- Panel `app/(panel)/layout.tsx` — same CSS vars

## FE checkboxes

No `fase12Task.md`. Verification: `especs/tdd/wave12/frontend-verification.md`.

## Type-check / lint / build

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | No `app/(family)` or `app/(panel)` errors. Pre-existing `internal/storage/minio-adapter.ts` TS2769. |
| `npm run build` | Not run (dev already up in docker compose) |

## Verification

- `especs/tdd/wave12/frontend-verification.md`
- Browser Preview B on docker `localhost:3000`: phone fits viewport; hamburger; `/child`; `/plan` copy; no id prompts on parent pages.

## Router blocks merged

No `frontend/src/portals/*`. New routes owned in `app/(family)/child/page.tsx` and `app/(family)/plan/page.tsx`.

## Canva

Chrome/Safari/Firefox: scale uses `transform` only (no width/height animation); drawer opacity+transform; `100dvh` desk; reduced-motion disables drawer transitions. Manual still: Safari / Firefox / iOS device.

## Graph

Updated. `graphify update . --no-cluster` — 4837 nodes, 8827 edges. `graphify-out/graph.json` verified. Harness templates not touched.

## Sistina-arch

`my_docs/architecture-map.html` refreshed from `my_docs/schema.sqlite.sql` + Wave 12 family surfaces. Evidence: graph + schema.

## Backend signals

### Child cannot read completed history

- Feature: completed-missions
- Path: `app/api/families/[id]/missions/route.ts`
- Harness / measurement: `/child` GET `?status=Completed` uses `GpsPolicy.assertCanEdit` → 403 for Child
- Evidence: browser `/child` shows “O histórico ainda não abre nesta visão.”
- Suggested correction: allow Child to GET completed history (`assertCanAnswer`), keep writes Parent-only if that is the invariant

### Child cannot add a diary note

- Feature: family-diary
- Path: `app/api/families/[id]/diary/route.ts` POST
- Harness / measurement: `/child` add note uses `assertCanEdit` → 403
- Evidence: composer stays on Child; POST forbidden
- Suggested correction: allow Child POST text notes (INV-002 still no photos)

### No list of chosen (Accepted/Doing) missions

- Feature: mission-cycle / completed-missions
- Path: `app/api/families/[id]/missions/route.ts`
- Harness / measurement: GET only accepts `status=Completed`
- Evidence: `/child` shows seeded Accepted title “Living room fort” only
- Suggested correction: GET Accepted/Doing for the seeded family so Child/Parent can list chosen missions

### applyRole Parent does not leave Admin/Operator

- Feature: context-switch
- Path: `app/api/session/presentation-strategy.ts` `alignFamilyMock`
- Harness / measurement: after panel Admin, family APIs 403 until mock role is Parent. `POST /api/session/context` `{ role: "Parent" }` updates presentation but skips `getMockSession()` when role is Admin/Operator
- Evidence: `/quiz` showed “Quiz indisponível” after Wave 11 Admin session
- Suggested correction: Sair / applyRole Parent must set `getMockSession().role = "Parent"` and keep `familyId` as the demo family. Do not use `POST /api/panel/session` Parent

## Not done

- Child live history and note persist (blocked by the signals above)
- Chosen missions from API (seeded Accepted title only)
- Safari / Firefox / iOS device pass
- `npm run build` this invocation
- Project lint script — none in `package.json`
