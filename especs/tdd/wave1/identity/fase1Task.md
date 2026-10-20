# Phase 1 — identity Green

- [x] `models/app_user.ts` Singleton AR + `queryRaw` create (no password, `auth_user_id` null)
- [x] `models/family_profile.ts` Singleton AR empty envelopes
- [x] `models/family_diary.ts` Singleton AR empty note envelopes
- [x] `models/family.ts` Singleton AR; reject bare `family_members` array
- [x] `app/api/app-users/holder-policy.ts` Parent titular; invited adult cannot change plan
- [x] `app/api/app-users/titular-service.ts` Policy then create; email conflict
- [x] `app/api/app-users/route.ts` POST 201/400/409 and GET envelope
- [x] `app/api/families/husk-service.ts` transactional husk
- [x] `app/api/families/route.ts` POST 201/400
- [x] Phase tests pass: `npx vitest run tests/identity`
- [x] Frontend: N/A
