## Feature: Surprise mission

### Depende de
- feature-ai-mission-rules
- feature-mascot-mission

### Descrição
> "Um clique e a família descobre a missão do momento. A missão é escolhida pela IA a partir da biblioteca, considerando as características e os gostos da família."

### Problema
Parents stall in choice. They need one trusted next thing, not a feed.

### Solução e trade-offs
One-click pick from published library using profile, ages, history, context. Trade-off: “IA” in copy; implementation is selection among catalog rows, never generated text missions (INV-001).

### Fluxo (given/when/then)
- Dado a family with published missions available
- Quando Parent taps surprise mission
- Então one published mission is shown as mascot text

### Casos de erro (explícitos, não deixar implícito)
- No published missions → explicit empty, do not invent
- All recent history exhausted and none repeatable → say so, do not reuse unpublished

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: result row is published + active + not deleted
- [ ] Teste: one click returns one mission
- [ ] Teste: empty catalog does not fabricate title/description

### Exemplo / contexto
`great-kids-funcionalidades.md` Missão surpresa. Idea Book Mystery Missions.

### Design Patterns (Gang of Four) Sugerido
- Strategy (selection)
- Factory (family_mission Accepted)
