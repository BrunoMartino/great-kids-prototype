export const PANEL_SCREEN_STYLES: string = `
[data-panel-page] {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  width: 100%;
  min-width: 0;
}
[data-panel-page] h1 {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.25;
}
[data-panel-page] p {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.45;
}
[data-panel-role] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #ededed;
  color: var(--color-ink);
  font-size: 0.75rem;
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
  animation: panel-enter 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
[data-panel-loading-bar] {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: #eae3de;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
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
  min-height: 36px;
  min-width: 36px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: var(--color-paper);
  color: var(--color-ink);
  font-weight: 600;
  cursor: pointer;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform 120ms ease-out, opacity 120ms ease-out;
}
[data-panel-page] button::-moz-focus-inner {
  border: 0;
  padding: 0;
}
[data-panel-page] button[data-variant="primary"] {
  background: var(--color-primary);
  color: var(--color-paper);
}
[data-panel-page] button[data-variant="danger"] {
  background: #f3e0de;
  background: color-mix(in srgb, var(--color-danger) 14%, var(--color-paper));
  color: var(--color-danger);
}
[data-panel-page] button[data-icon="true"] {
  padding: 0;
  width: 36px;
}
[data-panel-page] button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
[data-panel-page] button:active:not(:disabled) {
  transform: translateY(0);
}
[data-panel-page] input,
[data-panel-page] select {
  min-height: 36px;
  width: 100%;
  padding: 0 12px;
  border: 1px solid rgba(44, 42, 40, 0.14);
  border: 1px solid color-mix(in srgb, var(--color-ink) 14%, transparent);
  border-radius: 10px;
  background: var(--color-paper);
  font-size: 16px;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}
[data-panel-page] select {
  padding-right: 32px;
  background-color: var(--color-paper);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%232c2a28' d='M1.2 1.4 L6 6.2 L10.8 1.4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px 8px;
}
[data-panel-page] input[type="file"] {
  padding: 6px 8px;
}
[data-panel-page] input[type="file"]::file-selector-button,
[data-panel-page] input[type="file"]::-webkit-file-upload-button {
  margin-right: 8px;
  padding: 4px 10px;
  border: 0;
  border-radius: 8px;
  background: #efe4d6;
  color: var(--color-ink);
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
  outline: 2px solid var(--color-primary);
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
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
[data-panel-form] {
  display: grid;
  gap: 12px;
  max-width: 1120px;
  padding: 16px;
  border-radius: 16px;
  background: var(--color-paper);
  box-shadow: 0 1px 0 rgba(44, 42, 40, 0.08);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--color-ink) 8%, transparent);
}
[data-panel-field] {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
[data-panel-field] span {
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-panel-form-error] {
  color: var(--color-danger);
  font-size: 0.875rem;
}
[data-panel-table-wrap] {
  min-width: 0;
  width: 100%;
  max-width: 1120px;
  margin-inline: auto;
  overflow-x: auto;
  overflow-anchor: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(44, 42, 40, 0.22) transparent;
  scrollbar-color: color-mix(in srgb, var(--color-ink) 22%, transparent) transparent;
  border-radius: 16px;
  background: var(--color-paper);
  box-shadow: 0 1px 0 rgba(44, 42, 40, 0.08);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--color-ink) 8%, transparent);
}
[data-panel-table] {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
}
[data-panel-table] caption {
  padding: 16px 16px 0;
  color: var(--color-muted);
  font-size: 0.875rem;
  text-align: center;
}
[data-panel-table] th,
[data-panel-table] td {
  padding: 12px 16px;
  text-align: center;
  vertical-align: middle;
  overflow-wrap: break-word;
  overflow-wrap: anywhere;
}
[data-panel-table] th {
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(44, 42, 40, 0.1);
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 10%, transparent);
}
[data-panel-table] td {
  border-bottom: 1px solid rgba(44, 42, 40, 0.08);
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 8%, transparent);
}
[data-panel-row] {
  opacity: 1;
  animation: panel-row-enter 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
[data-panel-row-actions] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
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
  border-radius: 10px;
  background: var(--color-paper);
  color: var(--color-ink);
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
  border-radius: 999px;
  background: #ece6df;
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 700;
}
[data-status-chip][data-status="active"],
[data-status-chip][data-status="Can-use"] {
  background: #e4ecdf;
  color: var(--color-success);
}
[data-status-chip][data-status="blocked"],
[data-status-chip][data-status="inactive"],
[data-status-chip][data-status="Not-use"] {
  background: #f3ead4;
  color: var(--color-warning);
}
[data-panel-empty] {
  padding: 24px 16px;
  color: var(--color-muted);
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
  border-radius: 8px;
  background: var(--color-ink);
  color: var(--color-paper);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transform: translate3d(4px, -50%, 0);
  transition: opacity 120ms ease-out, transform 120ms ease-out;
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
  [data-panel-form] {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) auto;
    align-items: end;
  }
  [data-panel-form] [data-panel-form-error] {
    grid-column: 1 / -1;
  }
}
@media (hover: hover) and (pointer: fine) {
  [data-tooltip]:hover::after {
    opacity: 1;
    transform: translate3d(0, -50%, 0);
  }
  [data-panel-page] button:hover:not(:disabled) {
    background: #efe4d6;
    background: color-mix(in srgb, var(--color-tertiary) 36%, var(--color-paper));
    transform: translateY(-1px);
  }
  [data-panel-page] button[data-variant="primary"]:hover:not(:disabled) {
    background: var(--color-ink);
    color: var(--color-paper);
  }
  [data-panel-page] button[data-variant="danger"]:hover:not(:disabled) {
    background: var(--color-danger);
    color: var(--color-paper);
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-panel-loading],
  [data-panel-forbidden],
  [data-panel-error],
  [data-panel-success],
  [data-panel-row],
  [data-panel-loading-bar],
  [data-panel-page] button,
  [data-tooltip]::after {
    animation: none !important;
    transition: none !important;
    opacity: 1;
    transform: none;
  }
}
`;
