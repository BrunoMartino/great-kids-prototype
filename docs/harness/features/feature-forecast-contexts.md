## Feature: Forecast contexts

### Depende de
- feature-activity-library

### Descrição
> "Gestão de contextos (chuva, feriado, Natal, volta às aulas) e de quais atividades combinam com cada um."

### Problema
Suggestions should change with rain, holidays, Christmas, back-to-school — not only with family profile.

### Solução e trade-offs
`forecast_context` seed (rain, holiday, christmas, back-to-school) + `mission_forecast_context`. Trade-off: staff-tagged fit vs live weather API (weather is `previous_weather` on calendar, not a live feed in this prototype).

### Fluxo (given/when/then)
- Dado a published mission
- Quando staff attach context rain
- Então forecast/calendar suggestions can filter to rain

### Casos de erro (explícitos, não deixar implícito)
- Duplicate (mission_id, context_id) → reject
- Context on unpublished mission → allowed in portal; family still only sees published

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: four seeded contexts
- [ ] Teste: unique pair mission+context
- [ ] Teste: family pick can filter by context without inventing missions

### Exemplo / contexto
Idea Book “A FORECAST WITH CONTEXT”. Schema seeds.

### Design Patterns (Gang of Four) Sugerido
- Strategy (context filter)
- Adapter (later weather, TBD)
