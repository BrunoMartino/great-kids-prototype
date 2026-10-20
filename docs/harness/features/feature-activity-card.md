## Feature: Activity card

### Depende de
- feature-activity-library

### Descrição
> "Título, descrição, tipo (Quick Win, Signature, Missão ou pergunta Say What?), tempo, faixa etária, dentro ou fora de casa, materiais, valores que trabalha e status."

### Problema
A category list is not enough to pick or review an activity; staff need the full fiche.

### Solução e trade-offs
One `mission` row: title, description, `img_path`, type, format (Quick-Win, Signature, Mission, Say-What), duration, age_min/max, setting, values JSON envelope, materials via `mission_material`. Trade-off: values as JSON envelope not a values table.

### Fluxo (given/when/then)
- Dado a mission id
- Quando staff open the fiche
- Então they see title, description, format, time, ages, indoor/outdoor, materials, values, status

### Casos de erro (explícitos, não deixar implícito)
- age_min > age_max → reject
- Invalid format/type enum → reject

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: fiche fields match schema (`img_path`, not `feat_img_path` on mission)
- [ ] Teste: values stored as `{ id, values: [...] }`
- [ ] Teste: invalid enum does not persist

### Exemplo / contexto
`great-kids-funcionalidades.md` Ficha da atividade. Schema `mission`.

### Design Patterns (Gang of Four) Sugerido
- Builder (optional fiche fields)
- Adapter (later MinIO for `img_path`)
