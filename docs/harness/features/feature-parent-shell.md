## Feature: Parent phone shell

### Depende de
- feature-context-switch (mock Parent session and Child view)

### Descrição
> "vamos emular o comportamento mobile atráves de uma tela html com uma imagem de celular (preferencia por um iphone 15 pro max com tela alta e mais larga) e permitir que ela navegue pela visão do que seria um usuário Parent"

### Problema
The commissioner needs a high-fidelity family app to click through without a native mobile build.

### Solução e trade-offs
HTML phone chrome (iPhone 15 Pro Max, tall and wide) around the Parent app. No React Native/Expo. Trade-off: pixel-true to a frame, not a device OS (gestures, notifications, install).

### Fluxo (given/when/then)
- Dado the prototype URL
- Quando the commissioner opens the family surface
- Então they see the app inside the iPhone frame and can navigate as Parent

### Casos de erro (explícitos, não deixar implícito)
- Viewport smaller than the frame → frame stays, inner app scrolls; do not drop to a native-looking full-bleed without chrome
- Missing frame asset → do not render the family UI unframed as if it were the panel

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: family routes render inside the iPhone 15 Pro Max chrome
- [ ] Teste: panel routes do not use the phone chrome
- [ ] Teste: no native mobile package in dependencies

### Exemplo / contexto
`my_docs/prototype.md` — high-fidelity prototype for the commissioner; Parent navigation in an emulated phone.

### Design Patterns (Gang of Four) Sugerido
- Decorator (phone chrome around the family view)
- Facade (family app surface vs panel surface)
