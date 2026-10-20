## Feature: Mock session and context switch

### Depende de
- feature-adult-holder (roles exist)

### Descrição
> "Sessão Mock como Parent, mas quero que o user possa trocar de contexto, vendo as visões child no app"

### Problema
This prototype has no Supabase Auth. The commissioner still needs to see Parent and Child screens.

### Solução e trade-offs
Mock session starts as Parent. A control switches to Child views in the emulated app. Trade-off: not real auth; `auth_user_id` stays a pointer. Child is a view, not an account (INV-002). Panel still uses Admin/Operator mock separately.

### Fluxo (given/when/then)
- Dado mock session as Parent
- Quando the user switches context to Child
- Então family-app screens show Child view; plan/titular edits stay blocked

### Casos de erro (explícitos, não deixar implícito)
- Child context tries to change plan or invite adults → deny, stay on Child view
- No mock session → do not call family APIs as an authenticated Parent

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: default session is Parent
- [ ] Teste: switch shows Child views without creating a child login
- [ ] Teste: Child context cannot change plan

### Exemplo / contexto
User answer in harness-create. Schema: `app_user.role` Admin | Operator | Parent | Child; `auth_user_id` nullable.

### Design Patterns (Gang of Four) Sugerido
- Strategy (Parent vs Child presentation)
- Policy (what each role may do)
