## Feature: Adult invite

### Depende de
- feature-adult-holder

### Descrição
> "Convidar outros adultos da família, que passam a acessar o app. Sugestão de dois papéis: titular (plano e dados da família) e adulto (usa tudo, sem alterar o plano)."

### Problema
More than one adult should use the app without sharing one login or changing the plan.

### Solução e trade-offs
`family_invite` (Pending, Accepted, Revoked, Expired), token_hash unique. Not an auth table. Trade-off: mock accept in prototype vs email provider.

### Fluxo (given/when/then)
- Dado titular
- Quando they invite an adult email
- Então invite is Pending until accepted into family_members

### Casos de erro (explícitos, não deixar implícito)
- Expired token → Expired, do not join
- Non-titular invites → 403

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: invite statuses enforced
- [ ] Teste: accepted adult cannot change plan
- [ ] Teste: token_hash unique

### Exemplo / contexto
`great-kids-funcionalidades.md` Convite de adultos. Schema `family_invite`.

### Design Patterns (Gang of Four) Sugerido
- Command (invite / accept / revoke)
- Policy
