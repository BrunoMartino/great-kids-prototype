# Phase 2 — catalog-fiche (activity-card + review-flow) Green

## Context

Wave 2 lane `catalog-fiche`. Phase Red only is done. Tests import missing `[id]` modules and assert fiche GET/PATCH, Builder, ImageAdapter, ReviewState, review POST, and `listPublished`.

Red tests:

- `tests/catalog-fiche/fiche-api.test.ts`
- `tests/catalog-fiche/fiche-builder.test.ts`
- `tests/catalog-fiche/image-adapter.test.ts`
- `tests/catalog-fiche/review-state.test.ts`
- `tests/catalog-fiche/review-api.test.ts`
- `tests/catalog-fiche/family-published.test.ts`

Invariants: INV-001 (never invent a mission), INV-004 (values envelope, not a bare array), INV-005 (family sees only published).

## Red command

```bash
npx vitest run tests/catalog-fiche
```

Expected: 24 failed. Cannot resolve `app/api/missions/[id]/route`, `fiche-builder`, `image-adapter`, `review-state`, `review/route`, or `listPublished` is not a function.

## Green steps

DB: no new migration. Range 020300–020399 unused. Wave 0 already has `mission` (`img_path`, not `feat_img_path`) and `mission_material`.

THIS LANE ONLY writes `models/mission.ts` among shared models.

1. Extend `models/mission.ts` (this lane only): `findById` (fiche columns including `img_path`, `values` JSON, materials via query or empty array), `update` via Builder fields, `listPublished` (`review_status=published` AND `status=active` AND `deleted=0`), `updateReviewStatus`. Keep existing `insert` / `list`.
2. `app/api/missions/[id]/fiche-builder.ts` — GoF Builder. `FicheBuilder.build(p_input)` merges optional fields (description, img_path, duration_minutes, ages, setting, values envelope). Omit stays undefined/null (no invented title). `age_min > age_max` throws. `values` as `[]` throws (INV-004).
3. `app/api/missions/[id]/image-adapter.ts` — GoF Adapter path-only. `ImageAdapter.toImgPath({ objectKey })` returns the string as-is (empty → `""`; traversal-shaped key stored as data). No MinIO SDK, no filesystem IO, unused by CI except the unit map test.
4. `app/api/missions/[id]/review-state.ts` — GoF State. `ReviewState.transition(p_from, p_to)`: draft → in_review → published; published → in_review (re-review); in_review → draft allowed by TDD diagram. Throws on published → draft and draft → published.
5. `app/api/missions/[id]/review-policy.ts` — GoF Policy Staff vs Parent for the `[id]` family read (Parent GET published only).
6. `app/api/missions/[id]/route.ts` — GET/PATCH. Next 15 `{ params: Promise<{ id }> }`. Staff full fiche. Parent GET published only else 404 (never a generated title). PATCH staff only. Reject inverted ages (400, ages unchanged) and bad enums (400, type stays `Activity`). Column `img_path` not `feat_img_path`. Values envelope `{ id, values: [...] }` not a bare array.
7. `app/api/missions/[id]/review/route.ts` — POST Staff, State transitions. Body `{ review_status }`. 200 `{ id, mission: { id, review_status } }`. Parent 403 (row stays draft). Illegal skip draft → published → 409 or 400 (still draft). Unknown id → 404.
8. Reuse existing `StaffPolicy` from `app/api/missions/staff-policy.ts` (read-only import; do not edit that file).
9. Typed, `p_` params, no `any`, `queryRaw`, no ORM/repo, no FE, no live upload.

Do **not** write: `app/api/missions/route.ts`, `app/api/missions/mission-factory.ts`, `app/api/missions/staff-policy.ts`, `models/family.ts`, `app/api/families/**`, `app/api/session/**`, existing tests under `tests/catalog/**`, FE, `.env`, Babylon Gate, live MinIO.

Parent GET `/api/missions` collection must stay 403 (Wave 1). Family published reads are the new `[id]` routes + `Mission.listPublished`, not a change to collection GET.

## Verification

```bash
npx vitest run tests/catalog-fiche
```

Done when all catalog-fiche tests pass. Do not edit Wave 1 catalog tests.

## Frontend

N/A (`FE: —`).

## Brownfield only — post-Green playbook

After Green verification, create `especs/tdd/wave2/catalog-fiche/refactor-fase2.md`. Do not execute a legacy swap in Green. No existing `[id]` production to replace; playbook may be a short no-swap note.

## ImageAdapter doubles

None. Real Adapter is a mapper. Partner questions: not testing a mock; no slow external.
