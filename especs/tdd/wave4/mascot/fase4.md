# Phase 4 — mascot (mascot-mission) Frontend

## Context

Wave 4 lane `mascot` is **FE only** (`DB: —`, `BE: —`). No Red Vitest. No new API. Consumes an already-returned published mission payload.

## Green steps (Pittore)

1. `app/(family)/missions/mascot/**` — mount only inside family iPhone 15 Pro Max chrome. Never full-bleed. Never on the panel.
2. Decorator wraps published mission title/description as a mascot text message (bubble/voice chrome). Do not invent copy. Unpublished ids never decorate.
3. Strategy: typewriter slow-then-fast by default; instant full text when `prefers-reduced-motion`. Empty title/description: explicit empty, no typewriter.
4. Soft familial colors (`/amaterasu-paint`). JS typewriter library allowed. No Flowbite. No native mobile.

## Verification

Type-check, lint, build. Browser: typewriter, reduced-motion instant, empty copy, unpublished never shown. Write `especs/tdd/wave4/mascot/frontend-verification.md`.
