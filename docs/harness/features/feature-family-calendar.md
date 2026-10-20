## Feature: Family calendar

### Depende de
- feature-adult-holder

### Descrição
> "Calendário em que a família programa atividades e inclui uma atividade em dias escolhidos."

### Problema
Families need a place to put a pick on a real day, not only a surprise button.

### Solução e trade-offs
`family_calendar` one row per family+day; suggestions envelope with status scheduled | done | moved; previous_weather. Trade-off: JSON suggestions vs child table.

### Fluxo (given/when/then)
- Dado a family and a published mission
- Quando they drop it on a day
- Então that day row holds a scheduled suggestion

### Casos de erro (explícitos, não deixar implícito)
- Two rows same (family_id, day) → unique reject
- Unpublished mission on calendar → reject

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: unique (family_id, day)
- [ ] Teste: suggestions envelope shape
- [ ] Teste: unpublished id rejected

### Exemplo / contexto
`great-kids-funcionalidades.md` Calendário da família. Schema `family_calendar`.

### Design Patterns (Gang of Four) Sugerido
- Composite (day document)
- Command (schedule / move)
