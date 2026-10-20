# Great Kids — Design system

Source of truth for family UI tokens. Wave 2 paints context-switch and a minimum iPhone 15 Pro Max chrome. Wave 3 owns `app/(family)/chrome/**` and may extend this file.

## Product

High-fidelity prototype for conservative, loving parents. Family screens live only inside HTML iPhone 15 Pro Max chrome. The Admin/Operator panel is a separate web surface and must not use these family tokens as a phone theme.

## Visual thesis

- **Color:** Warm paper, terracotta, sage. Soft, familial, readable. No neon, no cool SaaS blue.
- **Type:** System UI stack (already on `html`). No CDN fonts.
- **Spacing:** Comfortable phone padding (16 / 24). Touch targets ≥ 44px.
- **Components:** Rounded, quiet cards. Segmented switch. Animated loading, modal, and view change.

## Interaction thesis

- **Timing:** Micro 120ms, UI 240ms, view change 280ms enter / 160ms exit.
- **Hover:** Enhancement only (`hover: hover` and `pointer: fine`). Actions always visible on touch.
- **Scroll:** Frame stays; inner screen scrolls. No full-bleed family pages.
- **Forbidden:** Animate width/height/top/left; scale to 0; ease-in on enter; skip `prefers-reduced-motion`.

## Tokens

| Role | Token | Value |
|------|-------|-------|
| Primary | `--color-primary` | `#8b4a3c` |
| Secondary | `--color-secondary` | `#4f6b50` |
| Tertiary | `--color-tertiary` | `#d4b896` |
| Success | `--color-success` | `#3d6b44` |
| Danger | `--color-danger` | `#a33f3f` |
| Warning | `--color-warning` | `#9a7028` |
| Ink | `--color-ink` | `#2c2a28` |
| Muted | `--color-muted` | `#5c564f` |
| Paper | `--color-paper` | `#fff8f2` |
| Desk | `--color-desk` | `#f3e8dc` |
| Child | `--color-child` | `#5a5280` |
| Bezel | `--color-bezel` | `#1c1a19` |

Motion: enter `cubic-bezier(0.16, 1, 0.3, 1)`; exit `ease-in`; state `ease-in-out`. Animate `transform` and `opacity` only.

## Chrome (iPhone 15 Pro Max)

CSS-only iPhone 15 Pro Max frame in `app/(family)/chrome/**` (no raster). `data-phone-chrome="iphone-15-pro-max"`. Logical screen **430 × 932**. Bezel 14px. Outer radius ~56px, inner ~44px. Dynamic Island + home indicator. Left nubs: silent + volume up/down. Right nub: power. Inset glass edge on the paper screen. `data-family-desk`: max-width 1920px centered, overflow auto. Viewport smaller than the frame: page scrolls; never scale away, drop chrome, or full-bleed.

## Do not

- Import Flowbite.
- Add Redux/Zustand.
- Host Parent/Child screens on panel routes.
- Show child photos (INV-002).
