# Phase 2 — catalog-fiche Green

- [x] Extend `models/mission.ts`: findById (fiche columns including img_path, values JSON, materials via query or empty array), update via Builder fields, listPublished (review_status=published AND status=active AND deleted=0), updateReviewStatus
- [x] `app/api/missions/[id]/fiche-builder.ts` GoF Builder
- [x] `app/api/missions/[id]/image-adapter.ts` GoF Adapter path-only, no MinIO SDK, unused by CI except unit map test
- [x] `app/api/missions/[id]/review-state.ts` GoF State
- [x] `app/api/missions/[id]/review-policy.ts` GoF Policy Staff vs Parent
- [x] `app/api/missions/[id]/route.ts` GET/PATCH. Staff full fiche. Parent GET published only else 404. PATCH staff only. Reject inverted ages, bad enums, bare values array. Column img_path not feat_img_path
- [x] `app/api/missions/[id]/review/route.ts` POST Staff, State transitions
- [x] Reuse existing StaffPolicy from `app/api/missions/staff-policy.ts` (read-only import; do not edit that file)
- [x] typed, p_ params, no any, queryRaw, no ORM/repo, no FE, no live upload
- [x] Phase tests pass: `npx vitest run tests/catalog-fiche`
- [x] Frontend: N/A
- [x] Brownfield only: Create especs/tdd/wave2/catalog-fiche/refactor-fase2.md (legacy removal playbook; do not apply it in Green)
