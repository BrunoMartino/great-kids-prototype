## Feature: Family quiz

### Depende de
- feature-question-bank

### Descrição
> "Perguntas e respostas divertidas que a família responde para o app guardar informações e conhecer melhor a família, recomendando atividades melhores."

### Problema
The app cannot recommend well without stored, playful answers about the family.

### Solução e trade-offs
Answers append to `family_profile.quiz_answer` envelope `{ id, answers: [{ question_id, answer_text, deleted }] }`. Trade-off: answers in profile JSON vs answer table.

### Fluxo (given/when/then)
- Dado an active Family-Quiz question
- Quando the family answers
- Então the answer is stored and can feed pick rules

### Casos de erro (explícitos, não deixar implícito)
- Unknown question_id → reject
- Deleted question → do not offer; existing answers remain until user deletes

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: answer references family_quiz id
- [ ] Teste: envelope not a bare array
- [ ] Teste: deleted flag on an answer hides it from “what we know”

### Exemplo / contexto
`great-kids-funcionalidades.md` Quiz divertido. Schema quiz_answer.

### Design Patterns (Gang of Four) Sugerido
- Command
- Singleton (Active Record)
