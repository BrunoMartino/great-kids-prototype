# Phase 3 — family-shell (parent-shell) Green

## Context

Wave 3 lane `family-shell`. **BE: —** (no backend). Scultore skips production API/models. Pittore owns chrome polish.

Wave 2 already mounted minimum iPhone 15 Pro Max chrome in `app/(family)/layout.tsx` (`data-phone-chrome="minimum"`). This lane polishes `app/(family)/chrome/**`.

## Red command

N/A (no backend tests). Frontend: no unit tests (`testing_expectation.md`).

## Green steps

DB: none. Range 030100–030199 unused.

Backend: none.

Frontend (Pittore):

1. `app/(family)/chrome/**` — Decorator iPhone 15 Pro Max chrome around family views. Facade: family surface decorated; panel never decorated.
2. Small viewport: frame stays; inner app scrolls.
3. No native mobile package. No Flowbite.
4. Type-check, lint (if present), build; `frontend-verification.md`.

## Verification

Pittore: family routes inside chrome; panel has no chrome; no RN/Expo in `package.json`.
