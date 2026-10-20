## Feature: Mission pick rules

### Depende de
- feature-review-flow
- feature-family-profile

### Descrição
> "A IA escolhe apenas entre atividades já aprovadas, sem inventar missões. Considera perfil, gostos, idades, histórico (para não repetir) e contexto (clima, dia da semana)."

### Problema
Unconstrained generation would invent activities the staff never approved.

### Solução e trade-offs
Selector over published missions using profile, ages, history (skip unless repeatable), context. Trade-off: rules engine vs LLM prose; LLM may rank but must return a catalog id.

### Fluxo (given/when/then)
- Dado published missions and family profile
- Quando pick runs
- Então the id exists in `mission` with review_status published

### Casos de erro (explícitos, não deixar implícito)
- Model returns free-text mission → discard; error
- Repeat of non-repeatable recent mission → skip

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: pick never returns draft
- [ ] Teste: pick never returns a mission id not in the table
- [ ] Teste: non-repeatable recently completed is skipped

### Exemplo / contexto
`great-kids-funcionalidades.md` Regras da IA. INV-001.

### Design Patterns (Gang of Four) Sugerido
- Strategy
- Adapter (optional LLM ranker)
