## Feature: Family profile (Family GPS)

### Depende de
- feature-family-quiz

### Descrição
> "Respostas do Family GPS (o que importa para nós, o que queremos mais), ritmos da família e histórico de conquistas."

### Problema
Without a living map of values and rhythms, suggestions are generic.

### Solução e trade-offs
`family_profile`: quiz_answer, rhythms, achievements envelopes; profile_notes. Trade-off: GPS grows from quiz over time (“Don't interview the family. Discover the family.”) not a long onboarding form.

### Fluxo (given/when/then)
- Dado quiz answers
- Quando profile is shown
- Então compass/destination-style notes, rhythms, achievements are visible

### Casos de erro (explícitos, não deixar implícito)
- Missing profile row → cannot create family
- Soft-deleted profile → family app hides GPS, portal can restore

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: envelopes for quiz_answer, rhythms, achievements
- [ ] Teste: family requires fam_profile_id
- [ ] Teste: GPS is not a child profile (INV-002)

### Exemplo / contexto
Idea Book FAMILY GPS. `great-kids-funcionalidades.md` Perfil da família.

### Design Patterns (Gang of Four) Sugerido
- Composite (profile document)
- Observer (quiz writes into profile — only if unidirectional: quiz service → profile model)
