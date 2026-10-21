# Great Kids — Tidal Design System

Status: **APPROVED and implemented** (2026-10-21). Official copy of the design system; the code consumes it from one token source, `app/design-system/tokens.ts` (see `Design-System/README.md` and §14).
Skill: `amaterasu-paint` (design system) + `amaterasu-cast` (breakpoints/usability). Modules loaded: `web-styling`, `motion-principles`, `mobile-principles`, `desktop-principles`, `ui-ux-pro-max`, `dataviz` (charts).
Preview: `Design-System/design-system-preview.html`. Source images: `Design-System/assets/palleta-tidal.png`, `Design-System/assets/mobile-design.png`.

Surfaces covered:

| Surface | Route group | Shape |
|---------|-------------|-------|
| Family app (Parent + Child view) | `app/(family)/**` | Inside the CSS iPhone 15 Pro Max chrome (430 × 932 logical). Harness: no full-bleed family pages. |
| Admin panel (Admin, Operator) | `app/(panel)/**` | Normal web layout, `max-width: 1920px` centered. Never the phone frame. |

All UI copy and labels are in **English**.

---

## 1. Product, audience, mood

- Product: family activities and missions for loving, conservative parents and the children they care for.
- Primary users: adults with children (decide, plan, review). Secondary: children (do, enjoy, celebrate) through the Parent's "View as child" mode.
- Mood (5): **calm, warm, trustworthy, tactile, quietly playful.**
- What would feel wrong: neon, rainbow gradients, gratuitous glass, cold SaaS blue, cartoon clutter, dense text walls, child photos (INV-002).

## 2. Visual thesis

1. **Color** — "Tidal Escape": deep ocean teals carry trust and structure; Sea Mist and Wave Foam make the air; Driftwood Sand is the single warm hand-held accent (primary family CTA, rewards). Coastal Haze is the quiet neutral. No extra hues in UI chrome; semantic colors are tuned to sit inside the coastal range.
2. **Type** — a soft optical serif (Fraunces) for family-facing headlines gives warmth and a storybook voice; a humanist geometric sans (Plus Jakarta Sans) carries all UI text on both surfaces. Admin uses the sans only, with tabular numerals.
3. **Spacing** — generous on the app (16/24 rhythm, ≥ 44px targets, one idea per card); compact-comfortable on the admin (8/12/16 rhythm, 36–40px controls, data density without crowding).
4. **Components** — tactile "pebble" cards (inspired by `mobile-design.png`): large radii, layered soft shadows, an icon sitting in a round tinted well at the top, content below; pill CTAs; a thin inner highlight on raised surfaces. Admin keeps the same shapes but flatter (lower elevation, 12px radii).

## 3. Interaction thesis

1. **Timing** — micro 120ms, UI 240ms, view change 300ms enter / 180ms exit, drawer/sheet 280ms enter / 180ms exit, celebratory 480ms. Background tide loops: 18–42s.
2. **Hover** — desktop enhancement only (`@media (hover: hover) and (pointer: fine)`): lift −2px + shadow step. Touch: press = scale(0.98) + shadow step down. Actions always visible on touch.
3. **Scroll** — inner phone screen scrolls; the animated tide background is fixed behind content (no parallax on scroll). Admin: sticky header, sidebar sticky; no scroll-driven effects.
4. **Forbidden** — animating width/height/top/left; scale to 0; ease-in on enter; unguarded loops; skipping `prefers-reduced-motion`; hover-only reveals; animating the chrome fit scale; motion on dense admin tables.

Motion philosophy mix: app = Kowalski (interactive UI) 70% + Jhey (celebration: mission complete, reward) 10% + ambient tide 20%. Admin = Kowalski only.

---

## 4. Color

### 4.1 Source palette (extracted verbatim from `Design-System/assets/palleta-tidal.png`)

| Name | Hex | Role in this system |
|------|-----|---------------------|
| Deep Current | `#0D5C63` | Brand primary (light mode), headings accent, primary buttons |
| Ocean Depths | `#127D86` | Brand secondary: links, focus ring, active indicators, info |
| Sea Mist | `#7FC9CC` | Accent tint; **primary in dark mode** |
| Wave Foam | `#E0F2F3` | Tinted surface, selected rows, soft backgrounds |
| Driftwood Sand | `#DCCBB4` | Warm accent: family CTA pill, rewards, child highlights |
| Coastal Haze | `#93A7B0` | Decorative neutral: dividers on dark, disabled fills, illustration |

### 4.2 Derived ramps

| Step | Teal (Deep Current / Ocean Depths family) | Sand | Haze (neutral) |
|------|------|------|------|
| 50 | `#F5FAFA` | `#FAF6F0` | `#F4F7F8` |
| 100 | `#E0F2F3` (Wave Foam) | `#F3ECE1` | `#E3EAED` |
| 200 | `#BFE3E5` | `#EADFCF` | `#C9D5DA` |
| 300 | `#7FC9CC` (Sea Mist) | `#DCCBB4` (Driftwood Sand) | `#93A7B0` (Coastal Haze) |
| 400 | `#3FA3A9` | `#C7AE8D` | `#7D949C` |
| 500 | `#127D86` (Ocean Depths) | `#A88B63` | `#5E7A84` |
| 600 | `#0D5C63` (Deep Current) | `#86694A` | `#4A6670` |
| 700 | `#0A4A50` | `#5F4A34` | `#33494F` |
| 800 | `#0B2E33` | `#3D3022` | `#1E3236` |
| 900 | `#071C1F` | `#241C14` | `#0E1A1C` |

### 4.3 Semantic tokens — shared core

All pairs below were computed (WCAG 2.x relative luminance). "AA" = ≥ 4.5:1 text; "UI" = ≥ 3:1 non-text.

| Token | Light | Dark | Use | Contrast (light / dark) |
|-------|-------|------|-----|-------------------------|
| `--gk-bg` | `#F5FAFA` | `#071C1F` | Page / screen canvas | — |
| `--gk-surface` | `#FFFFFF` | `#0E2A2E` | Cards, inputs, sheets | — |
| `--gk-surface-2` | `#E0F2F3` | `#133539` | Tinted/sunken, selected rows | — |
| `--gk-surface-warm` | `#F3ECE1` | `#2A2A22` | Warm cards, rewards | — |
| `--gk-ink` | `#0B2E33` | `#E0F2F3` | Primary text | 13.7 on bg / 15.2 on bg (AA) |
| `--gk-ink-muted` | `#4A6670` | `#9FB4BC` | Secondary text | 6.1 on surface / 7.0 on surface (AA) |
| `--gk-ink-subtle` | `#5E7A84` | `#8AA1AA` | Placeholder, captions | 4.6 on white / 5.6 on surface (AA) |
| `--gk-border` | `#D3E3E5` | `#24474C` | Decorative dividers | decorative |
| `--gk-border-strong` | `#7D949C` | `#5E7F87` | Input/control outlines | 3.2 / 3.5 (UI) |
| `--gk-primary` | `#0D5C63` | `#7FC9CC` | Primary action fill | — |
| `--gk-on-primary` | `#FFFFFF` | `#071C1F` | Text on primary | 7.7 / 9.3 (AA) |
| `--gk-primary-hover` | `#0A4A50` | `#9AD6D8` | Hover/pressed fill | 10.0 / 10.9 (AA) |
| `--gk-link` | `#127D86` | `#7FC9CC` | Links, focus ring, active tab | 4.9 on white, 4.6 on bg / 8.0 on surface |
| `--gk-focus` | `#127D86` | `#7FC9CC` | 2px focus ring + 2px offset | UI |
| `--gk-accent` | `#7FC9CC` | `#3FA3A9` | Tints, illustration, progress track fill | decorative |
| `--gk-warm` | `#DCCBB4` | `#DCCBB4` | Family CTA pill fill, reward | ink on sand 9.1 (AA); Deep Current on sand 4.85 (AA) |
| `--gk-on-warm` | `#0B2E33` | `#0B2E33` | Text on sand | 9.1 (AA) |
| `--gk-success` | `#2E7D5B` | `#6FCF9F` | Success fill / text | 5.0 on white / 8.0 on surface |
| `--gk-success-soft` + text | `#E3F3EA` / `#24664A` | `#133539` / `#6FCF9F` | Badges, alerts | 5.9 / 7.0 |
| `--gk-warning` | `#9A6212` | `#E8B866` | Warning fill / text | 5.1 / 8.3 |
| `--gk-warning-soft` + text | `#F8EEDC` / `#7F500E` | `#133539` / `#E8B866` | Badges, alerts | 6.0 / 7.2 |
| `--gk-danger` | `#B4413C` | `#F2A39E` | Destructive | 5.6 / 7.6 |
| `--gk-danger-soft` + text | `#F8E5E3` / `#963530` | `#133539` / `#F2A39E` | Badges, alerts | 6.1 / 6.6 |
| `--gk-info` | `#127D86` | `#7FC9CC` | Info badges | — |

Rules:
- `#7FC9CC` with `#0D5C63` text is **4.08:1 — large/bold text (≥ 18.66px bold or 24px) only**.
- Coastal Haze `#93A7B0` is 2.5:1 on white — **never text, never an input border**; decorative only.
- Status is never color-alone: always icon + label.
- Dark mode is selected, not inverted: brand primary flips to Sea Mist with dark ink on it.
- **Light is the default and the only automatic mode (D5).** Nothing follows `prefers-color-scheme`. The dark column applies only inside an element with `data-theme="dark"` — today only the admin panel, through its top-bar toggle. The family app is always light.

### 4.4 App layer (family)

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--app-hero-from` | `#0D5C63` | `#0A4A50` | Hero/tide gradient start |
| `--app-hero-to` | `#127D86` | `#0D5C63` | Hero/tide gradient end |
| `--app-tide-1..3` | `#7FC9CC` @ 35/22/14% | `#3FA3A9` @ 28/18/10% | Animated wave layers |
| `--app-child` | `#5F4A34` (Sand 700) | `#DCCBB4` (Driftwood Sand) | "View as child" accent (replaces old purple): child badges, child buttons, child wells. Light value is Sand 700 so 12px badge text stays AA on its 14% tint (6.7:1; Sand 600 was 4.2:1). Paired with Sea Mist wells. |
| `--app-mission-well` | `#E0F2F3` | `#133539` | Round icon wells on pebble cards and drawer items |
| `--app-on-hero` | `#FFFFFF` | `#FFFFFF` | Text on `--grad-tide` (mission card, admin home strip) |
| `--app-on-hero-muted` | `#E0F2F3` | same | Eyebrows and sub lines on the hero / mission card (Wave Foam) |
| `--app-hero-glass` / `--app-hero-glass-hi` | `rgba(7,28,31,.22)` / `rgba(255,255,255,.12)` | same | Mission card fill and inner top highlight when it sits inside the hero |
| `--app-hero-control` | `rgba(224,242,243,.16)` | same | Hamburger fill over the hero |
| `--app-foam-wave` | `rgba(224,242,243,.18)` | `rgba(224,242,243,.10)` | Static foam waves inside the hero |
| `--app-desk-from/to` | `#F5FAFA` → `#E0F2F3` | `#071C1F` → `#0B2E33` | Desk behind the phone chrome (`--grad-desk`) |
| `--app-mascot` / `--app-mascot-shade` | `#3FA3A9` / `#0D5C63` | `#3FA3A9` / `#0A4A50` | Mascot avatar body / inset shade |
| `--app-bezel`, `--app-bezel-edge`, `--app-bezel-highlight`, `--app-island` | Haze 900 / 700 / 800, `#050A0B` | same | Phone chrome bezel, side buttons, Dynamic Island |
| `--app-card` / `--app-card-shadow` | `--gk-surface` / `--el-2` + `--el-inset` | same tokens | Pebble card fill and elevation |

### 4.5 Admin layer (panel)

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--adm-sidebar` | `#0B2E33` | `#05171A` | Sidebar fill (always dark: anchors the brand) |
| `--adm-sidebar-ink` | `#E0F2F3` | `#E0F2F3` | Sidebar text (12.5 AA) |
| `--adm-sidebar-muted` | `#93A7B0` | `#93A7B0` | Sidebar section labels (5.8 on `#0B2E33`, AA) |
| `--adm-sidebar-active` | `#0D5C63` | `#133539` | Active item fill, 3px Sea Mist left bar |
| `--adm-row-hover` | `#F5FAFA` | `#133539` | Table row hover |
| `--adm-row-selected` | `#E0F2F3` | `#18403F` | Selected row |

### 4.6 Data visualization (admin indicators)

Categorical order is fixed (never cycled, colour follows the entity). Validated with the `dataviz` validator (`validate_palette.js`).

| Slot | Light (surface `#FCFCFB`) | Dark (surface `#0E2A2E`) | Name |
|------|------|------|------|
| 1 | `#00909B` | `#13A3AD` | Tide |
| 2 | `#C27C2C` | `#BB7F33` | Driftwood |
| 3 | `#5266B8` | `#6A7ED4` | Dusk |
| 4 | `#B24F82` | `#C4609A` | Coral rose |
| 5 | `#2E9E5E` | `#2FA562` | Sea grass |

Validator result — light: all six checks PASS (worst adjacent CVD ΔE 8.1). Dark: PASS on band, chroma, normal-vision floor (16.7) and contrast; CVD WARN 7.9 between slots 4↔5 → legal only with secondary encoding (legend + direct labels, required anyway).
- Sequential: single teal ramp 100 → 700. Diverging: Driftwood ↔ Tide with Haze 200 midpoint.
- Status colors (success/warning/danger) are reserved and never used as series.
- Marks: 2px lines, 4px rounded bar ends anchored to baseline, 2px surface gap between bars, recessive grid (`--gk-border`), one y-axis only, hover tooltip on every mark, table view toggle.

---

## 5. Typography

| Role | Family | Fallback |
|------|--------|----------|
| Display (app only) | **Fraunces** (opsz, SOFT 50–100, WONK 0), weights 500/600 | Georgia, "Times New Roman", serif |
| UI / body (both) | **Plus Jakarta Sans**, weights 400/500/600/700 | system-ui, -apple-system, "Segoe UI", Roboto, sans-serif |
| Numbers (admin) | Plus Jakarta Sans + `font-variant-numeric: tabular-nums` | — |

Loading (implemented, decision D3): **self-hosted woff2 committed in the repo** — `app/design-system/fonts/plus-jakarta-sans-latin-wght-normal.woff2` (variable, wght 200–800) and `fraunces-latin-full-normal.woff2` (variable, opsz/wght/SOFT/WONK), loaded with `next/font/local` in `app/design-system/fonts.ts`. `next build` needs **no network** (Nixpacks/Coolify safe), no runtime CDN, no new npm dependency. Files come from the Fontsource builds of the Google Fonts families (SIL OFL 1.1; licenses next to the files). Latin subset only. Fraunces is not preloaded (display only); Plus Jakarta Sans is. Fallback stacks above apply while the fonts load (`font-display: swap`). The preview uses the Google Fonts CSS only because it is a standalone HTML file.

Scale (rem, root 16px; line-height; tracking):

| Token | App | Admin | LH | Weight | Family |
|-------|-----|-------|----|--------|--------|
| `--fs-display` | 2.25rem (36) | — | 1.1 | 600 | Fraunces |
| `--fs-h1` | 1.75rem (28) | 1.5rem (24) | 1.2 | 600 | Fraunces (app) / Jakarta 700 (admin) |
| `--fs-h2` | 1.375rem (22) | 1.25rem (20) | 1.25 | 600 | Fraunces / Jakarta 700 |
| `--fs-h3` | 1.125rem (18) | 1rem (16) | 1.3 | 700 | Jakarta |
| `--fs-body` | 1rem (16) | 0.9375rem (15) | 1.55 | 400 | Jakarta |
| `--fs-body-sm` | 0.875rem (14) | 0.875rem (14) | 1.5 | 400/500 | Jakarta |
| `--fs-caption` | 0.75rem (12) | 0.75rem (12) | 1.4 | 600, +0.04em, uppercase optional | Jakarta |
| `--fs-kpi` | — | 2rem (32) | 1.1 | 700 tabular | Jakarta |

Rules: max line length 65ch; never below 12px; never Fraunces below 18px or in the admin; headings use `text-wrap: balance` (progressive).

## 6. Spacing, radius, elevation

Spacing scale (4px base): `--sp-1` 4 · `--sp-2` 8 · `--sp-3` 12 · `--sp-4` 16 · `--sp-5` 20 · `--sp-6` 24 · `--sp-8` 32 · `--sp-10` 40 · `--sp-12` 48 · `--sp-16` 64.
- App: screen gutter 20, card padding 16–20, section gap 24, list item min-height 56.
- Admin: page gutter 24 (16 under 640px), card padding 20, table cell 12 × 16, form row gap 16.

Radius:

| Token | Value | Use |
|-------|-------|-----|
| `--r-xs` | 6px | Checkbox, tags in tables |
| `--r-sm` | 10px | Inputs (admin), small buttons |
| `--r-md` | 14px | Inputs (app), admin cards, menu items |
| `--r-lg` | 20px | App cards ("pebbles"), sheets top corners |
| `--r-xl` | 28px | Hero panels, feature cards |
| `--r-pill` | 999px | Buttons (app), chips, badges, segmented controls |

Elevation (light; dark uses the same y/blur with `rgba(0,0,0,.45)` and a 1px `rgba(224,242,243,.06)` inner top highlight):

| Token | Value | Use |
|-------|-------|-----|
| `--el-0` | none + 1px `--gk-border` | Flat tables, admin cards at rest |
| `--el-1` | `0 1px 2px rgba(11,46,51,.06), 0 2px 6px rgba(11,46,51,.06)` | Inputs, list rows |
| `--el-2` | `0 2px 4px rgba(11,46,51,.06), 0 8px 20px rgba(11,46,51,.10)` | App pebble cards, admin KPI cards |
| `--el-3` | `0 6px 12px rgba(11,46,51,.08), 0 18px 40px rgba(11,46,51,.16)` | Sheets, modals, drawer, popovers |
| `--el-inset` | `inset 0 1px 0 rgba(255,255,255,.6)` | Raised pebble highlight (light only) |

Z-scale: base 0 · sticky 10 · drawer 20 · sheet/modal 30 · toast 40 · tooltip 50.

## 7. Iconography

- Library: **Phosphor Icons** (`@phosphor-icons/react` **2.1.10**, pinned exact) — one family, six weights, consistent 256 grid, MIT. Import only through `app/design-system/icons.ts` (SSR-safe per-icon imports, `XxxIcon` names).
- App: `duotone` weight for feature icons inside round wells (48px well, 24px glyph, duotone layer = `--gk-accent` at 40%); `regular` for UI glyphs (menu, back, close).
- Admin: `regular` 20px in navigation and toolbars, `bold` 16px inside dense tables/buttons.
- Icon buttons: glyph 20–24px, hit area ≥ 44px (app) / ≥ 36px with 24px floor (admin); always `aria-label`.
- No emoji as icons. Replaces the hand-drawn `app/(panel)/shell/panel-icons.tsx` set.
- Decision D2: Phosphor adopted (Lucide rejected).

## 8. Backgrounds and gradients

Driven by `inspiratons.md`: an animated background that holds attention, and better-drawn components.

**Tide background (app)** — the signature:
1. Base: vertical gradient `--gk-bg` → `--gk-surface-2` (light) / `#071C1F` → `#0B2E33` (dark).
2. Three SVG wave layers (Sea Mist at 35/22/14% opacity) anchored to the bottom 40% of the screen, each 200% wide and translated on X in an infinite loop (`transform` only), periods 18s / 28s / 42s, alternating direction. Feels like slow surf on sand.
3. Two blurred "light pools" (radial gradients, 240–320px) drifting ±24px on 30s/38s loops (`transform` only).
4. Sand-ripple texture: a static SVG contour-line pattern at 6% opacity (the topographic lines of `mobile-design.png`), never animated.
5. Hero variant (Home): the same layers over the Deep Current → Ocean Depths gradient with foam waves at 18%.

Rules: pause control (`Pause background` / `Play background` toggle in the **app drawer footer**, persisted per device in `localStorage` key `gk.tide.paused`) + `prefers-reduced-motion: reduce` → layers static; content never sits on the moving part without a solid card behind it; ≤ 4 animated layers per screen (implemented: 3 waves + 1 light pool; the sand pool is static; no blur filter); `will-change: transform` only on the wave layers; no backdrop-filter on scrolling lists.

Implementation decisions (D7):
- Animated tide on **every** family screen (revised 2026-10-21 at the user's request; it was static outside home, child home and missions). Component: `app/(family)/chrome/tide-background.tsx`, preference: `tide-preference-context.tsx` (default playing). Motion stops only for the drawer pause toggle or `prefers-reduced-motion: reduce` (e.g. Windows "Animation effects" off).
- The pause toggle moved from Profile to the drawer: the drawer is reachable from every animated screen, including the child view, where Profile is not.
- The full-screen Hero variant (5) is **not** used as a screen background (screen text is ink on light). The **hero panel** of the preview Home is used on the family home (`/context-switch`) and the child home (`/child`): Deep Current → Ocean Depths gradient under the status bar, bottom radius 36px, two static foam waves, header + mission card inside. The hero stays fixed while the content below scrolls, so the hamburger always sits on it. The same gradient is used by the standalone mission card (cycle, mascot, surprise) and the admin home strip.

**Admin background** — static `--gk-bg` canvas; dashboard header strip uses the Deep Current → Ocean Depths gradient with one static wave silhouette. No ambient motion in the panel.

Gradients allowed (only these):
- `--grad-tide`: `linear-gradient(160deg, #0D5C63 0%, #127D86 100%)`
- `--grad-foam`: `linear-gradient(180deg, #F5FAFA 0%, #E0F2F3 100%)`
- `--grad-shore`: `linear-gradient(135deg, #F3ECE1 0%, #E0F2F3 100%)` (warm reward cards)
No multi-hue or rainbow gradients; no gradient text.

## 9. Components

Every interactive component defines five states: default · hover (pointer only) / pressed · focus-visible (2px `--gk-focus` ring, 2px offset) · active/selected · disabled (40% opacity content on `--gk-surface-2`, `cursor: not-allowed`, no shadow). Loading is a sixth state where relevant.

### 9.1 Buttons

| Variant | App | Admin |
|---------|-----|-------|
| Primary | Pill, 52px tall, `--gk-primary` fill, `--gk-on-primary` 16px/600, `--el-2` | 40px, `--r-sm`, 14px/600 |
| Warm (family CTA) | Pill, `--gk-warm` fill, `--gk-on-warm`, inset highlight — one per screen max | not used |
| Secondary | Pill, `--gk-surface` fill, 1.5px `--gk-border-strong`, `--gk-primary` text | 40px, 1px border |
| Ghost | Transparent, `--gk-link` text, 44px | 36px |
| Danger | `--gk-danger` fill, white text; confirm in sheet/modal | same |
| Icon | 44px circle, `--gk-surface-2` | 36px square `--r-sm` |

Press: `scale(0.98)`, 120ms. Loading: label stays, spinner replaces leading icon, width unchanged.

### 9.2 Inputs

- App: 52px, `--r-md`, `--gk-surface`, 1.5px `--gk-border-strong`; label above (14px/600), helper below (14px muted); focus = border `--gk-link` + focus ring; error = border + text `--gk-danger` + icon.
- Admin: 40px, `--r-sm`, 1px border; inline search with leading icon; select, textarea (min 96px), checkbox 18px `--r-xs`, radio 18px, switch 44 × 26 pill (thumb animates `transform`).

### 9.3 Cards

- **Pebble card (app)**: `--r-lg`, `--gk-surface`, `--el-2` + `--el-inset`, padding 20; optional 48px icon well at top-left; title 18/700, body 14 muted; whole card tappable (single primary action) with chevron.
- **Mission card (app)**: `--r-xl`, `--grad-tide` fill, white text (4.9 on Ocean Depths; Wave Foam is only 4.2 there, so foam text is limited to the Deep Current half or large text), mascot glyph, typewriter mission copy (slow then fast, existing strategy), warm CTA "Start mission".
- **Reward card**: `--grad-shore`, sand icon well, Jhey celebration on completion.
- **Tile grid**: 2-column grid of square pebbles (mirrors the 3 × 2 tiles of `mobile-design.png`), 16 gap.
- **Admin card**: `--r-md`, `--gk-surface`, 1px `--gk-border`, `--el-0`/`--el-1`; header row (title 16/700 + actions).
- **KPI card (admin)**: caption label, `--fs-kpi` value, delta badge (icon + %), optional sparkline (single series, no legend).

### 9.4 Navigation

- **Status bar (app)**: 56px, `9:41` + signal/battery glyphs, ink (white over the hero), drawn by the chrome above every screen.
- **App header**: transparent over tide, min 60px under the status bar; sub line 14px muted above the title (Fraunces 24/600); **hamburger top-right inside the bezel** (harness `feature-parent-shell`): 44px, `--r-md`, `--gk-surface` + `--el-1` (over the hero: `--app-hero-control` fill, white glyph), right 20px, aligned with the header row (top 63px). It turns into the drawer's close button when open.
- **App drawer**: slides from the right, 84% width (max 360), `--el-3`, 32px radius on the leading corners; title "Menu" (Fraunces 22) in the header row; items 56px, 6px apart, 24px `regular` glyph in `--gk-link` + 17px/600 label, current page on `--gk-surface-2`; nav: **Home** (first), Quiz, Calendar, Forecast, Surprise, Cycle, Diary; footer (top border): "View as child" switch, Profile, Plan, Sign out, then the tide Pause/Play toggle (D7). Enter 280ms `cubic-bezier(0.16,1,0.3,1)` translateX; exit 180ms ease-in; scrim opacity; Esc closes.
- **Bottom action bar (app)**: docked at the bottom of the screen (padding 28/20/30) over a `--gk-bg` fade, holds the screen's single primary CTA (full-width pill, optional ghost "Skip" on the left); the scroll area reserves 132px under it. Screens without a primary action (home, forecast, completed, profile) have no bar.
- **Tab bar (app)**: specified (5 items max, 64px + safe area, active = Sea Mist pill behind icon + label) but **not adopted** (decision D4) — the harness (`feature-parent-shell.md`) mandates the hamburger drawer.
- **Admin sidebar**: 264px (collapsible to 72px icon rail at < 1280px, off-canvas sheet at < 1024px), `--adm-sidebar` fill, brand at top, grouped items (Content: Catalog, Materials, Questions, Contexts · People: Families, Users · Business: Plans, Indicators), active item with 3px Sea Mist bar.
- **Admin top bar**: 64px, page title + breadcrumbs left, search, role badge, surface mode switch, user menu right. Implemented: menu toggle (< 1024px), breadcrumb `Staff panel / <section>`, **theme toggle** (Light/Dark pill with sun/moon glyph; sets `data-theme` on the panel root, remembered per device in `localStorage` key `gk.panel.theme`, default light; label collapses to the glyph under 640px), User/Admin surface switch. Search, role badge and user menu are not built yet (no behavior behind them; the role switch stays in each page's Session toolbar).

### 9.4.1 Family screen kit (implemented)

Every family screen is drawn from the preview phones (section 06) with one shared kit, so screens stay consistent:

| Piece | Where | Preview structure |
|-------|-------|-------------------|
| Screen layout | `app/(family)/chrome/family-thumb-shell.tsx` | header (sub + title) or hero → scroll (20px gutter, 24px gap) → bottom action bar |
| Component styles | `app/(family)/chrome/family-ui-styles.ts` (`data-gk-*` hooks, injected once by the chrome) | buttons, pebble cards, tiles, wells, avatars, list rows, badges, chips, alerts, fields, week strip, progress, question card, choices, bottom sheet |
| Components | `app/(family)/chrome/family-ui.tsx` | `Well`, `MascotGlyph`, `HeroWaves`, `TypewriterCopy` (native strategy, D10), `StateCard`, `LoadingCard`, `initialsOf` |
| Week strip | `app/(family)/chrome/family-week.tsx` | 7-day strip (Monday first) with week paging, `StatusBadge` |

Screen mapping (presentation only; routes, data and APIs unchanged):

| Screen | Preview structures used |
|--------|-------------------------|
| Home `/context-switch` — **Parent landing** (User surface switch, "View as child" off and drawer Home all land here) | Hero with greeting + date, today's mission card (first scheduled mission of today's calendar day, else the accepted mission; typewriter; warm "Start mission" + ghost "Surprise"), "This week" pebble tiles with counts from existing endpoints (planned today, completed, quiz questions, diary notes; a tile is omitted when its source fails), account-holder list rows, deny bottom sheet. Child landing stays `/child`. |
| Child home `/child` | Hero + chosen mission card, list rows, reward card for the latest note, warm "Add a note" → bottom sheet |
| Calendar | Month label with prev/next week circles, week strip where **only today** is filled (primary pill); other days ink on no background, the selected day gets a 1.5px link ring, a dot marks days with missions; day list rows with status badges, "Add a mission" → bottom sheet (schedule / move) |
| Quiz | Progress + "Question i of n", question card (well + Fraunces question), mode choices (Solo / At the table) as large radio choices, answer field, Skip + "Save answer" |
| Forecast | Week strip, idea rows with "Place", placed cards with status, rhythm bottom sheet |
| Diary | Note cards with kind badges, "Add note" → bottom sheet with kind chips |
| Cycle / Mascot / Surprise | Standalone mission card (tide gradient, mascot, typewriter), step progress, single CTA in the bar |
| Completed / Profile / Plan | List rows with badges; GPS count tiles + fact cards + edit/delete sheets; plan choices + invite card |

Not mapped (no existing family-side source): the "Your family" initials row of the preview Home — family members have no GET endpoint (`/api/families/[id]/members` is PUT only), so the row is omitted until the backend exposes one. Rewards/celebration motion runs on reward cards (`gk-celebrate`, 480ms playful).

### 9.5 Lists

- App list row: 64px min, leading 40px avatar/icon well, title 16/600, meta 14 muted, trailing chevron or badge; dividers inset 72px; swipe actions not used (provide buttons).
- Avatars: initials on a tinted circle (Sea Mist/Sand alternation by member index). **Never child photos** (INV-002).

### 9.6 Chips, badges, segmented control

- Chip (filter/choice): 36px (app 40px) pill, `--gk-surface` + 1px border; selected = `--gk-primary` fill + on-primary text + check icon.
- Badge: 22px pill, 12px/600, soft status pairs from §4.3 + leading icon (never color-alone). Neutral badge = `--gk-surface-2` + `--gk-ink-muted`.
- Segmented control: pill track `--gk-surface-2`, selected segment `--gk-surface` + `--el-1`, indicator slides with `transform`.

### 9.7 Modals, sheets, toasts

- App: **bottom sheet** is the default modal: `--r-xl` top corners, grab handle, `--el-3`, max 90% height; enter translateY(24px)+opacity 280ms; exit 180ms. Confirmations = sheet with two stacked full-width buttons (primary bottom = thumb zone).
- Admin: centered dialog 480/640px, `--r-md`, `--el-3`, scrim `rgba(7,28,31,.48)`; enter scale(0.97)+opacity 240ms; destructive = danger button right, Cancel left; focus trap, Esc closes.
- Toast: bottom center (app, above action bar) / bottom right (admin), 4s, pause on hover/focus, icon + text + optional action.

### 9.8 Tables (admin)

- Header 44px, `--gk-surface-2`, caption 12/600 uppercase muted; rows 52px, 1px bottom border; numeric columns right-aligned tabular; row hover `--adm-row-hover`; selected `--adm-row-selected`; sticky header; row actions as visible icon buttons (no hover-only reveal); status as badge; empty state (icon well + one line + action); skeleton rows while loading; pagination footer.
- Under 768px: the table sits in a horizontal scroll container inside its card (never page scroll) or collapses to stacked cards for 3–4 key fields.

### 9.9 Feedback states

- Loading: skeleton blocks with a 1.2s opacity shimmer (no width animation); app full-screen loading = tide + mascot bob.
- Empty: icon well + title + one sentence + action.
- Error: danger soft alert with retry.

## 10. Motion tokens

| Token | Value |
|-------|-------|
| `--dur-micro` | 120ms |
| `--dur-ui` | 240ms |
| `--dur-enter` | 300ms |
| `--dur-exit` | 180ms |
| `--dur-celebrate` | 480ms |
| `--ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` |
| `--ease-state` | `cubic-bezier(0.42, 0, 0.58, 1)` |
| `--ease-playful` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `--stagger` | 50ms (app lists), 0 (admin tables) |

Recipes: view enter = opacity + translateY(8px); exit = opacity + translateY(4px); celebrate = opacity + scale(0.9→1) + rotate(−3deg→0) with playful ease. Animate `transform` and `opacity` only. Global reduced-motion guard required on both surfaces.

## 11. Breakpoints and containers

No CSS framework is in the stack (vanilla CSS vars in `<style>` blocks), so the system adopts Tailwind-default names as plain media queries:

| Name | Min width | Admin behavior |
|------|-----------|----------------|
| base | 0 | Sidebar off-canvas, 16px gutter, KPI 1 column |
| sm | 640px | KPI 2 columns |
| md | 768px | Tables full layout |
| lg | 1024px | Sidebar as 72px rail |
| xl | 1280px | Sidebar expanded 264px, KPI 4 columns |
| 2xl | 1536px | Content max 1440 inside the 1920 shell |

- Site wrapper: `max-width: 1920px; margin-inline: auto` on both surfaces (family desk + panel shell).
- Family app: fixed logical phone screen 430 × 932, chrome scaled to fit `100dvh` (unchanged harness behavior). Inside the screen, layouts are single-column.

## 12. Accessibility checklist

- Text ≥ 4.5:1, large text and UI boundaries ≥ 3:1 (all tokens above verified).
- Focus visible on every control; never removed by motion.
- Targets ≥ 44px (app), ≥ 24px floor / 36px design (admin).
- Status = icon + label; charts = legend + direct labels + table view.
- `prefers-reduced-motion` and a user pause for the ambient tide.
- `lang="en"`; all labels English.

## 13. Do not

- Import Flowbite (reference only). Add Redux/Zustand. Add a CSS framework without approval.
- Use the phone frame on panel routes, or render family screens unframed.
- Show child photos (INV-002).
- Use Coastal Haze for text or input borders; use Sea Mist text on white.
- Use status colors as chart series; dual-axis charts.
- Use rainbow/multi-hue gradients, gradient text, glassmorphism on content.

---

## 14. Implementation map

| Concern | Where it lives |
|---------|----------------|
| Token source (single source of truth in code) | `app/design-system/tokens.ts` → `TOKENS_STYLES` (light on `:root`; dark only under `[data-theme="dark"]`, D5) + `REDUCED_MOTION_STYLES`, injected once in `app/layout.tsx` |
| Framework-agnostic copy | `Design-System/tokens.css` (generated from `tokens.ts`; never edited by hand) |
| Fonts | `app/design-system/fonts.ts` + `app/design-system/fonts/*.woff2` |
| Icons | `app/design-system/icons.ts` (Phosphor re-exports); admin table glyphs wrapped in `app/(panel)/shell/panel-icons.tsx` |
| Family shell | `app/(family)/layout.tsx` (desk, display headings), `app/(family)/chrome/*` (bezel, status bar, tide, drawer, mode switch, screen kit §9.4.1) |
| Admin shell | `app/(panel)/layout.tsx` + `app/(panel)/shell/panel-frame.tsx` (sidebar 264 / rail 72 / off-canvas), `panel-screen-styles.ts` (buttons, inputs, tables, chips), `panel-theme.tsx` (panel root with `data-theme` + top-bar theme toggle) |
| Visual check | `tests/e2e/*.e2e.ts` (Playwright, `npm run test:e2e`): family screens at 430 × 932 against the preview structures, panel smoke + theme toggle; screenshots of the app and of the preview phones (1:1) in `test-results/screens/` |

Rules for contributors:
- Components use `var(--gk-*)`, `var(--app-*)` (family), `var(--adm-*)` (panel), `var(--viz-*)` (charts) and the static `--r-*`, `--sp-*`, `--fs-*`, `--el-*`, `--dur-*`, `--ease-*` tokens. **No hex values outside `app/design-system/`.** Legacy `--color-*` names were removed.
- Fallback lines for `color-mix()` (older Safari) use a token, never a hex.
- New tokens are added in `tokens.ts` first, then `tokens.css` is regenerated and this file updated.

Decision log (approved 2026-10-21):

| # | Decision | Result |
|---|----------|--------|
| D1 | Palette roles | As §4 (Deep Current primary light, Sea Mist primary dark, Sand single warm CTA) |
| D2 | Icons | Phosphor `@phosphor-icons/react` 2.1.10 |
| D3 | Fonts | Self-hosted woff2 via `next/font/local` (network-free build) |
| D4 | Navigation | Hamburger drawer kept (harness); tab bar not adopted |
| D5 | Dark mode | Revised 2026-10-21: **light only by default** on both surfaces; no `prefers-color-scheme` switching. Dark tokens kept and applied only under `[data-theme="dark"]`; the admin panel has a Light/Dark toggle in its top bar (per device, default light). The family app is always light. |
| D6 | Admin navigation | Left sidebar with Content / People / Business groups |
| D7 | Ambient tide | Revised 2026-10-21: animated on every family screen; pause in drawer; reduced motion honoured |
| D8 | FlutterFlow reference | Not readable; interpreted from `inspiratons.md` and `Design-System/assets/mobile-design.png` |
| D9 | Harness docs | Root `MASTER.md` mirrors this file; `coding_convention.md` UI line updated by user request |
| D10 | Typewriter | Native strategy kept (`typewriter-reveal-strategy.ts`), no library; harness updated to match |

