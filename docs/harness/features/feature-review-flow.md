## Feature: Activity review flow

### Depende de
- feature-activity-card

### Descrição
> "Rascunho, revisão e publicado. Possibilidade de reavaliar uma atividade já aprovada (por exemplo, quando o conteúdo muda)."

### Problema
Unreviewed copy must not reach a family. Content can change after publish and must be re-checked.

### Solução e trade-offs
`review_status`: draft | in_review | published. Family pick/list only published. Trade-off: re-review unpublishes or flags Need-update on materials; family may briefly lose an activity.

### Fluxo (given/when/then)
- Dado a draft mission
- Quando staff publish it
- Então Parent surfaces may use it; drafts stay portal-only

### Casos de erro (explícitos, não deixar implícito)
- Pick unpublished → empty/error, never invent a mission (INV-001)
- Re-review of published → family list drops it until published again

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: family API omits draft and in_review
- [ ] Teste: publish then unpublish hides from family
- [ ] Teste: AI/pick never returns non-published

### Exemplo / contexto
`great-kids-funcionalidades.md` Fluxo de revisão. INV-001 / INV-005.

### Design Patterns (Gang of Four) Sugerido
- State (draft → in_review → published)
- Policy
