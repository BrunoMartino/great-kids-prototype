## Feature: Admin / Operator web panel

### Depende de
- feature-activity-library
- feature-review-flow
- feature-families-subscriptions
- feature-admin-users
- feature-object-storage

### Descrição
> "um portal web para a equipe da plataforma (configuração e gestão)"
>
> "o backend um api que comunica com dois fronts, um sendo o painel web que o admin e o operador usam"

### Problema
Platform staff need to configure catalog, review content, and support families without using the phone shell.

### Solução e trade-offs
Web panel (Admin, Operator) on the same Next app and API as the family UI. Trade-off: one deployable; CSS/layout must not leak the phone chrome into the panel. Flowbite is reference only.

### Fluxo (given/when/then)
- Dado mock Admin or Operator
- Quando they open the panel
- Então they manage catalog, curated materials, questions, contexts, families, plans, users, indicators — not the iPhone frame. Nav has no Responsável.

### Casos de erro (explícitos, não deixar implícito)
- Parent mock hits panel admin routes → 403
- Panel writes unpublished mission → family app still must not show it

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: panel has no phone chrome
- [ ] Teste: Admin/Operator can open catalog; Parent cannot
- [ ] Teste: same API process serves panel and family UI

### Exemplo / contexto
`great-kids-funcionalidades.md` §1 Portal. `prototype.md` two fronts.

### Design Patterns (Gang of Four) Sugerido
- Policy
- Facade (panel vs app)
