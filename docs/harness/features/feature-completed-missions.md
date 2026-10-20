## Feature: Completed missions history

### Depende de
- feature-mission-cycle

### Descrição
> "Histórico das missões que a família concluiu."

### Problema
Families need to see what they already did (and staff need the same for indicators).

### Solução e trade-offs
History = `family_mission` where status Completed, plus `missions_completed` on `family`. Child route `/child` shows this history plus notes. Trade-off: counter on hub vs COUNT; hub counter must stay in sync on complete.

### Fluxo (given/when/then)
- Dado a family with Completed rows
- Quando they open completed missions
- Então they see those missions, not drafts

### Casos de erro (explícitos, não deixar implícito)
- Complete twice on non-repeatable → reject second cycle
- Counter drift → complete path must update `missions_completed`

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: list equals Completed rows
- [ ] Teste: missions_completed increments on complete
- [ ] Teste: unpublished catalog still shows historical title already stored on the cycle row

### Exemplo / contexto
`great-kids-funcionalidades.md` Missões completas.

### Design Patterns (Gang of Four) Sugerido
- Command (complete)
