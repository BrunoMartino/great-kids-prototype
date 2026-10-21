# Design-System — Tidal

The official design system of Great Kids: one coastal palette, two surfaces (the family app inside the iPhone chrome and the admin panel). The spec is `MASTER.md`; this folder is what gets committed and reviewed.

| File | What it is |
|------|------------|
| `MASTER.md` | The spec: palette, semantic tokens, type, spacing, motion, components, decisions (§14). |
| `design-system-preview.html` | The approved visual preview. Standalone file: open it in a browser (it loads the fonts from Google Fonts only because it is standalone). |
| `tokens.css` | Framework-agnostic copy of every token, **generated** from the code. Never edit it by hand. |
| `assets/` | Source images: the Tidal palette and the mobile component reference. |

## Where the tokens live in the code

One source: `app/design-system/tokens.ts`.

- It holds three maps: `LIGHT_TOKENS`, `DARK_TOKENS` and `STATIC_TOKENS`. They are serialised into `TOKENS_STYLES`, which `app/layout.tsx` injects once.
- Light is the default and only automatic mode (MASTER D5): nothing follows `prefers-color-scheme`. Dark tokens apply only inside an element with `data-theme="dark"` (the admin panel top-bar toggle). The family app is always light.
- Fonts: `app/design-system/fonts.ts` loads the self-hosted woff2 files in `app/design-system/fonts/` with `next/font/local`, so `next build` needs no network.
- Icons: `app/design-system/icons.ts` re-exports the Phosphor icons in use. Import icons from that file only.

## How tokens map to code

| Prefix | Scope | Example |
|--------|-------|---------|
| `--gk-*` | Shared semantic colors, both surfaces | `--gk-primary`, `--gk-ink-muted`, `--gk-danger-soft` |
| `--app-*` | Family app only | `--app-child`, `--app-tide-1`, `--app-card` |
| `--adm-*` | Admin panel only | `--adm-sidebar`, `--adm-row-hover` |
| `--viz-*` | Chart series (fixed order) | `--viz-1` … `--viz-5` |
| `--r-*`, `--sp-*`, `--fs-*`, `--el-*`, `--dur-*`, `--ease-*`, `--z-*`, `--grad-*` | Radius, spacing, type scale, elevation, motion, z-scale, gradients | `--r-pill`, `--el-2`, `--ease-enter` |

Components write CSS in their `*_STYLES` strings using `var(--token)` only. Hex values are allowed only in `app/design-system/`.

## Changing a token

1. Edit `app/design-system/tokens.ts`.
2. Regenerate `tokens.css` from the repository root:

   ```bash
   node --experimental-strip-types -e 'import("./app/design-system/tokens.ts").then((m)=>process.stdout.write("/* Tidal design system tokens — GENERATED from app/design-system/tokens.ts. Do not edit by hand. */\n"+m.TOKENS_STYLES.trimStart()))' > Design-System/tokens.css
   ```

3. Update `MASTER.md` (and the preview if the change is visible) in the same change.
