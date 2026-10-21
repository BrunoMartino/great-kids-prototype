/**
 * Shared family-app components, drawn from `Design-System/design-system-preview.html`
 * (section 05 Components + 06 Family app). Every family screen composes these
 * `data-gk-*` hooks; screen files only add what is unique to them.
 * Injected once by the phone chrome (`phone-chrome-decorator.tsx`).
 */
export const FAMILY_UI_STYLES: string = `
[data-gk-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}
[data-gk-screen-frame] {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}
[data-gk-head] {
  position: relative;
  z-index: 5;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  justify-content: center;
  gap: 0;
  min-height: 60px;
  padding: 4px 76px 8px 20px;
}
[data-gk-head] h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  font-variation-settings: "SOFT" 100, "WONK" 0;
  letter-spacing: 0;
  color: var(--gk-ink);
}
[data-gk-sub] {
  margin: 0;
  color: var(--gk-ink-muted);
  font-size: 14px;
  line-height: 1.5;
}
[data-gk-scroll] {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 24px;
  min-height: 0;
  padding: 4px 20px 40px;
  overflow-x: hidden;
  overflow-y: auto;
  overflow-anchor: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
[data-gk-scroll]::-webkit-scrollbar {
  display: none;
}
[data-gk-screen][data-gk-has-actions="true"] [data-gk-scroll] {
  padding-bottom: 132px;
}
[data-gk-scroll] > * {
  flex: 0 0 auto;
}
[data-gk-stack] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
[data-gk-row-inline] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
fieldset:is([data-gk-stack], [data-gk-chips], [data-gk-week]) {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
[data-gk-visually-hidden] {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}
[data-gk-enter] {
  animation: gk-enter var(--dur-enter) var(--ease-enter) both;
}
@keyframes gk-celebrate {
  from { opacity: 0; transform: scale(0.9) rotate(-3deg); }
  to { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes gk-enter {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}

/* Section heading */
[data-gk-sec] {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin: 0;
  color: var(--gk-ink);
  font-family: var(--font-sans);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0;
}
[data-gk-sec] a,
[data-gk-sec] button {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--gk-link);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
[data-gk-caption] {
  margin: 0;
  color: var(--gk-ink-muted);
  font-size: 14px;
  line-height: 1.5;
}

/* Icon wells */
[data-gk-well] {
  display: inline-grid;
  flex: none;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--app-mission-well);
  color: var(--gk-primary);
}
[data-gk-well][data-tone="warm"] {
  background: var(--gk-surface-warm);
  color: var(--app-child);
}
[data-gk-well][data-size="sm"] {
  width: 40px;
  height: 40px;
}

/* Avatars: initials only, never photos (INV-002) */
[data-gk-avatar] {
  display: inline-grid;
  flex: none;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gk-surface-2);
  color: var(--gk-primary);
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}
[data-gk-avatar][data-tone="sand"] {
  background: var(--gk-surface-warm);
  color: var(--gk-ink);
}
[data-gk-members] {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
[data-gk-member] {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 64px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--gk-ink-muted);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
[data-gk-member] [data-gk-avatar] {
  width: 56px;
  height: 56px;
  font-size: 18px;
  box-shadow: var(--el-1);
}

/* Buttons */
[data-gk-btn] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 52px;
  margin: 0;
  padding: 0 22px;
  border: 0;
  border-radius: var(--r-pill);
  font: inherit;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform var(--dur-micro) var(--ease-enter), box-shadow var(--dur-micro) var(--ease-enter), background-color var(--dur-micro) var(--ease-state);
}
[data-gk-btn]:active {
  transform: scale(0.98);
}
[data-gk-btn="primary"] {
  background: var(--gk-primary);
  color: var(--gk-on-primary);
  box-shadow: var(--el-2);
}
[data-gk-btn="warm"] {
  background: var(--gk-warm);
  color: var(--gk-on-warm);
  box-shadow: var(--el-2), var(--el-inset);
}
[data-gk-btn="secondary"] {
  background: var(--gk-surface);
  color: var(--gk-primary);
  box-shadow: inset 0 0 0 1.5px var(--gk-border-strong);
}
[data-gk-btn="ghost"] {
  min-height: 44px;
  padding: 0 14px;
  background: transparent;
  color: var(--gk-link);
}
[data-gk-btn="ghost"][data-kind="danger"] {
  color: var(--gk-danger-ink);
}
[data-gk-btn="danger"] {
  background: var(--gk-danger);
  color: var(--gk-on-primary);
}
[data-gk-btn][data-size="sm"] {
  min-height: 40px;
  padding: 0 16px;
  font-size: 14px;
}
[data-gk-btn]:disabled,
[data-gk-btn][aria-disabled="true"] {
  background: var(--gk-surface-2);
  color: var(--gk-ink-subtle);
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}
[data-gk-btn="ghost"]:disabled {
  background: transparent;
}
@media (hover: hover) and (pointer: fine) {
  [data-gk-btn="primary"]:not(:disabled):hover {
    background: var(--gk-primary-hover);
    box-shadow: var(--el-3);
  }
  [data-gk-btn="ghost"]:not(:disabled):hover {
    background: var(--gk-surface-2);
  }
}
:is([data-gk-btn], [data-gk-pebble], [data-gk-row], [data-gk-chip], [data-gk-choice], [data-gk-day], [data-gk-member], [data-gk-sec] a, [data-gk-sec] button, [data-gk-input]):focus-visible {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}

/* Action bar: the screen's primary CTA, in the thumb zone */
[data-gk-action-bar] {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 6;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 28px 20px 30px;
  background: linear-gradient(to top, var(--gk-bg) 62%, transparent);
  pointer-events: none;
}
[data-gk-action-bar] > * {
  pointer-events: auto;
}
[data-gk-action-row] {
  display: flex;
  gap: 12px;
}
[data-gk-action-row] > [data-gk-btn] {
  flex: 1 1 0;
  min-width: 0;
}
[data-gk-action-row] > [data-gk-btn="ghost"] {
  flex: 0 0 auto;
}

/* Cards */
[data-gk-card],
[data-gk-pebble] {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  margin: 0;
  padding: 20px;
  border: 0;
  border-radius: var(--r-lg);
  background: var(--app-card);
  box-shadow: var(--app-card-shadow);
  color: var(--gk-ink);
  font: inherit;
  text-align: left;
  text-decoration: none;
}
[data-gk-card] :is(h2, h3),
[data-gk-pebble] :is(h2, h3) {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0;
  color: var(--gk-ink);
}
[data-gk-card] p,
[data-gk-pebble] p {
  margin: 0;
  color: var(--gk-ink-muted);
  font-size: 14px;
  line-height: 1.5;
}
[data-gk-pebble] {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--dur-micro) var(--ease-enter), box-shadow var(--dur-micro) var(--ease-enter);
}
[data-gk-pebble]:active {
  transform: scale(0.98);
  box-shadow: var(--el-1);
}
@media (hover: hover) and (pointer: fine) {
  [data-gk-pebble]:hover {
    transform: translateY(-2px);
    box-shadow: var(--el-3);
  }
}
[data-gk-go] {
  position: absolute;
  top: 20px;
  right: 16px;
  color: var(--gk-ink-subtle);
}
[data-gk-tiles] {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
[data-gk-tiles] [data-gk-pebble] {
  min-height: 150px;
}
[data-gk-num] {
  color: var(--gk-ink);
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
[data-gk-reward] {
  animation: gk-celebrate var(--dur-celebrate) var(--ease-playful) both;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border-radius: var(--r-lg);
  background: var(--gk-surface-warm);
  background: var(--grad-shore);
  box-shadow: var(--el-1);
}
[data-gk-reward] :is(h2, h3) {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0;
}
[data-gk-reward] p {
  margin: 0;
  color: var(--gk-ink-muted);
  font-size: 14px;
}

/* Hero (home) and mission card */
[data-phone-chrome] [data-phone-body]:has([data-gk-hero]) {
  padding-top: 0;
}
[data-gk-hero] {
  position: relative;
  flex: 0 0 auto;
  padding: 56px 0 28px;
  overflow: hidden;
  border-radius: 0 0 36px 36px;
  background: var(--app-hero-from);
  background: var(--grad-tide);
  color: var(--app-on-hero);
}
[data-gk-hero] [data-gk-head] {
  padding-bottom: 4px;
}
[data-gk-hero] [data-gk-head] h1 {
  color: var(--app-on-hero);
}
[data-gk-hero] [data-gk-sub] {
  color: var(--app-on-hero-muted);
}
[data-gk-hero-waves] {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  height: 46%;
  color: var(--app-foam-wave);
  pointer-events: none;
}
[data-gk-hero-waves] svg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
}
[data-gk-hero-waves] svg + svg {
  height: 64%;
}
[data-gk-mission] {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
  padding: 22px;
  border-radius: var(--r-xl);
  background: var(--app-hero-from);
  background: var(--grad-tide);
  box-shadow: var(--el-3);
  color: var(--app-on-hero);
}
[data-gk-hero] [data-gk-mission] {
  margin: 12px 20px 0;
  background: var(--app-hero-glass);
  box-shadow: inset 0 1px 0 var(--app-hero-glass-hi);
}
[data-gk-eyebrow] {
  margin: 0;
  color: var(--app-on-hero-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.4;
  text-transform: uppercase;
}
[data-gk-mission-top] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
[data-gk-mission-copy] {
  min-height: 3.9em;
  margin: 0;
  color: var(--app-on-hero);
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  line-height: 1.3;
  font-variation-settings: "SOFT" 100, "WONK" 0;
}
[data-gk-caret] {
  display: inline-block;
  width: 2px;
  height: 1.05em;
  margin-left: 2px;
  vertical-align: -0.15em;
  background: currentColor;
  animation: gk-blink 1s steps(1) infinite;
}
@keyframes gk-blink {
  50% { opacity: 0; }
}
[data-gk-mission] [data-gk-btn="ghost"] {
  color: var(--app-on-hero);
}
[data-gk-mascot] {
  flex: none;
  width: 48px;
  height: 48px;
}
[data-gk-mascot] [data-part="body"] { fill: var(--gk-accent); }
[data-gk-mascot] [data-part="belly"] { fill: var(--gk-warm); }
[data-gk-mascot] [data-part="eye"] { fill: var(--gk-ink); }
[data-gk-mascot] [data-part="shine"] { fill: var(--gk-surface); }
[data-gk-mascot] [data-part="smile"] { fill: none; stroke: var(--gk-ink); stroke-width: 2.4; stroke-linecap: round; }
[data-gk-mascot] [data-part="ears"] { fill: none; stroke: var(--gk-primary); stroke-width: 3; stroke-linecap: round; }

/* Lists */
[data-gk-list] {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--r-lg);
  background: var(--gk-surface);
  box-shadow: var(--el-1);
}
[data-gk-row] {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 64px;
  margin: 0;
  padding: 10px 16px;
  border: 0;
  background: transparent;
  color: var(--gk-ink);
  font: inherit;
  text-align: left;
  text-decoration: none;
}
:is(a, button)[data-gk-row] {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
[data-gk-row] + [data-gk-row]::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  left: 70px;
  height: 1px;
  background: var(--gk-border);
}
[data-gk-row] [data-gk-well] {
  width: 40px;
  height: 40px;
}
[data-gk-row-text] {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}
[data-gk-row-text] strong {
  overflow-wrap: anywhere;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}
[data-gk-row-text] span {
  color: var(--gk-ink-muted);
  font-size: 14px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}
[data-gk-row-trail] {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
  color: var(--gk-ink-subtle);
}
@media (hover: hover) and (pointer: fine) {
  :is(a, button)[data-gk-row]:hover {
    background: var(--gk-bg);
  }
}

/* Badges, chips, alerts */
[data-gk-badge] {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 24px;
  padding: 0 10px 0 8px;
  border-radius: var(--r-pill);
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}
[data-gk-badge="info"] { background: var(--gk-surface-2); color: var(--gk-link); }
[data-gk-badge="success"] { background: var(--gk-success-soft); color: var(--gk-success-ink); }
[data-gk-badge="warning"] { background: var(--gk-warning-soft); color: var(--gk-warning-ink); }
[data-gk-badge="danger"] { background: var(--gk-danger-soft); color: var(--gk-danger-ink); }
[data-gk-badge="neutral"] { background: var(--gk-surface-2); color: var(--gk-ink-muted); }
[data-gk-badge="warm"] { background: var(--gk-surface-warm); color: var(--app-child); }
[data-gk-chips] {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
[data-gk-chip] {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  margin: 0;
  padding: 0 16px;
  border: 1px solid var(--gk-border-strong);
  border-radius: var(--r-pill);
  background: var(--gk-surface);
  color: var(--gk-ink);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background-color var(--dur-micro) var(--ease-state), color var(--dur-micro) var(--ease-state), transform var(--dur-micro) var(--ease-enter);
}
[data-gk-chip]:active {
  transform: scale(0.97);
}
[data-gk-chip][aria-pressed="true"] {
  border-color: var(--gk-primary);
  background: var(--gk-primary);
  color: var(--gk-on-primary);
}
[data-gk-chip] [data-gk-check] {
  display: none;
}
[data-gk-chip][aria-pressed="true"] [data-gk-check] {
  display: block;
}
[data-gk-alert] {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 0;
  padding: 14px 16px;
  border-radius: var(--r-md);
  font-size: 15px;
  line-height: 1.45;
}
[data-gk-alert] strong {
  display: block;
}
[data-gk-alert] svg {
  flex: none;
}
[data-gk-alert="info"] { background: var(--gk-surface-2); color: var(--gk-ink); }
[data-gk-alert="info"] svg { color: var(--gk-link); }
[data-gk-alert="success"] { background: var(--gk-success-soft); color: var(--gk-success-ink); }
[data-gk-alert="danger"] { background: var(--gk-danger-soft); color: var(--gk-danger-ink); }

/* Fields */
[data-gk-field] {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  color: var(--gk-ink);
  font-size: 14px;
  font-weight: 600;
}
[data-gk-input] {
  width: 100%;
  min-height: 52px;
  margin: 0;
  padding: 0 16px;
  border: 1.5px solid var(--gk-border-strong);
  border-radius: var(--r-md);
  background: var(--gk-surface);
  box-shadow: var(--el-1);
  color: var(--gk-ink);
  font: inherit;
  font-size: 16px;
  font-weight: 400;
  -webkit-appearance: none;
  appearance: none;
  transition: border-color var(--dur-micro) var(--ease-state), box-shadow var(--dur-micro) var(--ease-state);
}
select[data-gk-input] {
  padding-right: 40px;
  background-image: linear-gradient(45deg, transparent 50%, var(--gk-ink-muted) 50%), linear-gradient(135deg, var(--gk-ink-muted) 50%, transparent 50%);
  background-position: calc(100% - 22px) 50%, calc(100% - 16px) 50%;
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
}
textarea[data-gk-input] {
  min-height: 112px;
  padding: 14px 16px;
  resize: vertical;
  line-height: 1.5;
}
[data-gk-input]:focus {
  outline: none;
  border-color: var(--gk-link);
  box-shadow: 0 0 0 3px var(--gk-surface-2);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--gk-focus) 28%, transparent);
}

/* Calendar week strip */
[data-gk-week-head] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
[data-gk-icon-btn] {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--gk-surface-2);
  color: var(--gk-ink);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
[data-gk-icon-btn]:focus-visible {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
[data-gk-week] {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}
[data-gk-day] {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
  margin: 0;
  padding: 10px 0;
  border: 0;
  border-radius: 18px;
  background: transparent;
  color: var(--gk-ink);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--dur-micro) var(--ease-state), box-shadow var(--dur-micro) var(--ease-state), transform var(--dur-micro) var(--ease-enter);
}
[data-gk-day]:active {
  transform: scale(0.96);
}
[data-gk-day] b {
  font-size: 18px;
  font-variant-numeric: tabular-nums;
}
[data-gk-day] i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
}
[data-gk-day][data-marked="true"] i {
  background: var(--gk-accent);
}
[data-gk-day][aria-pressed="true"] {
  box-shadow: inset 0 0 0 1.5px var(--gk-link);
}
[data-gk-day][data-today="true"] {
  background: var(--gk-primary);
  box-shadow: var(--el-1);
  color: var(--gk-on-primary);
}
[data-gk-day][data-today="true"] i {
  background: transparent;
}
[data-gk-day][data-today="true"][data-marked="true"] i {
  background: var(--gk-warm);
}
@media (hover: hover) and (pointer: fine) {
  [data-gk-day]:not([data-today="true"]):hover {
    background: var(--gk-surface-2);
  }
}

/* Quiz */
[data-gk-progress-meta] {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--gk-ink-muted);
  font-size: 14px;
  font-weight: 600;
}
[data-gk-progress] {
  height: 8px;
  overflow: hidden;
  border-radius: var(--r-pill);
  background: var(--gk-surface-2);
}
[data-gk-progress] > i {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: var(--gk-link);
  transform-origin: left center;
  transition: transform var(--dur-ui) var(--ease-enter);
}
[data-gk-qcard] {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: var(--r-xl);
  background: var(--app-card);
  box-shadow: var(--app-card-shadow);
}
[data-gk-qcard] > :is(h2, h3) {
  margin: 0;
  color: var(--gk-ink);
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.25;
  font-variation-settings: "SOFT" 100, "WONK" 0;
  letter-spacing: 0;
}
[data-gk-choice] {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 60px;
  margin: 0;
  padding: 12px 16px;
  border: 1.5px solid var(--gk-border-strong);
  border-radius: var(--r-md);
  background: var(--gk-surface);
  color: var(--gk-ink);
  font: inherit;
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: border-color var(--dur-micro) var(--ease-state), background-color var(--dur-micro) var(--ease-state);
}
[data-gk-radio] {
  display: grid;
  flex: none;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 2px solid var(--gk-border-strong);
  border-radius: 50%;
}
[data-gk-choice][aria-pressed="true"] {
  border-color: var(--gk-link);
  background: var(--gk-surface-2);
}
[data-gk-choice][aria-pressed="true"] [data-gk-radio] {
  border-color: var(--gk-link);
}
[data-gk-choice][aria-pressed="true"] [data-gk-radio]::after {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--gk-link);
}
[data-gk-choice-text] {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
[data-gk-choice-text] small {
  color: var(--gk-ink-muted);
  font-size: 14px;
  font-weight: 400;
}

/* Loading */
[data-gk-skeleton] {
  height: 14px;
  border-radius: var(--r-pill);
  background: var(--gk-surface-2);
  animation: gk-shimmer 1.2s var(--ease-state) infinite alternate;
}
[data-gk-skeleton][data-w="short"] { width: 55%; }
@keyframes gk-shimmer {
  from { opacity: 0.45; }
  to { opacity: 1; }
}

/* Bottom sheet */
[data-gk-sheet-backdrop] {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: var(--gk-scrim);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--dur-exit) var(--ease-exit);
}
[data-gk-sheet-backdrop][data-open="true"] {
  opacity: 1;
  pointer-events: auto;
  transition: opacity var(--dur-drawer) var(--ease-enter);
}
[data-gk-sheet] {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 90%;
  margin: 0;
  padding: 12px 22px 36px;
  overflow-y: auto;
  border-radius: 32px 32px 0 0;
  background: var(--gk-surface);
  box-shadow: var(--el-3);
  color: var(--gk-ink);
  transform: translate3d(0, 104%, 0);
  transition: transform var(--dur-exit) var(--ease-exit);
  scrollbar-width: none;
}
[data-gk-sheet-backdrop][data-open="true"] [data-gk-sheet] {
  transform: translate3d(0, 0, 0);
  transition: transform var(--dur-drawer) var(--ease-enter);
}
[data-gk-grab] {
  flex: none;
  align-self: center;
  width: 40px;
  height: 5px;
  border-radius: 3px;
  background: var(--gk-border-strong);
  opacity: 0.6;
}
[data-gk-sheet] :is(h2, h3) {
  margin: 0;
  color: var(--gk-ink);
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0;
}
[data-gk-sheet] p {
  margin: 0;
  color: var(--gk-ink-muted);
  font-size: 15px;
  line-height: 1.5;
}
[data-gk-sheet] [data-gk-btn] {
  width: 100%;
}
[data-gk-sheet] > [data-gk-badge] {
  align-self: flex-start;
}

@media (prefers-reduced-motion: reduce) {
  [data-gk-enter],
  [data-gk-reward],
  [data-gk-caret],
  [data-gk-skeleton] {
    animation: none !important;
  }
}
`;
