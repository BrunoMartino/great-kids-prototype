## Feature: Adult titular

### Depende de
- None.

### Descrição
> "Cadastro do titular da conta."
>
> "Sugestão de dois papéis: titular (plano e dados da família) e adulto (usa tudo, sem alterar o plano)."

### Problema
A family account needs one adult who owns plan and family data.

### Solução e trade-offs
`app_user` with role Parent, mock session as titular by default. No password. Trade-off: mock auth now; `auth_user_id` later. Real name allowed; nick_name required.

### Fluxo (given/when/then)
- Dado no family
- Quando titular is created
- Então an `app_user` exists and can own family data/plan

### Casos de erro (explícitos, não deixar implícito)
- Duplicate email → reject
- Child role as titular → reject

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: titular create without password
- [ ] Teste: email unique when present
- [ ] Teste: titular can change plan; invited adult cannot

### Exemplo / contexto
`great-kids-funcionalidades.md` Titular adulto. Schema `app_user`.

### Design Patterns (Gang of Four) Sugerido
- Policy
- Singleton (Active Record)
