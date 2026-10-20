## Feature: Activity library by category

### Depende de
- None.

### Descrição
> "Cadastro e manutenção das atividades, separadas por categorias. Categorias sugeridas a partir do material: Watch, Read, Make, Cook, Play, Go, Listen, Talk, Grow, Faith, Serve e Celebrate."

### Problema
Staff need a single catalog of things a family might do, grouped the way the Idea Book speaks (Watch, Read, Make…).

### Solução e trade-offs
Portal CRUD on `mission` + `mission_category` (seeded slugs). Trade-off: twelve fixed categories vs free tags; family app never edits the library.

### Fluxo (given/when/then)
- Dado Operator/Admin
- Quando they add or list activities
- Então rows sit under a category; seeds include Watch…Celebrate

### Casos de erro (explícitos, não deixar implícito)
- Unknown category_id → reject write
- Family Parent tries to create a catalog mission → 403

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: twelve seeded categories exist
- [ ] Teste: mission requires category_id
- [ ] Teste: Parent cannot POST catalog create

### Exemplo / contexto
`great-kids-funcionalidades.md` portal row Biblioteca. Categories from Idea Book / material.

### Design Patterns (Gang of Four) Sugerido
- Factory (mission create)
- Singleton (Active Record `mission` / `mission_category`)
