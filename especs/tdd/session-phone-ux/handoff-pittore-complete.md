# Handoff — Session split + family phone UX (complete)

## Lane A (Scultore)

- `staffRole` / `familyRole` on mock session; family routes use `familyRole`; panel uses `staffRole`.
- Panel POST rejects Parent/Child; GET 403 without staff.
- `GET /api/families/{id}/calendar` agenda list.
- Diary notes persist optional `author` from `familyRole`.

## Lane B (Pittore)

- SurfaceModeSwitch POSTs Admin/Parent before navigation.
- Mouse drag-scroll on phone body / thumb content.
- Quiz: one question + one answer form.
- Parent calendar agenda with `+` composer; forecast/surprise/cycle ready UI.
- Diary: Parent notes / Parent mission notes / Child mission notes.
- Child home posts mission-linked notes only.

## Obsolete tests (delete manually)

- `tests/panel/panel-session-switch.test.ts` — assert that POST accepts Parent/Child (now 400 by design).

## Verification

- New tests: `tests/session/staff-family-role-split.test.ts`, `tests/calendar/calendar-agenda-list.test.ts`, `tests/diary/diary-author.test.ts` (pass).
- Graphify updated after code.
