## Feature: Members without app access

### Depende de
- feature-adult-holder

### Descrição
> "Cadastro de filhos, avós e outros familiares que não acessam o app. Sugestão de campos: relação, idade ou faixa etária e interesses, para melhorar as recomendações."

### Problema
Recommendations need who is in the family without giving children (or grandparents) an account.

### Solução e trade-offs
Members live in `family.family_members` JSON. Schema today: user_id, user_nickname, user_role. User: real name allowed; no photo. Invite flow copy is **Convidar familiar**. Trade-off documented in `schema.md`: relation, age band, interests are not in the envelope yet — JSON-only, no FK. Child surface is a dedicated route (feature-context-switch), not a login.

### Fluxo (given/when/then)
- Dado a family
- Quando titular adds a child member
- Então the member appears in family_members without auth_user_id

### Casos de erro (explícitos, não deixar implícito)
- Photo upload for child → reject (INV-002)
- Member with Child role and auth_user_id set as a real login → reject in this prototype

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: child member has no photo field
- [ ] Teste: name allowed; nick_name required on app_user if a row exists
- [ ] Teste: envelope shape `{ id, members: [...] }`

### Exemplo / contexto
`schema.md` Limitação de family_members. Apresentação: criança nunca é conta/perfil/foto.

### Design Patterns (Gang of Four) Sugerido
- Composite (family document)
- Policy
