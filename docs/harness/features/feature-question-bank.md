## Feature: Question bank

### Depende de
- feature-admin-panel

### Descrição
> "Perguntas do quiz da família e perguntas Say What?"

### Problema
Quiz and Say What? need a maintained list of questions, not free-form invention at runtime.

### Solução e trade-offs
`family_quiz` rows with `kind` Family-Quiz | Say-What, weight, status, deleted. Panel row is disabled until pencil; trash with hover tooltip (no Guardar). Dynamic search plus kind filter. Selected kind chip background `#ededed`. Trade-off: one table for both kinds vs two tables.

### Fluxo (given/when/then)
- Dado Operator
- Quando they add a question
- Então it is available to quiz or Say What? by `kind`

### Casos de erro (explícitos, não deixar implícito)
- deleted = true → family quiz does not show it
- empty question_text → reject

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: kind enum enforced
- [ ] Teste: deleted questions excluded from family quiz
- [ ] Teste: Parent cannot CRUD the bank

### Exemplo / contexto
`great-kids-funcionalidades.md` Banco de perguntas. Schema `family_quiz`.

### Design Patterns (Gang of Four) Sugerido
- Singleton (Active Record)
- Strategy (kind)
