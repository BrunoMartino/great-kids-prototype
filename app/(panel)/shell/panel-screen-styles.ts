export const PANEL_SCREEN_STYLES: string = `
/* One column for every panel screen: same left/right edges as Questions and Indicators (1120px, left-aligned). */
[data-panel-page] {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  width: 100%;
  max-width: 1120px;
  min-width: 0;
}
[data-panel-page] h1 {
  margin: 0;
  font-size: var(--fs-adm-h1);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}
[data-panel-page] h2 {
  margin: 0;
  font-size: var(--fs-adm-h2);
  font-weight: 700;
  line-height: 1.25;
}
[data-panel-page] p {
  margin: 0;
  color: var(--gk-ink-muted);
  line-height: 1.45;
}
[data-panel-role] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 28px;
  padding: 0 10px;
  border-radius: var(--r-pill);
  background: var(--gk-surface-2);
  color: var(--gk-ink);
  font-size: var(--fs-caption);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-panel-loading],
[data-panel-forbidden],
[data-panel-error],
[data-panel-success] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  opacity: 1;
  transform: translate3d(0, 0, 0);
  animation: panel-enter 200ms var(--ease-enter) both;
}
[data-panel-loading-bar] {
  width: 100%;
  height: 12px;
  border-radius: var(--r-pill);
  background: var(--gk-surface-2);
  transform-origin: left center;
  transform: translateZ(0);
  animation: panel-load 900ms ease-in-out infinite;
}
[data-panel-page] button,
[data-panel-page] select,
[data-panel-page] input {
  font: inherit;
  color: inherit;
}
[data-panel-page] button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  min-width: 36px;
  padding: 0 14px;
  border: 1px solid var(--gk-border-strong);
  border-radius: var(--r-sm);
  background: var(--gk-surface);
  color: var(--gk-primary);
  font-size: var(--fs-body-sm);
  font-weight: 600;
  cursor: pointer;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background-color var(--dur-micro) var(--ease-state), color var(--dur-micro) var(--ease-state), transform var(--dur-micro) var(--ease-state);
}
[data-panel-page] button::-moz-focus-inner {
  border: 0;
  padding: 0;
}
[data-panel-page] button[data-variant="primary"] {
  border-color: var(--gk-primary);
  background: var(--gk-primary);
  color: var(--gk-on-primary);
}
[data-panel-page] button[data-variant="danger"] {
  border-color: transparent;
  background: var(--gk-danger-soft);
  color: var(--gk-danger-ink);
}
[data-panel-page] button[data-icon="true"] {
  padding: 0;
  width: 36px;
  min-height: 36px;
  border-color: transparent;
  background: var(--gk-surface-2);
}
[data-panel-page] button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
[data-panel-page] button:active:not(:disabled) {
  transform: scale(0.98);
}
[data-panel-page] input,
[data-panel-page] select {
  min-height: 40px;
  width: 100%;
  padding: 0 12px;
  border: 1px solid var(--gk-border-strong);
  border-radius: var(--r-sm);
  background: var(--gk-surface);
  color: var(--gk-ink);
  font-size: 16px;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}
[data-panel-page] select {
  padding-right: 32px;
  background-color: var(--gk-surface);
  background-image:
    linear-gradient(45deg, transparent 50%, var(--gk-ink-muted) 50%),
    linear-gradient(135deg, var(--gk-ink-muted) 50%, transparent 50%);
  background-repeat: no-repeat;
  background-position: calc(100% - 17px) 50%, calc(100% - 12px) 50%;
  background-size: 5px 5px, 5px 5px;
}
[data-panel-page] input[type="file"] {
  height: 40px;
  padding: 4px 6px;
  font-size: var(--fs-body-sm);
}
[data-panel-page] input[type="file"]::file-selector-button,
[data-panel-page] input[type="file"]::-webkit-file-upload-button {
  margin-right: 8px;
  padding: 3px 10px;
  border: 0;
  border-radius: var(--r-sm);
  background: var(--gk-surface-2);
  color: var(--gk-primary);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
[data-panel-page] input[type="search"]::-webkit-search-decoration,
[data-panel-page] input[type="search"]::-webkit-search-cancel-button,
[data-panel-page] input[type="search"]::-webkit-search-results-button,
[data-panel-page] input[type="search"]::-webkit-search-results-decoration {
  -webkit-appearance: none;
}
[data-panel-page] button:focus,
[data-panel-page] input:focus,
[data-panel-page] select:focus {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
[data-panel-page] button:focus:not(:focus-visible),
[data-panel-page] input:focus:not(:focus-visible),
[data-panel-page] select:focus:not(:focus-visible) {
  outline: none;
}
[data-panel-page] button:focus-visible,
[data-panel-page] input:focus-visible,
[data-panel-page] select:focus-visible {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
[data-panel-form] {
  display: grid;
  gap: 12px;
  width: 100%;
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--gk-border);
  border-radius: var(--r-md);
  background: var(--gk-surface);
  box-shadow: var(--el-1);
}
[data-panel-field] {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
[data-panel-field] span {
  color: var(--gk-ink-muted);
  font-size: var(--fs-caption);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-panel-form-error] {
  color: var(--gk-danger-ink);
  font-size: var(--fs-body-sm);
}
[data-panel-table-wrap] {
  min-width: 0;
  width: 100%;
  overflow-x: auto;
  overflow-anchor: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--gk-border-strong) transparent;
  border: 1px solid var(--gk-border);
  border-radius: var(--r-md);
  background: var(--gk-surface);
  box-shadow: var(--el-1);
}
[data-panel-table] {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
}
[data-panel-table] caption {
  padding: 16px 16px 8px;
  color: var(--gk-ink-muted);
  font-size: var(--fs-body-sm);
  text-align: left;
}
[data-panel-table] th,
[data-panel-table] td {
  padding: 12px 16px;
  text-align: left;
  vertical-align: middle;
  overflow-wrap: break-word;
  overflow-wrap: anywhere;
}
[data-panel-table] th {
  color: var(--gk-ink-muted);
  font-size: var(--fs-caption);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  height: 44px;
  background: var(--gk-surface-2);
  border-bottom: 1px solid var(--gk-border);
}
[data-panel-table] td {
  height: 52px;
  border-bottom: 1px solid var(--gk-border);
  font-variant-numeric: tabular-nums;
}
[data-panel-table] tbody tr:last-child td {
  border-bottom: 0;
}
[data-panel-row] {
  opacity: 1;
  animation: panel-row-enter 200ms var(--ease-enter) both;
}
[data-panel-row-actions] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}
[data-file-button] {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  overflow: hidden;
  border-radius: var(--r-sm);
  background: var(--gk-surface-2);
  color: var(--gk-primary);
  cursor: pointer;
}
[data-file-button] input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  padding: 0;
  border: 0;
  font-size: 0;
  cursor: pointer;
}
[data-sr-only] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
[data-status-chip] {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: var(--r-pill);
  background: var(--gk-surface-2);
  color: var(--gk-ink-muted);
  font-size: var(--fs-caption);
  font-weight: 700;
}
[data-status-chip][data-status="active"],
[data-status-chip][data-status="Can-use"] {
  background: var(--gk-success-soft);
  color: var(--gk-success-ink);
}
[data-status-chip][data-status="blocked"],
[data-status-chip][data-status="inactive"],
[data-status-chip][data-status="Not-use"] {
  background: var(--gk-warning-soft);
  color: var(--gk-warning-ink);
}
[data-panel-empty] {
  padding: 24px 16px;
  color: var(--gk-ink-muted);
}
[data-tooltip] {
  position: relative;
}
[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  right: calc(100% + 8px);
  top: 50%;
  z-index: 3;
  padding: 6px 10px;
  border-radius: var(--r-sm);
  background: var(--gk-ink);
  color: var(--gk-on-primary);
  font-size: var(--fs-caption);
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transform: translate3d(4px, -50%, 0);
  transition: opacity var(--dur-micro) var(--ease-state), transform var(--dur-micro) var(--ease-state);
}
@keyframes panel-enter {
  from { opacity: 0; transform: translate3d(0, 4px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes panel-row-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes panel-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
@media (min-width: 768px) {
  /* Fields share one row and one baseline; the submit sits at the row end (was an invalid auto-fit + auto grid, so forms stacked). */
  [data-panel-form] {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
  }
  [data-panel-form] > [data-panel-field] {
    flex: 1 1 160px;
  }
  [data-panel-form] > button {
    flex: 0 0 auto;
  }
  [data-panel-form] > [data-panel-form-error] {
    flex: 1 1 100%;
  }
}
@media (hover: hover) and (pointer: fine) {
  [data-tooltip]:hover::after {
    opacity: 1;
    transform: translate3d(0, -50%, 0);
  }
  [data-panel-page] button:hover:not(:disabled) {
    background: var(--gk-surface-2);
  }
  [data-panel-page] button[data-variant="primary"]:hover:not(:disabled) {
    border-color: var(--gk-primary-hover);
    background: var(--gk-primary-hover);
    color: var(--gk-on-primary);
  }
  [data-panel-table] tbody tr:hover td {
    background: var(--adm-row-hover);
  }
  [data-file-button]:hover {
    background: var(--gk-border);
  }
  [data-panel-page] button[data-variant="danger"]:hover:not(:disabled) {
    background: var(--gk-danger);
    color: var(--gk-on-primary);
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-panel-loading],
  [data-panel-forbidden],
  [data-panel-error],
  [data-panel-success],
  [data-panel-row],
  [data-panel-loading-bar],
  [data-panel-page] button {
    animation: none !important;
    transition: none !important;
    opacity: 1;
    transform: none;
  }
  /* Tooltips stay hidden until hover; reduced motion only drops their transition. */
  [data-tooltip]::after {
    transition: none !important;
  }
}
`;
