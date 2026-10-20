## Feature: Families and subscriptions (support)

### Depende de
- feature-adult-holder
- feature-adult-invite

### Descrição
> "Visão de suporte: conta da família, convites e plano."

### Problema
Staff need to see a family account, invites, and plan without impersonating incorrectly.

### Solução e trade-offs
Panel read/manage of `family`, `family_invite`, `plan` with dedicated panel screens (Famílias, Planos). Family app copy: **Alterar plano**. Trade-off: optional `plan_id`; seeded Free plus at least one extra plan; no payments in this prototype.

### Fluxo (given/when/then)
- Dado Operator
- Quando they open a family
- Então they see status, plan, invites

### Casos de erro (explícitos, não deixar implícito)
- Missing profile/diary → cannot create family (FKs required first)
- Delete plan still referenced → RESTRICT

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: family insert requires profile and diary
- [ ] Teste: Free plan seed exists
- [ ] Teste: Parent cannot change plan unless titular policy says so

### Exemplo / contexto
`great-kids-funcionalidades.md` Famílias e assinaturas. Schema `plan`, `family_invite`.

### Design Patterns (Gang of Four) Sugerido
- Policy
- Singleton (Active Record)
