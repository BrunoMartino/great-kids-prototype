## Feature: Object storage

### Depende de
- feature-activity-library
- feature-activity-card
- feature-admin-panel

### Descrição
> "preciso que o user possa subir imagens e arquivos durante o tste do prototipo"

### Problema
> "poder criar o catalogo de missoes, os avatares de mascores e imagens divertidas para missoes"

### Solução e trade-offs
> "strategy para usar as informaçoes de S3 que vão ficar no .env"

S3-compatible Adapter (`put`, `delete`, `publicUrl`). Coolify MinIO (`bd-storage`) now; another bucket later without rewriting callers. Trade-off: prototype uses env credentials instead of a per-tenant IAM model.

### Fluxo (given/when/then)
- Dado Admin or Operator on the panel
- Quando they upload an image or file for a mission or curated material
- Então the object is stored under prefix `great-kids/` in bucket `bd-files` and the path is saved on the row

### Casos de erro (explícitos, não deixar implícito)
- Missing S3 env → LocalDiskAdapter in tests; reject live upload with a clear error
- Bucket `dbruns-files` or host `images.dbruns.com` → must not be used
- Empty file or rejected type → do not persist a path

### Critério de aceite (o que prova que está pronto)
- [ ] Teste: Adapter writes and deletes a key under `great-kids/`
- [ ] Teste: `mission.img_path` / `curated_material.feat_img_path` / `file_path` store the key
- [ ] Teste: Vitest uses LocalDiskAdapter when S3_* is unset

### Exemplo / contexto
> User authorized inference for this field: staff upload mission catalog images, mascot avatars, and fun mission art during prototype testing, using `.env` S3 settings against Coolify MinIO bucket `bd-files` (not `dbruns-files`).

### Design Patterns (Gang of Four) Sugerido
- Strategy (which store: MinIO / local disk)
- Adapter (S3-compatible API)
