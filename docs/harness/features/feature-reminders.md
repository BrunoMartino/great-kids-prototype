## Feature: Reminders and follow-up

### Depende de
- feature-family-calendar
- feature-family-profile

### Descrição
> "Lembretes, marcar como feita e mover de dia. Quando algo se repete, o app propõe transformar em ritmo (por exemplo, depois de quatro vezes)."

### Problema
Scheduled things rot unless they can be done, moved, or turned into a rhythm.

### Solução e trade-offs
Update suggestion status done/moved; after four repeats, propose a rhythm JSON on profile. Trade-off: notifications bool on the day row, not a push provider in this prototype.

### Fluxo (given/when/then)
- Dado a scheduled suggestion
- Quando they mark done or move day
- Então status updates; four repeats prompt a rhythm

### Casos de erro (explícitos, não deixar implícito)
- Move to a day that already has a unique row → merge into that day’s suggestions, do not duplicate the calendar PK
- Rhythm prompt dismissed → do not write rhythms

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: done and moved statuses persist
- [ ] Teste: four repeats can add a rhythm envelope item
- [ ] Teste: no external push required in prototype

### Exemplo / contexto
`great-kids-funcionalidades.md` Lembretes. Idea Book Family Rhythms.

### Design Patterns (Gang of Four) Sugerido
- Command
- Observer (repeat count → rhythm proposal, unidirectional)
