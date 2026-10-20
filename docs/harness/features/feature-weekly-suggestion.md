## Feature: Weekly suggestion

### Depende de
- feature-ai-mission-rules
- feature-family-calendar

### Descrição
> "Uma sugestão curta e finita, que o usuário joga no calendário com um toque."

### Problema
An infinite feed competes for attention. The family needs a short, finite edit.

### Solução e trade-offs
One short published suggestion that taps onto the calendar. Trade-off: finite list vs infinite scroll (Idea Book Family Forecast).

### Fluxo (given/when/then)
- Dado pick rules and a week
- Quando Parent sees the weekly suggestion
- Então they can place it on a calendar day in one action

### Casos de erro (explícitos, não deixar implícito)
- Empty published set → empty state, no invented copy
- Tap without choosing a day → do not silently pick a day

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: suggestion ids are published missions
- [ ] Teste: one tap writes calendar suggestion
- [ ] Teste: list is finite

### Exemplo / contexto
Idea Book FAMILY FORECAST. `great-kids-funcionalidades.md` Sugestão semanal.

### Design Patterns (Gang of Four) Sugerido
- Strategy
- Command (drop on calendar)
