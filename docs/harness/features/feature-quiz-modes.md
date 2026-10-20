## Feature: Quiz answer modes

### Depende de
- feature-family-quiz

### Descrição
> "Um adulto responde sozinho, ou a família responde junta, à mesa."

### Problema
Sometimes one Parent answers; sometimes the family is at the table together. The quiz must support both.

### Solução e trade-offs
Mode is a request flag on submit (solo adult vs together). Same storage. Trade-off: mode not a DB column in the study schema — keep on the write payload / profile_notes until a column exists.

### Fluxo (given/when/then)
- Dado an active question
- Quando solo or table mode is chosen
- Então the answer still saves to quiz_answer

### Casos de erro (explícitos, não deixar implícito)
- Child context solo-submits a quiz that only titular should lock → TBD: allow answer, block question-bank edits
- Missing mode → default solo adult

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: both modes persist an answer
- [ ] Teste: mode does not create a second table
- [ ] Teste: Child context cannot edit the question bank

### Exemplo / contexto
`great-kids-funcionalidades.md` Modos de resposta.

### Design Patterns (Gang of Four) Sugerido
- Strategy (solo vs table UX)
