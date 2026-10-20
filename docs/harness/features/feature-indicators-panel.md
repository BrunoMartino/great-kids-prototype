## Feature: Indicators panel

### Depende de
- feature-family-calendar
- feature-mission-cycle

### Descrição
> "Atividades agendadas, concluídas e repetidas, para medir o que a família realmente fez."

### Problema
Catalog size is not success. Staff need what families scheduled, finished, and repeated.

### Solução e trade-offs
Queries over `family_calendar` and `family_mission` — no extra fact table. Trade-off: computed indicators vs a warehouse; prototype is live SQL.

### Fluxo (given/when/then)
- Dado completed and scheduled rows
- Quando Operator opens indicators
- Então they see scheduled, completed, repeated counts

### Casos de erro (explícitos, não deixar implícito)
- Empty dataset → zeros, not an error splash that looks like failure
- Repeatable mission completed twice → counts as repeated, not unique-only

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: completed count matches family_mission Completed
- [ ] Teste: scheduled count matches calendar suggestions status scheduled
- [ ] Teste: no indicators table required

### Exemplo / contexto
`great-kids-funcionalidades.md` Painel de indicadores. Schema note: indicators are queries.

### Design Patterns (Gang of Four) Sugerido
- Facade (read-model queries)
