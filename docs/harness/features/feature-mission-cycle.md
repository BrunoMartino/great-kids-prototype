## Feature: Mission cycle

### Depende de
- feature-surprise-mission

### Descrição
> "Aceitar, fazer e concluir, seguido de uma pergunta de fechamento: fariam de novo? Vale guardar na memória?"

### Problema
A suggestion that is never accepted, done, and closed cannot feed history, rhythms, or indicators.

### Solução e trade-offs
`family_mission` status Accepted | Doing | Completed; closing `{ do_again, save_memory }`. No unique (fam, mission) because repeatable. Trade-off: multiple rows per pair.

### Fluxo (given/when/then)
- Dado an offered published mission
- Quando the family accepts, does, and completes
- Então status is Completed and closing is stored

### Casos de erro (explícitos, não deixar implícito)
- Complete from Accepted skipping Doing → TBD service may allow or reject; must not skip closing
- Invalid status jump Completed → Accepted on same row → reject (new row if repeatable)

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: enum statuses only
- [ ] Teste: closing written on complete
- [ ] Teste: second cycle allowed only if repeatable

### Exemplo / contexto
`great-kids-funcionalidades.md` Ciclo da missão. Schema `family_mission`.

### Design Patterns (Gang of Four) Sugerido
- State
- Command
