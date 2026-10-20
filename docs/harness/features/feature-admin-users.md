## Feature: Admin users

### Depende de
- feature-admin-panel
- feature-adult-holder

### Descrição
> "pode inferir dentro da documentacao"
>
> Prior user wording this conversation: "somente Admin e Operador, Admin deve ter permissão de edição de usuários e bloqueio" / "telas de controle de subscription, de usuários existentes"

Staff panel lists `app_user` rows. Panel roles are Admin and Operator only — no Responsável on the panel.

### Problema
> "pode inferir dentro da documentacao"

The panel cannot manage who exists or who is blocked. Admin and Operator need to control the application from the web panel, not only questions and catalog.

### Solução e trade-offs
> "pode inferir dentro da documentacao"

Panel CRUD-lite on `app_user`: list, edit, set `status` including `blocked`. **Block and edit = Admin only.** Operator may read the list. No real auth; mock session. Trade-off: prototype block is a status flag, not a Coolify/Supabase ban.

### Fluxo (given/when/then)
- Dado mock Admin
- Quando they open Utilizadores and block a Parent
- Então that `app_user.status` is `blocked` and the row stays (no hard delete)

### Casos de erro (explícitos, não deixar implícito)
- Operator tries to block or edit a user → 403
- Child as a panel login → not offered
- Hard delete of `app_user` → reject; use `blocked` / `inactive`

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: Admin PATCH status to blocked persists
- [ ] Teste: Operator GET list 200; Operator PATCH 403
- [ ] Teste: panel session switcher has Admin and Operator only

### Exemplo / contexto
> "pode inferir dentro da documentacao"
>
> Panel nav includes Utilizadores. Existing users from demo seeds (Admin, Operator, titular Parent). Admin blocks; Operator cannot.

### Design Patterns (Gang of Four) Sugerido
- Policy (Admin vs Operator on user writes)
- Singleton (Active Record `app_user`)
