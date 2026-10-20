"use client";

import type { ReactElement } from "react";
import type { PanelMissionRow } from "./panel-catalog-facade";
import { usePanelSession } from "./panel-session-context";

const SCREEN_STYLES: string = `
[data-panel-catalog] {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 1120px;
  min-width: 0;
}
[data-panel-catalog] h1 {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.25;
}
[data-panel-catalog] p {
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
  background: #efdfd8;
  background: color-mix(in srgb, var(--color-primary) 14%, var(--color-paper));
  color: var(--color-primary);
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
  opacity: 1;
  transform: translate3d(0, 0, 0);
  animation: panel-enter 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
[data-panel-loading-bar] {
  height: 12px;
  border-radius: 999px;
  background: #eae3de;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  transform-origin: left center;
  transform: translateZ(0);
  animation: panel-load 900ms ease-in-out infinite;
}
[data-panel-table-wrap] {
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  border-radius: 16px;
  background: var(--color-paper);
  box-shadow: 0 1px 0 rgba(44, 42, 40, 0.08);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--color-ink) 8%, transparent);
}
[data-panel-table] {
  width: 100%;
  border-collapse: collapse;
}
[data-panel-table] caption {
  padding: 16px 16px 0;
  color: var(--color-muted);
  font-size: 0.875rem;
  text-align: left;
}
[data-panel-table] th,
[data-panel-table] td {
  padding: 12px 16px;
  text-align: left;
  vertical-align: middle;
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
  transform: translate3d(0, 0, 0);
  animation: panel-row-enter 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@supports (animation-delay: calc(sibling-index() * 1ms)) {
  [data-panel-row] {
    animation-delay: calc(sibling-index() * 40ms);
  }
}
[data-review-chip] {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #ece6df;
  background: color-mix(in srgb, var(--color-muted) 16%, var(--color-paper));
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 700;
}
[data-review-chip][data-review-status="published"] {
  background: #e4ecdf;
  background: color-mix(in srgb, var(--color-success) 16%, var(--color-paper));
  color: var(--color-success);
}
[data-review-chip][data-review-status="in_review"] {
  background: #f3ead4;
  background: color-mix(in srgb, var(--color-warning) 18%, var(--color-paper));
  color: var(--color-warning);
}
[data-review-chip][data-review-status="draft"] {
  background: #ece6df;
  background: color-mix(in srgb, var(--color-muted) 16%, var(--color-paper));
  color: var(--color-muted);
}
[data-panel-empty] {
  padding: 24px 16px;
  color: var(--color-muted);
}
@keyframes panel-enter {
  from { opacity: 0; transform: translate3d(0, 4px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes panel-row-enter {
  from { opacity: 0; transform: translate3d(0, 4px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes panel-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
@media (prefers-reduced-motion: reduce) {
  [data-panel-loading],
  [data-panel-forbidden],
  [data-panel-error],
  [data-panel-success],
  [data-panel-row],
  [data-panel-loading-bar] {
    animation: none !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    opacity: 1;
    transform: none;
  }
}
`;

function reviewLabel(p_status: string): string {
  if (p_status === "draft") {
    return "Rascunho";
  }
  if (p_status === "in_review") {
    return "Em revisão";
  }
  if (p_status === "published") {
    return "Publicado";
  }
  return p_status;
}

function roleLabel(p_role: "Admin" | "Operator"): string {
  if (p_role === "Admin") {
    return "Admin";
  }
  return "Operador";
}

export function CatalogScreen(): ReactElement {
  const session: ReturnType<typeof usePanelSession> = usePanelSession();

  return (
    <div data-panel-catalog>
      <style href="panel-catalog" precedence="medium">
        {SCREEN_STYLES}
      </style>
      {session.isLoading ? (
        <div data-panel-loading aria-live="polite" aria-busy="true">
          <span data-panel-role>Catálogo</span>
          <h1>Carregando o catálogo</h1>
          <div data-panel-loading-bar />
        </div>
      ) : null}
      {!session.isLoading && session.isForbidden ? (
        <div data-panel-forbidden role="alert">
          <span data-panel-role>Catálogo</span>
          <h1>Acesso negado</h1>
          <p>Este catálogo é só para a equipe.</p>
        </div>
      ) : null}
      {!session.isLoading && !session.isForbidden && session.errorMessage !== null ? (
        <div data-panel-error role="alert">
          <span data-panel-role>Catálogo</span>
          <h1>Não foi possível carregar o catálogo</h1>
          <p>{session.errorMessage}</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage === null &&
      session.role !== null ? (
        <div data-panel-success data-catalog-id={session.catalogId ?? ""}>
          <span data-panel-role data-role={session.role}>
            {roleLabel(session.role)}
          </span>
          <h1>Catálogo</h1>
          <p>Missões da equipe, incluindo rascunhos e revisão.</p>
          <div data-panel-table-wrap>
            {session.missions.length === 0 ? (
              <p data-panel-empty>Nenhuma missão no catálogo.</p>
            ) : (
              <table data-panel-table>
                <caption>Missões do catálogo</caption>
                <thead>
                  <tr>
                    <th scope="col">Título</th>
                    <th scope="col">Categoria</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {session.missions.map((p_mission: PanelMissionRow): ReactElement => {
                    return (
                      <tr data-panel-row key={p_mission.id}>
                        <td>{p_mission.title}</td>
                        <td>{p_mission.category_id}</td>
                        <td>
                          <span
                            data-review-chip
                            data-review-status={p_mission.review_status}
                          >
                            {reviewLabel(p_mission.review_status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
