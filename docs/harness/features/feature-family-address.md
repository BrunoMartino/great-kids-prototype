## Feature: Family address

### Depende de
- feature-adult-holder

### Descrição
> "Endereço da família (ver decisão em aberto sobre o nível de detalhe)."

### Problema
Forecast and city activities need where the family is.

### Solução e trade-offs
Full address JSON `{ street, number, neighborhood, city, state, zip_code }` as in the draft. Generated indexed `city` / `state`. Trade-off: draft stored full address even though funcionalidades says city/region might suffice.

### Fluxo (given/when/then)
- Dado titular
- Quando they save address
- Então city/state are queryable from generated columns

### Casos de erro (explícitos, não deixar implícito)
- Invalid JSON → reject
- Empty city → allowed at DB; suggestions may miss city filter

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: address is a plain object, not an envelope
- [ ] Teste: city/state match JSON
- [ ] Teste: only titular (or Admin) updates address

### Exemplo / contexto
`database-draft.md` address jsonob. Schema generated columns.

### Design Patterns (Gang of Four) Sugerido
- Singleton (Active Record `family`)
