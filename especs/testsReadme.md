# Tests

| Suite / name | Purpose | Path | Isolated run |
|--------------|---------|------|--------------|
| connection singleton / turns foreign keys on | PRAGMA foreign_keys is 1 after boot | `tests/connection.test.ts` | `npx vitest run tests/connection.test.ts` |
| connection singleton / same instance | getConnection is a Singleton | `tests/connection.test.ts` | `npx vitest run tests/connection.test.ts` |
| schema apply / hub tables | 000000 schema creates plan, app_user, family, mission, family_mission | `tests/schema-queryraw.test.ts` | `npx vitest run tests/schema-queryraw.test.ts` |
| schema apply / Free plan seed | Seed id 24bcd40e-… is name Free | `tests/schema-queryraw.test.ts` | `npx vitest run tests/schema-queryraw.test.ts` |
| schema apply / second getConnection | Schema apply is idempotent | `tests/schema-queryraw.test.ts` | `npx vitest run tests/schema-queryraw.test.ts` |
| schema apply / orphan family | FK rejects missing profile/diary ids | `tests/schema-queryraw.test.ts` | `npx vitest run tests/schema-queryraw.test.ts` |
| queryRaw / bound plan name | Parameters bind; Free row returned | `tests/schema-queryraw.test.ts` | `npx vitest run tests/schema-queryraw.test.ts` |
| queryRaw / empty result | No match returns [] | `tests/schema-queryraw.test.ts` | `npx vitest run tests/schema-queryraw.test.ts` |
| queryRaw / invalid SQL | Bad SQL throws | `tests/schema-queryraw.test.ts` | `npx vitest run tests/schema-queryraw.test.ts` |
| queryRaw / injection-shaped param | Bound string does not drop plan | `tests/schema-queryraw.test.ts` | `npx vitest run tests/schema-queryraw.test.ts` |
| health GET / 200 ok + foreignKeys | Handler 200 when DB up with FKs on | `tests/health.test.ts` | `npx vitest run tests/health.test.ts` |
| health GET / session Parent | Mock session default is Parent | `tests/health.test.ts` | `npx vitest run tests/health.test.ts` |
| health GET / no secrets | Body omits SQLITE_PATH and secret-looking keys | `tests/health.test.ts` | `npx vitest run tests/health.test.ts` |
| HolderPolicy / Parent titular | Parent is allowed as titular | `tests/identity/holder-policy.test.ts` | `npx vitest run tests/identity/holder-policy.test.ts` |
| HolderPolicy / Child reject | Child cannot be titular | `tests/identity/holder-policy.test.ts` | `npx vitest run tests/identity/holder-policy.test.ts` |
| HolderPolicy / holder plan | Same-id Parent may change plan | `tests/identity/holder-policy.test.ts` | `npx vitest run tests/identity/holder-policy.test.ts` |
| HolderPolicy / invited adult | Invited Parent cannot change plan | `tests/identity/holder-policy.test.ts` | `npx vitest run tests/identity/holder-policy.test.ts` |
| app_user / create Parent | Insert without password; auth_user_id null | `tests/identity/app-user.test.ts` | `npx vitest run tests/identity/app-user.test.ts` |
| app_user / null email | Unique email only when present | `tests/identity/app-user.test.ts` | `npx vitest run tests/identity/app-user.test.ts` |
| app_user / duplicate email | Second same email throws | `tests/identity/app-user.test.ts` | `npx vitest run tests/identity/app-user.test.ts` |
| app_user / injection email | Bound email does not drop table | `tests/identity/app-user.test.ts` | `npx vitest run tests/identity/app-user.test.ts` |
| family husk / holder members | Profile+diary+family; holder in envelope | `tests/identity/family-husk.test.ts` | `npx vitest run tests/identity/family-husk.test.ts` |
| family husk / address | Plain empty-string address object | `tests/identity/family-husk.test.ts` | `npx vitest run tests/identity/family-husk.test.ts` |
| family husk / bare members | Bare `[]` members rejected | `tests/identity/family-husk.test.ts` | `npx vitest run tests/identity/family-husk.test.ts` |
| family husk / rollback | Invalid status leaves no profile/diary | `tests/identity/family-husk.test.ts` | `npx vitest run tests/identity/family-husk.test.ts` |
| app-users POST / 201 | Titular create 201, no password | `tests/identity/app-users-api.test.ts` | `npx vitest run tests/identity/app-users-api.test.ts` |
| app-users GET / envelope | Users list envelope | `tests/identity/app-users-api.test.ts` | `npx vitest run tests/identity/app-users-api.test.ts` |
| app-users GET / empty | Empty users envelope | `tests/identity/app-users-api.test.ts` | `npx vitest run tests/identity/app-users-api.test.ts` |
| app-users POST / Child 400 | Child titular rejected | `tests/identity/app-users-api.test.ts` | `npx vitest run tests/identity/app-users-api.test.ts` |
| app-users POST / 409 | Duplicate email | `tests/identity/app-users-api.test.ts` | `npx vitest run tests/identity/app-users-api.test.ts` |
| families POST / 201 husk | Holder in members; empty address | `tests/identity/families-api.test.ts` | `npx vitest run tests/identity/families-api.test.ts` |
| families POST / no holder 400 | Missing holder_user_id | `tests/identity/families-api.test.ts` | `npx vitest run tests/identity/families-api.test.ts` |
| families POST / Child 400 | Child cannot be family titular | `tests/identity/families-api.test.ts` | `npx vitest run tests/identity/families-api.test.ts` |
| categories / twelve seeds | Wave 0 slugs Watch…Celebrate | `tests/catalog/mission-categories.test.ts` | `npx vitest run tests/catalog/mission-categories.test.ts` |
| categories GET / envelope | Staff 200 with 12 items | `tests/catalog/mission-categories.test.ts` | `npx vitest run tests/catalog/mission-categories.test.ts` |
| categories POST / 409 | Duplicate watch slug | `tests/catalog/mission-categories.test.ts` | `npx vitest run tests/catalog/mission-categories.test.ts` |
| categories POST / injection | Slug treated as data | `tests/catalog/mission-categories.test.ts` | `npx vitest run tests/catalog/mission-categories.test.ts` |
| categories POST / extra Admin | 201 extra-cat | `tests/catalog/mission-categories.test.ts` | `npx vitest run tests/catalog/mission-categories.test.ts` |
| categories POST / Parent 403 | Parent cannot write categories | `tests/catalog/mission-categories.test.ts` | `npx vitest run tests/catalog/mission-categories.test.ts` |
| factory / draft envelope | review_status draft; values `{id, values:[]}` | `tests/catalog/mission-factory.test.ts` | `npx vitest run tests/catalog/mission-factory.test.ts` |
| factory / unknown category | Missing FK rejected | `tests/catalog/mission-factory.test.ts` | `npx vitest run tests/catalog/mission-factory.test.ts` |
| factory / missing category_id | Create without category rejected | `tests/catalog/mission-factory.test.ts` | `npx vitest run tests/catalog/mission-factory.test.ts` |
| missions POST / Admin draft | 201 review_status draft | `tests/catalog/missions-api.test.ts` | `npx vitest run tests/catalog/missions-api.test.ts` |
| missions POST / Parent 403 | Parent cannot create catalog | `tests/catalog/missions-api.test.ts` | `npx vitest run tests/catalog/missions-api.test.ts` |
| missions GET / staff drafts | Envelope includes drafts | `tests/catalog/missions-api.test.ts` | `npx vitest run tests/catalog/missions-api.test.ts` |
| missions GET / category filter | Only matching category_id | `tests/catalog/missions-api.test.ts` | `npx vitest run tests/catalog/missions-api.test.ts` |
| missions GET / Parent 403 | Parent cannot list staff catalog | `tests/catalog/missions-api.test.ts` | `npx vitest run tests/catalog/missions-api.test.ts` |
| missions GET / empty | Empty missions envelope | `tests/catalog/missions-api.test.ts` | `npx vitest run tests/catalog/missions-api.test.ts` |
| ContextPolicy / Parent plan+invite | Parent allowed | `tests/session/context-policy.test.ts` | `npx vitest run tests/session/context-policy.test.ts` |
| ContextPolicy / Child plan | Child cannot change plan | `tests/session/context-policy.test.ts` | `npx vitest run tests/session/context-policy.test.ts` |
| ContextPolicy / Child invite | Child cannot invite | `tests/session/context-policy.test.ts` | `npx vitest run tests/session/context-policy.test.ts` |
| ContextPolicy / missing session | Absent session throws | `tests/session/context-policy.test.ts` | `npx vitest run tests/session/context-policy.test.ts` |
| Strategy / default Parent | Presentation starts Parent | `tests/session/presentation-strategy.test.ts` | `npx vitest run tests/session/presentation-strategy.test.ts` |
| Strategy / switch round-trip | Child then Parent | `tests/session/presentation-strategy.test.ts` | `npx vitest run tests/session/presentation-strategy.test.ts` |
| Strategy / unknown role | Invalid role throws | `tests/session/presentation-strategy.test.ts` | `npx vitest run tests/session/presentation-strategy.test.ts` |
| Strategy / no child login | Switch does not insert app_user | `tests/session/presentation-strategy.test.ts` | `npx vitest run tests/session/presentation-strategy.test.ts` |
| session GET / default Parent | GET `/api/session` Parent | `tests/session/session-api.test.ts` | `npx vitest run tests/session/session-api.test.ts` |
| session POST / Child | POST context Child persists | `tests/session/session-api.test.ts` | `npx vitest run tests/session/session-api.test.ts` |
| session POST / restore Parent | POST Parent after Child | `tests/session/session-api.test.ts` | `npx vitest run tests/session/session-api.test.ts` |
| session POST / invalid 400 | Operator role 400 | `tests/session/session-api.test.ts` | `npx vitest run tests/session/session-api.test.ts` |
| session GET / cleared 401 | DELETE then GET 401 | `tests/session/session-api.test.ts` | `npx vitest run tests/session/session-api.test.ts` |
| InvitePolicy / titular | Titular Parent may invite | `tests/family/invite-policy.test.ts` | `npx vitest run tests/family/invite-policy.test.ts` |
| family_invite / Pending unique | Unique token_hash Pending | `tests/family/family-invite.test.ts` | `npx vitest run tests/family/family-invite.test.ts` |
| family_invite / expired | Expired accept does not join | `tests/family/family-invite.test.ts` | `npx vitest run tests/family/family-invite.test.ts` |
| invites POST / 201 Pending | Titular invite, no raw token | `tests/family/invites-api.test.ts` | `npx vitest run tests/family/invites-api.test.ts` |
| invites PATCH / accept+revoke | Member envelope; revoke | `tests/family/invites-api.test.ts` | `npx vitest run tests/family/invites-api.test.ts` |
| invites POST / non-titular 403 | Invited cannot invite | `tests/family/invites-api.test.ts` | `npx vitest run tests/family/invites-api.test.ts` |
| invites PATCH / expired 409 | Expired accept no members | `tests/family/invites-api.test.ts` | `npx vitest run tests/family/invites-api.test.ts` |
| MemberPolicy / no photo | Child member envelope | `tests/family/member-policy.test.ts` | `npx vitest run tests/family/member-policy.test.ts` |
| members envelope / INV-004 | `{ id, members }` no photo | `tests/family/members-envelope.test.ts` | `npx vitest run tests/family/members-envelope.test.ts` |
| members PUT / 200 | Titular replace envelope | `tests/family/members-api.test.ts` | `npx vitest run tests/family/members-api.test.ts` |
| members PUT / photo 400 | Photo key rejected | `tests/family/members-api.test.ts` | `npx vitest run tests/family/members-api.test.ts` |
| AddressPolicy / titular+Admin | Invited/Child denied | `tests/family/address-policy.test.ts` | `npx vitest run tests/family/address-policy.test.ts` |
| address AR / plain object | Generated city/state match | `tests/family/family-address.test.ts` | `npx vitest run tests/family/family-address.test.ts` |
| address PUT / 200 | Titular echo; empty city | `tests/family/address-api.test.ts` | `npx vitest run tests/family/address-api.test.ts` |
| SupportPolicy / panel | Parent/Child 403; titular plan | `tests/family/support-policy.test.ts` | `npx vitest run tests/family/support-policy.test.ts` |
| Plan AR / Free + RESTRICT | Seed Free; referenced delete fails | `tests/family/plan.test.ts` | `npx vitest run tests/family/plan.test.ts` |
| panel families GET/PATCH | Operator list; Parent 403; titular Free | `tests/family/panel-families-api.test.ts` | `npx vitest run tests/family/panel-families-api.test.ts` |
| fiche GET/PATCH / img_path | Values envelope; no feat_img_path | `tests/catalog-fiche/fiche-api.test.ts` | `npx vitest run tests/catalog-fiche/fiche-api.test.ts` |
| FicheBuilder / optional+ages | Bare values array throws | `tests/catalog-fiche/fiche-builder.test.ts` | `npx vitest run tests/catalog-fiche/fiche-builder.test.ts` |
| ImageAdapter / path-only | No MinIO; traversal stored as data | `tests/catalog-fiche/image-adapter.test.ts` | `npx vitest run tests/catalog-fiche/image-adapter.test.ts` |
| ReviewState / transitions | Illegal skip throws | `tests/catalog-fiche/review-state.test.ts` | `npx vitest run tests/catalog-fiche/review-state.test.ts` |
| review POST / Staff | Parent 403; draft skip rejected | `tests/catalog-fiche/review-api.test.ts` | `npx vitest run tests/catalog-fiche/review-api.test.ts` |
| listPublished / INV-001/005 | Drafts omitted; re-review hides; Parent 404 draft | `tests/catalog-fiche/family-published.test.ts` | `npx vitest run tests/catalog-fiche/family-published.test.ts` |
| mock session align / Parent↔Child | POST context aligns mock; Admin not overwritten | `tests/session/mock-session-align.test.ts` | `npx vitest run tests/session/mock-session-align.test.ts` |
| family writes / presentation | Child plan/invite/members 403; missing session 401 | `tests/family/presentation-writes.test.ts` | `npx vitest run tests/family/presentation-writes.test.ts` |
| PanelPolicy / staff | Admin/Operator allow; Parent/Child deny | `tests/panel/panel-policy.test.ts` | `npx vitest run tests/panel/panel-policy.test.ts` |
| SurfaceFacade / chrome | Panel none; family iphone-15-pro-max | `tests/panel/surface-facade.test.ts` | `npx vitest run tests/panel/surface-facade.test.ts` |
| panel session+catalog GET | Staff 200; Parent 403; drafts listed | `tests/panel/panel-api.test.ts` | `npx vitest run tests/panel/panel-api.test.ts` |
| ForecastContext AR / four seeds | rain holiday christmas back-to-school | `tests/forecast/forecast-context.test.ts` | `npx vitest run tests/forecast/forecast-context.test.ts` |
| mission_forecast_context / unique | replaceSet; duplicate/unknown reject | `tests/forecast/mission-forecast-context.test.ts` | `npx vitest run tests/forecast/mission-forecast-context.test.ts` |
| forecast-contexts GET/PUT | Envelope; Parent 403; 400/409 | `tests/forecast/forecast-api.test.ts` | `npx vitest run tests/forecast/forecast-api.test.ts` |
| ContextFilterStrategy / published | Rain filter omits drafts; no invention | `tests/forecast/context-filter-strategy.test.ts` | `npx vitest run tests/forecast/context-filter-strategy.test.ts` |
| WeatherAdapter / path-only | No live weather; traversal as data | `tests/forecast/weather-adapter.test.ts` | `npx vitest run tests/forecast/weather-adapter.test.ts` |
| panel session POST switch | HTTP sets Admin|Operator|Parent|Child; no password; family does not overwrite Admin | `tests/panel/panel-session-switch.test.ts` | `npx vitest run tests/panel/panel-session-switch.test.ts` |
| FamilyQuiz AR / kind+text | Create Family-Quiz; weight 0; empty/invalid kind throw; injection as data | `tests/questions/family-quiz.test.ts` | `npx vitest run tests/questions/family-quiz.test.ts` |
| panel questions CRUD | Admin 201+list; kind filter/PATCH/soft delete; 400; Parent 403 | `tests/questions/questions-api.test.ts` | `npx vitest run tests/questions/questions-api.test.ts` |
| KindStrategy / live offer | Family-Quiz vs Say-What; deleted excluded; injection kind as data | `tests/questions/kind-strategy.test.ts` | `npx vitest run tests/questions/kind-strategy.test.ts` |
| GET family quiz offer | Live Family-Quiz envelope; deleted omitted; injection id as data | `tests/gps/quiz-offer.test.ts` | `npx vitest run tests/gps/quiz-offer.test.ts` |
| POST family quiz answer | Envelope with bank id; empty/unknown 400; no bare array | `tests/gps/quiz-answer.test.ts` | `npx vitest run tests/gps/quiz-answer.test.ts` |
| quiz ModeStrategy | solo+table persist; default solo; invalid 400; no second table | `tests/gps/quiz-modes.test.ts` | `npx vitest run tests/gps/quiz-modes.test.ts` |
| Child vs question bank | Child PATCH panel question 403 | `tests/gps/quiz-child-bank.test.ts` | `npx vitest run tests/gps/quiz-child-bank.test.ts` |
| GET family GPS | Three envelopes; Composite rejects []; no photo; 404; quiz→profile | `tests/gps/profile-gps.test.ts` | `npx vitest run tests/gps/profile-gps.test.ts` |
| what-we-know answers | GET source id; hide deleted; empty PATCH 400; DELETE flag; Child 403; liveAnswers skip | `tests/gps/profile-answers.test.ts` | `npx vitest run tests/gps/profile-answers.test.ts` |
| GpsPolicy | Parent edit; Parent\|Child answer; Admin denied | `tests/gps/gps-policy.test.ts` | `npx vitest run tests/gps/gps-policy.test.ts` |
| calendar GET/PUT day | Envelope; unique 409; bare array 400; injection day as data | `tests/calendar/calendar-day.test.ts` | `npx vitest run tests/calendar/calendar-day.test.ts` |
| calendar published-only | Draft 422; published 200; moved+draft 422 | `tests/calendar/calendar-published.test.ts` | `npx vitest run tests/calendar/calendar-published.test.ts` |
| DayComposite | Empty envelope; reject []; scheduled/done/moved | `tests/calendar/day-composite.test.ts` | `npx vitest run tests/calendar/day-composite.test.ts` |
| CatalogPickStrategy / published | Published id; draft omitted; empty; rain context; ages; liveAnswers skip deleted | `tests/pick/pick-strategy.test.ts` | `npx vitest run tests/pick/pick-strategy.test.ts` |
| CatalogPickStrategy / history | Skip recent non-repeatable Completed; repeatable eligible; empty; injection fam_id | `tests/pick/pick-history.test.ts` | `npx vitest run tests/pick/pick-history.test.ts` |
| RankerAdapter | Published id; free-text discard; unknown id discard; leaky draft rejected | `tests/pick/pick-ranker-adapter.test.ts` | `npx vitest run tests/pick/pick-ranker-adapter.test.ts` |
| POST family missions pick | Parent catalog `{ id, mission_id }`; no candidate no title/body; Child 403; injection id | `tests/pick/pick-api.test.ts` | `npx vitest run tests/pick/pick-api.test.ts` |
| WeekListStrategy / finite published | Catalog title; cap 5; draft omitted; injection family id | `tests/calendar-ops/week-strategy.test.ts` | `npx vitest run tests/calendar-ops/week-strategy.test.ts` |
| GET forecast week | Envelope published; empty no invention; 404; Child 403 | `tests/calendar-ops/week-api.test.ts` | `npx vitest run tests/calendar-ops/week-api.test.ts` |
| POST DropOnDay | Scheduled write; merge existing day; missing day 422; unpublished 422 | `tests/calendar-ops/drop-on-day.test.ts` | `npx vitest run tests/calendar-ops/drop-on-day.test.ts` |
| PATCH calendar suggestion | done persists; move merge unique; moved without target 422; Child 403 | `tests/calendar-ops/reminders-patch.test.ts` | `npx vitest run tests/calendar-ops/reminders-patch.test.ts` |
| rhythm Observer + POST | Four repeats propose; three none; dismiss no-write; accept envelope; Child 403 | `tests/calendar-ops/rhythm-proposal.test.ts` | `npx vitest run tests/calendar-ops/rhythm-proposal.test.ts` |
| SurpriseSelectionStrategy | Published id; drafts null; non-repeatable skip; injection family id | `tests/surprise/selection-strategy.test.ts` | `npx vitest run tests/surprise/selection-strategy.test.ts` |
| AcceptedFamilyMissionFactory | Accepted insert; unpublished/missing/injection no row | `tests/surprise/accepted-factory.test.ts` | `npx vitest run tests/surprise/accepted-factory.test.ts` |
| POST surprise | Accepted catalog payload; empty `{ id, mission_id: null }`; Child 403; injection id | `tests/surprise/surprise-api.test.ts` | `npx vitest run tests/surprise/surprise-api.test.ts` |
| FamilyMissionCycle State | Accepted→Doing; Doing→Completed; skip Doing throw; Completed→Accepted throw | `tests/mission-play/cycle-state.test.ts` | `npx vitest run tests/mission-play/cycle-state.test.ts` |
| PATCH family-missions cycle | Doing; closing txn; missing closing 422; skip/reverse 422; envelope 422; counter; repeatable; Child 403; injection | `tests/mission-play/cycle-api.test.ts` | `npx vitest run tests/mission-play/cycle-api.test.ts` |
| GET completed missions | Completed only envelope; empty; unpublished keeps title; injection fam_id | `tests/mission-play/history-api.test.ts` | `npx vitest run tests/mission-play/history-api.test.ts` |
| NoteKindStrategy whitelist | Five kinds; unknown/empty/injection kind rejected | `tests/diary/kind-strategy.test.ts` | `npx vitest run tests/diary/kind-strategy.test.ts` |
| GET/POST family diary | Envelope `{ id, notes }`; five kinds; empty/photo 422; deleted hide; mission_note; foreign 422; Child 403; injection id | `tests/diary/diary-api.test.ts` | `npx vitest run tests/diary/diary-api.test.ts` |
| GET panel indicators | Zeros empty; completed SQL match; scheduled items; repeated ≥2; no table; Parent/Child 403 | `tests/indicators/indicators-api.test.ts` | `npx vitest run tests/indicators/indicators-api.test.ts` |
