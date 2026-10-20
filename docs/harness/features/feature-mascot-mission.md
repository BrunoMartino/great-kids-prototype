## Feature: Mascot mission message

### Depende de
- feature-parent-shell

### Descrição
> "as missões tem que ser entregues como se fosse a mensagem de texto de um mascote, pode usar biblioteca js para fazer o texto ser escrito digitando lento e depois rapido."

### Problema
A static activity card feels like a content dump. The product voice is someone talking to the family.

### Solução e trade-offs
Render the chosen mission as a mascot text message with a typewriter (slow then fast). JS library allowed. Trade-off: extra motion vs instant full text; must stay readable for conservative parents (soft colors, `/amaterasu-paint`).

### Fluxo (given/when/then)
- Dado a selected published mission
- Quando it is shown in the Parent app
- Então copy types out as a mascot message, not a bare catalog card

### Casos de erro (explícitos, não deixar implícito)
- Empty title/description → do not run the typewriter on blank; show explicit empty
- Prefers-reduced-motion → show full text without the typewriter

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: mission UI is a mascot message with typewriter
- [ ] Teste: unpublished missions never appear in the mascot
- [ ] Teste: Pittore can verify animation in the browser

### Exemplo / contexto
`prototype.md`. Idea book voice: “The entire product should feel like someone smart, funny and culturally aware is on the other side.”

### Design Patterns (Gang of Four) Sugerido
- Decorator (typewriter over mission text)
- Strategy (motion vs instant text)
