# domain_invariantes.md

## Purpose

Define the business truths that must always remain valid.

## What Is A Domain Invariant?

A domain invariant is a rule that must always be true for the business, regardless of which controller, service, job, command, import, migration, or agent changed the system.

It is stronger than a simple validation.

A validation usually checks whether one input is acceptable.  
An invariant protects the consistency of the business state over time.

Example:

- Validation: “email must have a valid format.”
- Invariant: “a user cannot belong to two tenants with conflicting access scopes.”
- Validation: “order quantity must be greater than zero.”
- Invariant: “a paid order cannot be changed in a way that alters the charged amount without issuing an adjustment.”

## Invariant Template

### INV-001: Catalog missions only

Description:

- The system never invents a mission. Choice is only from approved/published catalog activities.

Business reason:

- “A IA escolhe apenas entre atividades já aprovadas, sem inventar missões.”

Must always be true when:

- Surprise mission, weekly suggestion, calendar suggestions, mascot delivery.

Applies to:

- Controllers: mission Route Handlers
- Models: `mission`
- Services: pick / suggest
- Jobs: none
- Events: none
- Database tables: `mission` (`review_status`, `status`, `deleted`)

Enforced by:

- Model validation: yes
- Service rule: yes
- Database constraint: partial index on published + active + not deleted
- Transaction: not required for a single read
- Policy / Guard: family cannot see draft/in_review
- Test coverage: required

Failure impact:

- Unvetted content reaches a family.

### INV-002: Child is not an account; no child photo

Description:

- A child is never an app account or profile photo. Real name is allowed. Memories are text only.

Business reason:

- Apresentação: “A criança nunca é conta. Nunca é perfil. Nunca é foto.” / “Sem foto. Só história.” User: name allowed, no photo.

Must always be true when:

- Member create/update, diary notes, media upload.

Applies to:

- Controllers: members, diary, media
- Models: `app_user`, `family_diary`
- Services: member and memory writes
- Jobs: none
- Events: none
- Database tables: `app_user`, `family_diary`

Enforced by:

- Model validation: no image fields for children
- Service rule: reject child photo uploads
- Database constraint: no photo column for members
- Transaction: on member write
- Policy / Guard: Child context cannot change plan or titular data
- Test coverage: required

Failure impact:

- Child treated as a product account; photos stored against stated product rule.

### INV-003: Mission cycle

Description:

- A family mission moves Accepted → Doing → Completed. Closing `{ do_again, save_memory }` only after complete. Repeat allowed when `mission.repeatable`.

Business reason:

- “Aceitar, fazer e concluir, seguido de uma pergunta de fechamento.”

Must always be true when:

- Accept, start, complete, feedback.

Applies to:

- Controllers: family_mission
- Models: `family_mission`, `mission_feedback`
- Services: cycle
- Jobs: none
- Events: none
- Database tables: `family_mission`

Enforced by:

- Model validation: status enum
- Service rule: illegal transitions rejected
- Database constraint: status CHECK
- Transaction: status + closing together
- Policy / Guard: Parent (and Child view) per policy
- Test coverage: required

Failure impact:

- Completed count and memories lie.

### INV-004: JSON envelopes

Description:

- Hub JSON that holds lists is `{ id, <key>: [] }`, never a bare array. `address` and `closing` stay plain objects.

Business reason:

- Study schema / user envelope rule.

Must always be true when:

- Writing `family_members`, notes, quiz answers, rhythms, achievements, suggestions, `values`.

Applies to:

- Controllers: family, diary, profile, calendar, mission
- Models: those columns
- Services: writers
- Jobs: none
- Events: none
- Database tables: `family`, `family_diary`, `family_profile`, `family_calendar`, `mission`

Enforced by:

- Model validation: `json_valid` / jsonb
- Service rule: shape check
- Database constraint: CHECK json_valid (SQLite)
- Transaction: with the row write
- Policy / Guard: n/a
- Test coverage: required

Failure impact:

- Queries and screens cannot read the document.

### INV-005: Review before family use

Description:

- Draft / in_review activities are portal-only. Family surfaces only `published`.

Business reason:

- Portal “Fluxo de revisão” + AI rules.

Must always be true when:

- Catalog list in app, pick, forecast.

Applies to:

- Controllers: portal vs app
- Models: `mission`
- Services: pick / list
- Jobs: none
- Events: none
- Database tables: `mission`

Enforced by:

- Service rule: yes
- Policy / Guard: Operator/Admin vs Parent
- Test coverage: required

Failure impact:

- Unreviewed copy in the family app.

## Common MVC Enforcement Points

Model:

- Use for simple validations, relationships, and local consistency.

Service:

- Use for multi-step business workflows.

Policy / Guard:

- Use for authorization invariants.

Database:

- Use for uniqueness, foreign keys, non-null constraints, and critical consistency.

Job:

- Use cautiously; jobs should preserve invariants, not redefine them.

Controller:

- Should not be the only place enforcing important invariants.

## Concurrency Rules

- Define which invariants require transactions. INV-003 closing + status.
- Define which invariants require locking. TBD: concurrent complete of the same `family_mission`.
- Define which invariants require idempotency keys. TBD.
- Define which invariants can be eventually consistent. Indicators panel may read after write.

## Agent Rules

- Agents must check this file before changing business behavior.
- Agents must not weaken invariants without explicit approval.
- Any change affecting an invariant must include tests.
- Reviewer agents must identify touched invariants.
