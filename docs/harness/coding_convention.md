# coding_convention.md

## Purpose

Define coding style and implementation preferences for an MVC-based project.

## General Style

- Prefer clear, framework-native MVC code.
- Keep code readable before clever.
- Avoid premature abstraction.
- Follow existing project conventions.
- Use explicit names for business concepts.
- Keep functions and methods focused.
- Stack: Next.js with TypeScript (SSR). Every variable must be typed. Implicit or missing types are forbidden.
- `any` is forbidden unless the user writes it. Agents never introduce `any`, `as any`, or untyped parameters.
- Prefer class properties declared in the constructor.
- Client state: `useContext` with `useEffect`. Do not add Redux, Zustand, or other global stores unless the user asks.
- UI: Tidal design system (`MASTER.md`, `Design-System/`; tokens only from `app/design-system/tokens.ts`). Soft, familial, readable colors for conservative loving parents. Flowbite is visual reference only — never import Flowbite. Loading, modals, and side menus must be animated. Mission copy is typed out (slow then fast) by the native typewriter strategy (`typewriter-reveal-strategy.ts`); no third-party typewriter library.

## MVC Conventions

Controllers:

- Parse inputs.
- Call services or models.
- Return responses.
- Avoid complex business logic.

Models:

- Represent persisted data and relationships.
- Contain simple domain behavior when natural.
- Avoid external API calls.
- Avoid large workflow orchestration.
- Active Record singleton + `queryRaw`. No ORM.

Services:

- Hold business workflows.
- Coordinate models, adapters, and jobs.
- Should be named after use cases or business actions.
- Do not introduce repositories.

Views / Presenters / Serializers:

- Format output.
- Avoid persistence and business decisions.
- Avoid hidden data fetching when possible.

Repositories / DAOs:

- Not used in this project. Do not wrap models in repositories.

## Design Pattern Conventions

Use Design Patterns only when they clarify intent.

Acceptable examples:

- `PaymentStrategy`
- `NotificationAdapter`
- `InvoiceFactory`
- `AccessPolicy`
- `CreateOrderCommand`

Avoid generic names like:

- `Manager`
- `Processor`
- `Handler`
- `Helper`
- `Util`

Unless the responsibility is very clear.

## Naming

- Controllers should describe resources or actions.
- Services should describe business workflows.
- Policies should describe permissions.
- Adapters should name the external system.
- Factories should name what they create.
- Strategies should name the interchangeable behavior.
- Variables: camelCase.
- Environment variables: SCREAMING_SNAKE_CASE.
- Parameters always start with prefix `p_` (example: `p_userId`, `p_familyId`).

User (verbatim): "Next com Typescript, nenhuma variavel pode não estar tipada, precisa seguir camelCase para variaveis SCREAMY_SNEAKY_CASE para variaveis de ambiente, apenas o user pode definir type any, paramenetros sempre começam com prefixo p_, prefira properties declaradas no construturo e use_context com use_effect para gerencialmento de estados"

## Error Handling

- Expected business failures should be explicit.
- Unexpected errors should preserve context.
- Do not leak secrets or internal traces to users.
- Do not silently ignore failures.

## Agent Rules

- Agents must keep edits aligned with MVC.
- Agents must avoid introducing DDD/Clean terminology unless enabled.
- Agents must use existing framework conventions first.
- Agents must not refactor into layers without explicit need.
- Agents must type every variable and parameter; never add `any`.
- Agents must prefix parameters with `p_`.
- Agents must not edit `.env`; document new names only in `.env.example`.
