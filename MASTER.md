# Great Kids — Design system

Source of truth for family and panel UI tokens. Wave 12 paints a cheerful phone shell and applies the same tokens to the staff panel.

## Product

High-fidelity prototype for conservative, loving parents. Mood: **alegre, familiar, acolhedor, divertido**. Family screens live only inside HTML iPhone 15 Pro Max chrome. The Admin/Operator panel is a separate web surface and uses these tokens as a web theme, never as a phone frame.

## Visual thesis

- **Color:** Sunny coral, teal, gold on a bright sky paper. Playroom aqua desk. No terracotta, no cream, no neon, no cool SaaS blue.
- **Type:** System UI stack (already on `html`). No CDN fonts. No new font files.
- **Spacing:** Comfortable phone padding (16 / 24). Touch targets ≥ 44px.
- **Components:** Rounded, playful cards. Hamburger drawer. Animated loading, modal, and view change.

## Interaction thesis

- **Timing:** Micro 120ms, UI 240ms, view change 280ms enter / 160ms exit. Drawer 240ms enter / 160ms exit.
- **Hover:** Enhancement only (`hover: hover` and `pointer: fine`). Actions always visible on touch.
- **Scroll:** Outer chrome scales to fit **100dvh** and the viewport width. Inner screen still scrolls. No full-bleed family pages.
- **Forbidden:** Animate width/height/top/left; scale to 0; ease-in on enter; skip `prefers-reduced-motion`. Do not animate the chrome fit scale.

## Tokens

| Role | Token | Value |
|------|-------|-------|
| Primary | `--color-primary` | `#ff5a36` |
| Secondary | `--color-secondary` | `#1f9d8a` |
| Tertiary | `--color-tertiary` | `#ffc43d` |
| Success | `--color-success` | `#2f9e4d` |
| Danger | `--color-danger` | `#e23d4d` |
| Warning | `--color-warning` | `#f4a259` |
| Ink | `--color-ink` | `#1f2a37` |
| Muted | `--color-muted` | `#5a6674` |
| Paper | `--color-paper` | `#f3f8ff` |
| Desk | `--color-desk` | `#b8e4f0` |
| Child | `--color-child` | `#7c5cbf` |
| Bezel | `--color-bezel` | `#1a222c` |

Motion: enter `cubic-bezier(0.16, 1, 0.3, 1)`; exit `ease-in`; state `ease-in-out`. Animate `transform` and `opacity` only.

## Chrome (iPhone 15 Pro Max)

CSS-only iPhone 15 Pro Max frame in `app/(family)/chrome/**` (no raster). `data-phone-chrome="iphone-15-pro-max"`. Logical screen **430 × 932**. Bezel 14px. Outer radius ~56px, inner ~44px. Dynamic Island + home indicator. Left nubs: silent + volume up/down. Right nub: power. Inset glass edge on the paper screen. `data-family-desk`: max-width 1920px centered.

Viewport: scale `[data-phone-chrome]` so the outer frame fits **100dvh** and the available width. Inner `[data-phone-body]` still scrolls. `prefers-reduced-motion`: no scale animation.

Hamburger sits **top-right inside the bezel**. Drawer animates opacity + transform only. Parent items: quiz, calendar, forecast, surprise, cycle, diary. Footer: Perfil, Plano, Sair. Parent may offer “Ver como criança” (demo, not an account). Child route `/child` has no plan, invite, quiz, calendar, or forecast.

## Copy

- **Alterar plano**
- **Convidar familiar** (invitee is Parent or Child member)
- INV-002: no child photo

## Do not

- Import Flowbite.
- Add Redux/Zustand.
- Host Parent/Child screens on panel routes.
- Show child photos (INV-002).
- Ask the commissioner to type family or mission ids. Use the seeded mock `familyId`.
