# Wave 3 — Frontend verification (family-shell)

## Files written

- `app/(family)/chrome/family-surface-protocol.ts` — `IFamilySurface`
- `app/(family)/chrome/family-app-view.ts` — core surface
- `app/(family)/chrome/family-surface-decorator.ts` — base Decorator
- `app/(family)/chrome/phone-chrome-decorator.tsx` — iPhone 15 Pro Max chrome
- `app/(family)/chrome/phone-chrome-frame.tsx` — React export; children in `[data-phone-body]`; footer above home indicator
- `app/(family)/chrome/index.ts`
- `app/(family)/layout.tsx` — shared touchpoint: `FamilySessionProvider` + `PhoneChromeFrame` + `ContextSwitchControl`
- `MASTER.md` — chrome section (iPhone 15 Pro Max, not minimum)

Parent/Child remain on `/context-switch` inside the frame. No Flowbite. No native mobile package.

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass (exit 0) |
| Lint | Not present (no `lint` script) |
| `npm run build` | Pass — `/context-switch` static 3.33 kB |

## Manual: acceptance

- Family routes render inside `[data-phone-chrome="iphone-15-pro-max"]` on `data-surface="family"`. `aria-label="iPhone 15 Pro Max"`. Measured box 458×960 (430×932 screen + 14px bezel × 2). Dynamic Island, four hardware nubs, home indicator. Desk cream; page scrolls when the viewport is shorter than the frame; chrome is not dropped.
- Default mock Parent: badge **Visão Parent**, heading **Casa da família**. Parent | Child control stays inside the screen, above the home indicator.
- Panel routes do not use this chrome (`/catalog` is `data-surface="panel"` `data-chrome="none"`; no `data-phone-chrome`).
- `package.json` has no react-native / expo / flutter / capacitor / flowbite.

## Acceptance

- [x] Family routes render inside the iPhone 15 Pro Max chrome
- [x] Panel routes do not use the phone chrome
- [x] No native mobile package in dependencies
- [x] Type-check and build pass
- [ ] Lint — not configured in this repo
