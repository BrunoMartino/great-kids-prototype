# Brownfield — catalog-fiche [id] routes (phase 2)

Do not apply this playbook.

There is no legacy `app/api/missions/[id]` production to replace. Wave 1 catalog stays on `GET/POST /api/missions` (collection). This Green only added new `[id]` fiche GET/PATCH, review POST, Builder, ImageAdapter, ReviewState, and ReviewPolicy.

`Mission.insert` / `Mission.list` and collection GET (Parent 403) are unchanged. ImageAdapter is path-only; no live MinIO swap.
