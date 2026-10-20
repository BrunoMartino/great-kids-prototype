## Feature: What we know about you

### Depende de
- feature-family-quiz
- feature-family-profile

### Descrição
> "Tela em que o usuário vê o que a IA anotou sobre a família. Sugestão: mostrar de qual resposta veio cada informação e permitir editar ou apagar."

### Problema
Hidden inference feels like surveillance. The family must see, edit, or delete what was stored.

### Solução e trade-offs
Read quiz_answer + profile notes with source question_id; allow edit/delete (`deleted` on answer). Trade-off: show stored answers, not a second inferred graph, until a real extractor exists.

### Fluxo (given/when/then)
- Dado stored answers
- Quando Parent opens “o que sabemos sobre vocês”
- Então each fact shows its source question and can be edited or deleted

### Casos de erro (explícitos, não deixar implícito)
- Delete → set deleted on that answer; do not remove question bank
- Edit empty text → reject

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: each shown item has question_id
- [ ] Teste: delete sets deleted true
- [ ] Teste: pick rules skip deleted answers

### Exemplo / contexto
`great-kids-funcionalidades.md` O que sabemos sobre vocês.

### Design Patterns (Gang of Four) Sugerido
- Command (edit/delete)
- Policy
