## Feature: Note types and mission link

### Depende de
- feature-mission-cycle

### Descrição
> "Ligar cada nota a uma missão ou atividade. Tipos: frase, primeira vez, momento engraçado, algo aprendido e Family Fail."

### Problema
A flat diary cannot tell a first time from a Family Fail or from a mission memory.

### Solução e trade-offs
Kinds: phrase, first_time, funny, learned, family_fail. `mission_note` envelope links mission_id / family_mission_id. Kinds documented, not DB enum (JSON). Trade-off: cannot CHECK kind without a trigger.

### Fluxo (given/when/then)
- Dado a completed mission
- Quando they save a memory of kind first_time
- Então mission_note references that mission

### Casos de erro (explícitos, não deixar implícito)
- Unknown kind → reject in service
- Link to mission the family never had → reject

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: five kinds accepted
- [ ] Teste: mission_note holds mission_id and nested note
- [ ] Teste: invalid kind not stored

### Exemplo / contexto
`great-kids-funcionalidades.md` Vínculo e tipos de nota. Idea Book Family Fails / Memory Mile Markers.

### Design Patterns (Gang of Four) Sugerido
- Strategy (kind)
