## Feature: Family diary

### Depende de
- feature-note-types

### Descrição
> "Adicionar notas como um diário da família."

### Problema
The product must keep what happened, not only suggest what to do.

### Solução e trade-offs
`family_diary.family_notes` envelope. Text only — “Sem foto. Só história.” Trade-off: JSON document vs notes table.

### Fluxo (given/when/then)
- Dado a family
- Quando a Parent adds a note
- Então it appears in family_notes with id, text, kind

### Casos de erro (explícitos, não deixar implícito)
- Photo in note → reject
- Empty text → reject

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: note persisted in `{ id, notes: [...] }`
- [ ] Teste: no image payload stored
- [ ] Teste: deleted diary flag hides notes in app

### Exemplo / contexto
`great-kids-funcionalidades.md` Diário. Apresentação “Sem foto. Só história.”

### Design Patterns (Gang of Four) Sugerido
- Composite
- Command (add note)
