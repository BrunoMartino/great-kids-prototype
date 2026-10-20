import type { ReactElement } from "react";

const HOME_STYLES: string = `
[data-panel-home] {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  max-width: 640px;
  padding: 8px 0;
  animation: panel-home-enter 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
[data-panel-home] h1 {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.2;
}
[data-panel-home] p {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.5;
}
[data-panel-home] a {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  background: var(--color-primary);
  color: var(--color-paper);
  font-weight: 600;
  text-decoration: none;
  transition: background-color 120ms ease-out, transform 120ms ease-out;
}
[data-panel-home] a:focus {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-panel-home] a:focus:not(:focus-visible) {
  outline: none;
}
[data-panel-home] a:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-panel-home] a:active {
  transform: translateY(0);
}
@media (hover: hover) and (pointer: fine) {
  [data-panel-home] a:hover {
    background: #7a4035;
    background: color-mix(in srgb, var(--color-ink) 18%, var(--color-primary));
    transform: translateY(-1px);
  }
}
@keyframes panel-home-enter {
  from { opacity: 0; transform: translate3d(0, 4px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@media (prefers-reduced-motion: reduce) {
  [data-panel-home] {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
`;

export default function PanelHomePage(): ReactElement {
  return (
    <section data-panel-home>
      <style href="panel-home" precedence="medium">
        {HOME_STYLES}
      </style>
      <h1>Equipe</h1>
      <p>Configure o catálogo de missões. Sem o telefone da família.</p>
      <a href="/catalog">Ir para o catálogo</a>
    </section>
  );
}
