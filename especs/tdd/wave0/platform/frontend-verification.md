# Wave 0 — Frontend verification (platform)

## Files written

- `app/layout.tsx` — root `html`/`body` only; document styles; no phone chrome; no screens.
- `app/(panel)/layout.tsx` — empty panel shell (`data-surface="panel"`); no phone chrome; no screens.
- `app/(family)/layout.tsx` — empty family shell (`data-surface="family"`); no phone chrome; no screens.

Surfaces do not import each other. Root has no panel or family chrome.

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass (exit 0) |
| Lint | Not present (no `lint` script; no project `eslint` / `biome.json` / `.oxlintrc.json`) |
| `npx next build` | Fail (exit 1) — Next 15.5.28 cannot load `next.config.ts` because TypeScript 7.0.2 has no `ts.sys.fileExists` (`node_modules/next/dist/build/next-config-ts/transpile-config.js`). Layouts are not the cause. |

## Manual: empty group layouts

Wave 0 has no pages in `(panel)` or `(family)`, so those layouts do not mount on a URL. They wrap `children` only.

- Panel vs family: isolated `data-surface` + scoped CSS. No shared chrome.
- No iPhone frame / phone chrome (Wave 3).
- No Flowbite import.
- Browser render of group routes not run: no pages, and `next dev`/`next build` cannot load config (same TypeScript 7 issue).

## Acceptance

- [x] Root layout is document only.
- [x] Panel layout is an empty shell.
- [x] Family layout is an empty shell.
- [x] Layouts do not leak into each other.
- [x] Type-check passes.
- [ ] Build — blocked on TypeScript 7 + Next config load (backend/ops).
