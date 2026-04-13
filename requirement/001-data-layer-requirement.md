# 001-data-layer-requirement.md

> **Feature:** M1 — Shared Data Layer
> **Status:** Draft
> **Date:** 2026-04-13
> **Design log ref:** `design-log/001-data-layer-design-log.md`

---

## Tôi là

A front-end developer building a fan tool for the Project Moon community (Lobotomy Corporation, Library of Ruina, Limbus Company).

## Tôi muốn

A clean, TypeScript-typed data layer with seed JSON for 13 Sinners, their literary sources, themes, Identities, and EGOs — before any UI is built.

## Để đạt được

- A shared schema that the lore graph (M2) and team builder (M5) both consume
- Fan-accurate data that the community can verify and extend via pull request
- A foundation that is trivial to extend as content grows (new Cantos, new Sinners)

---

## AC1 — TypeScript Schema

- [ ] `src/types/index.ts` exports all types as named exports
- [ ] No runtime dependencies in types (no classes, no `class-transformer`, no `zod`)
- [ ] `LiterarySource` objects are stored by ID in `literarySources.json`; `Sinner.literarySources` is an array of `LiterarySourceRef` (IDs only, no embedded objects)
- [ ] `Theme` is typed as `typeof THEMES[number]` derived from a `const` array
- [ ] `GameAppearance` is `Game[]` (array, not booleans)

## AC2 — Literary Sources Data

- [ ] `src/data/literarySources.json` contains ≥ 12 `LiterarySource` entries covering all M1 Sinners
- [ ] Each entry has: `id`, `title`, `author`, `language`, `themes[]`, and optionally `passage`, `passageContext`, `wikiUrl`
- [ ] All 13 Sinners in `sinners.json` have at least one `LiterarySourceRef` with `role: 'primary'`

| Literary Source | ID | Sinner(s) |
|-----------------|----|-----------|
| Dante's Inferno (Divine Comedy) | `divine-comedy` | Dante, Outis |
| Goethe's Faust | `faust-goethe` | Faust |
| Moby-Dick | `moby-dick` | Ishmael |
| Demian / Siddhartha | `demian` | Sinclair |
| Don Quixote | `don-quixote` | Don Quixote |
| The Stranger | `the-stranger` | Meursault |
| Wuthering Heights | `wuthering-heights` | Heathcliff |
| The Metamorphosis | `metamorphosis-kafka` | Gregor |
| Crime and Punishment | `crime-and-punishment` | Rodion |
| Dream of the Red Chamber | `dream-of-the-red-chamber` | Hong Lu |
| Yi Sang (Korean author) works | `kim-yi-sang` | Yi Sang |
| Utai / Rashomon | `utai-rashomon` | Ryoshu |
| The Odyssey | `odyssey` | Outis |

## AC3 — Sinner Data

- [ ] `src/data/sinners.json` contains exactly 13 Sinner entries (all 13 Limbus Sinners)
- [ ] Each entry has: `id`, `name`, `canonicalGame`, `appearances`, `crossGameContinuity`, `literarySources[]`, `themes[]`, `loreSummary`, `literaryConnectionNotes`, `identities[]`, `egos[]`
- [ ] `loreSummary` is 2–4 sentences of fan-accurate summary, no spoilers beyond what is public post-Canto 8
- [ ] `literaryConnectionNotes` explains the specific link between the Sinner and their primary source (why this book, what is adapted)

## AC4 — Identities & EGO Coverage

- [ ] Each Sinner has at least 3 `Identity` entries covering different source games (L.C., Ruina, Limbus)
- [ ] Each Sinner has at least 1 `EGO` entry with `displayName`, `floor`, `colorTheme`, `description`
- [ ] `Identity` fields: `id`, `displayName`, `sourceGame`, `wingOrGroup`, `damageType` (optional), `loreNote` (optional)
- [ ] `EGO` fields: `id`, `displayName`, `floor`, `colorTheme`, `description`

## AC5 — Graph Derivation Readiness

- [ ] The D3 graph component can derive all edge types from `literarySources[].id` and `themes[]` alone
- [ ] No edges are hardcoded in JSON — all are computed at runtime
- [ ] Two Sinners sharing the same `LiterarySource.id` produce a "Literary Origin" edge
- [ ] Two Sinners sharing the same `Theme` value produce a "Thematic Link" edge
- [ ] `crossGameContinuity: true` Sinners can be highlighted as a special edge type

## AC6 — Code Quality

- [ ] All TypeScript types use `interface` for objects and `type` for unions/aliases
- [ ] `src/index.ts` barrel-exports everything from `types/index.ts` and `data/` JSON
- [ ] Repo has a `CONTRIBUTING.md` explaining how community members can extend `literarySources.json` and `sinners.json`
- [ ] No images in this milestone (nodes are colored circles + label in M2)

---

## Constraints & Validation Rules

- All `id` fields use kebab-case slugs (e.g. `yi-sang`, `divine-comedy`)
- `appearances` array must be a subset of `['lobotomy', 'ruina', 'limbus']`
- `literarySources[].role` must be one of `'primary' | 'secondary' | 'influence'`
- `themes[]` values must exist in the `THEMES` const array
- No runtime schema validation library in M1 (pure TypeScript types only)

---

## Open Items (pre-AC sign-off)

- [x] Outis + Dante both referencing Divine Comedy — share entry, both `role: 'primary'`
- [x] Yi Sang's dual source (Korean author + Chinese classical) — two separate `LiterarySource` entries
- [x] EGO floor names — raw strings, no union type yet
- [x] No images in M1 — confirmed, colored nodes in M2
- [ ] Mantine vs Tailwind — deferred to M2 styling decision
