# 002-lore-graph-full-content-requirement.md

> **Feature:** M3 - Lore Graph Full Content
> **Status:** Draft
> **Date:** 2026-04-15
> **Roadmap ref:** `roadmap.json` -> M3
> **Design log ref:** `docs/design-log/003-lore-graph-full-content-design-log.md`

---

## I am

A front-end developer maintaining a fan tool for the Project Moon community.

## I want

Expand the lore graph with richer data - fully authored entries for all 13 Sinners, a canto annotation layer, cross-game entities, a literary source explorer, and a filter panel - so the community has a single authoritative reference for literary and lore connections across all three games.

## So that

- the lore graph is complete enough to serve as a community reference tool
- the canto annotation system stays spoiler-safe for new players
- cross-game entities show meaningful continuity across all three games
- literary sources can be browsed independently of the graph
- users can narrow the graph by game, theme, and literary origin

---

## AC1 - All 13 Sinners Fully Authored

- [ ] Every Sinner in `sinners.json` has a complete `loreSummary` (3-5 sentences, fan-accurate, no unreleased-story assumptions)
- [ ] Every Sinner has complete `literaryConnectionNotes` explaining why the source fits and what Project Moon changed
- [ ] Every Sinner has at least 1 strong `primary` literary source entry
- [ ] Add `secondary` and `influence` entries only when the connection is specific, explainable, and defensible from the character text, naming, themes, or established fan/lore reading
- [ ] Do not pad `literarySources` to hit a quota with weak parallels or generic thematic overlap
- [ ] Dante's missing identities and EGOs are researched and kept empty if that remains the correct released-content state

Editorial note:

- `primary` is mandatory
- `secondary` is preferred when clearly justified
- `influence` is optional and should only be used when the connection is still meaningfully defensible

Current research buckets for Sinners with 2 sources:

- `solid at 2 for now`: Ishmael, Don Quixote, Meursault, Hong Lu, Heathcliff, Rodion, Outis, Gregor
- `likely has a defensible 3rd source`: Sinclair
- `needs deeper research before expanding`: none currently beyond the normal review queue

## AC2 - Canto Annotation Layer (Spoiler-Gated)

- [ ] Each Sinner entry has a `cantos` array with released-content-only appearances
- [ ] A spoiler toggle in the UI hides post-threshold canto content by default
- [ ] Major appearances are flagged where appropriate
- [ ] No canto annotation should imply unreleased content is already live

## AC3 - Cross-Game Entities

- [ ] `src/data/crossGameEntities.json` covers recurring characters, Wings, and selected Abnormalities with defensible summaries
- [ ] Cross-game entities are rendered as a distinct node type in the graph
- [ ] Entity detail panel shows name, game appearances, literary origin when applicable, and a brief lore note
- [ ] If an entity has no direct Sinner links yet, the UI should show that explicitly instead of failing silently

## AC4 - Literary Source Explorer Panel

- [ ] Clicking a literary source in a Sinner detail opens a dedicated source explorer view
- [ ] The explorer shows title, author, year, passage, themes, and connected Sinners
- [ ] Connected Sinners link back into the main graph
- [ ] Invalid or stale source ids fail gracefully in the UI

## AC5 - Filter Panel

- [ ] The graph sidebar has a collapsible filter panel
- [ ] Filters support game, theme, and literary origin
- [ ] Active filters update the graph in real time
- [ ] Nodes outside the filter set are dimmed, not removed
- [ ] "Clear all filters" resets all toggle states
- [ ] Filter state is not persisted across sessions in M3

## AC6 - UX Polish

- [ ] Node hover tooltip shows Sinner name, canonical game badge, and top themes
- [ ] Selected node persists when the panel closes
- [ ] Empty filter state shows a widening-selection hint
- [ ] Mobile graph remains pannable and zoomable
- [ ] Shared-group behavior should never create edges that appear to terminate in nothing

---

## Constraints And Validation Rules

- only released content should be treated as released in data and UI
- canto ids in `sinners.json` must exist in `src/data/cantos.json`
- cross-game entity ids use the `entity-` prefix
- no new type family is required beyond the existing data model
- all new data entries follow the current slug convention

---

## Open Items

- [ ] Dante identities and EGOs: confirm whether empty remains the correct released-content state
- [ ] spoiler threshold: keep default at pre-Canto 9 visibility or revise
- [ ] which Wings to deepen first after the current cleanup pass
- [ ] whether any of the `solid at 2 for now` Sinners deserve additional research in a future milestone
