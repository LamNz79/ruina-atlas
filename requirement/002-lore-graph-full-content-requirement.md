# 002-lore-graph-full-content-requirement.md

> **Feature:** M3 — Lore Graph Full Content
> **Status:** Draft
> **Date:** 2026-04-15
> **Roadmap ref:** `roadmap.json` → M3
> **Design log ref:** `design-log/003-lore-graph-full-content-design-log.md`

---

## Tôi là

A front-end developer maintaining a fan tool for the Project Moon community.

## Tôi muốn

Expand the lore graph with richer data — fully authored entries for all 13 Sinners, a canto annotation layer, cross-game entities, a literary source explorer, and a filter panel — so the community has a single authoritative reference for literary and lore connections across all three games.

## Để đạt được

- A lore graph that is complete enough to serve as a community reference tool
- A spoiler-gated canto annotation system that protects new players
- Cross-game entity coverage (Angela/Ayin, Wings, Abnormalities) that shows connections across all three games
- A literary source explorer panel for browsing books/authors independently of the graph
- A filter panel that lets users narrow by game, theme, and literary origin

---

## AC1 — All 13 Sinners Fully Authored

- [ ] Every Sinner in `sinners.json` has a complete `loreSummary` (3–5 sentences, fan-accurate, no Canto 9+ spoilers unless flagged)
- [ ] Every Sinner has complete `literaryConnectionNotes` (why this book, what is adapted, how Project Moon transformed the source)
- [ ] Every Sinner has ≥ 3 `literarySources` entries (primary + secondary + influence), with specific, non-generic `specificConnection` text
- [ ] Dante's missing identities and EGOs are researched and added

| Sinner | Primary Source | Secondary Sources |
|--------|---------------|-------------------|
| Dante | Divine Comedy | Odyssey, Outis overlap |
| Faust | Goethe's Faust | — |
| Ishmael | Moby-Dick | — |
| Sinclair | Demian | Siddhartha (Hesse) |
| Don Quixote | Don Quixote | — |
| Ryoshu | Rashomon | Utai (poetry) |
| Meursault | The Stranger | — |
| Hong Lu | Dream of the Red Chamber | — |
| Heathcliff | Wuthering Heights | — |
| Yi Sang | The Flight of Earth | Kim Sodam, classical Chinese poetry |
| Rodion | Crime and Punishment | — |
| Outis | The Odyssey | — |
| Gregor | The Metamorphosis | Kafka (other works) |

## AC2 — Canto Annotation Layer (Spoiler-Gated)

- [ ] Each Sinner entry has a `cantos` array: `cantos: { number: number, summary: string, isMajor: boolean }[]`
- [ ] A global spoiler toggle on the UI — when OFF, only pre-Canto 8 annotations are visible; when ON, all cantas shown
- [ ] Major character appearances per canto are flagged (e.g. "Faust appears and speaks in cryptic terms about the true nature of the City")
- [ ] Canto data is stored in `sinners.json` under each Sinner's entry

## AC3 — Cross-Game Entities

- [ ] `src/data/crossGameEntities.json` covers:
  - Angela / Ayin (Lobotomy → Ruina → Limbus appearances + literary origin)
  - 3–5 key Wings (W Corp, Liu Association, etc.) with brief description and game appearances
  - 3–5 key Abnormalities with literary connection notes
- [ ] Cross-game entities are rendered as distinct node type in the graph (different shape or color from Sinners)
- [ ] Entity detail panel shows: name, game appearances, literary origin, brief lore note

## AC4 — Literary Source Explorer Panel

- [ ] Clicking a literary source (in any Sinner detail) opens a dedicated source explorer view
- [ ] The explorer shows: book title, author, year, passage, themes, and all Sinners connected to this source
- [ ] "Connected Sinners" list links back into the main graph
- [ ] Data lives in `literarySources.json` — no new file needed, panel is a UI layer over existing data

## AC5 — Filter Panel

- [ ] The lore graph sidebar has a collapsible filter panel
- [ ] Filters:
  - By game: `['lobotomy', 'ruina', 'limbus']` — multi-select toggle
  - By theme: all `THEMES` values — multi-select toggle
  - By literary origin: list of all `LiterarySource.title` values — multi-select toggle
- [ ] Active filters update the graph in real-time (nodes outside filter set are dimmed, not removed)
- [ ] "Clear all filters" button resets all toggle states
- [ ] Filter state is NOT persisted across sessions (URL params deferred to M5)

## AC6 — UX Polish

- [ ] Node hover tooltip: shows Sinner name + canonicalGame badge + top 2 themes
- [ ] Selected node: persists when panel is closed (graph stays highlighted)
- [ ] Graph title updates with selected Sinner name in the panel header
- [ ] Empty filter state: show all nodes with a hint message "No nodes match current filters — try widening your selection"
- [ ] Responsive: graph is pannable/zoomable on mobile, filter panel collapses to a bottom sheet

---

## Constraints & Validation Rules

- Canto data uses `number: 1 | 2 | 3 | ...` — no string ordinals
- Cross-game entity IDs use prefix: `entity-{slug}` (e.g. `entity-angela`)
- Spoiler toggle state is local to the component — no localStorage in M3 (defer to M5)
- No new TypeScript types introduced in M3 (reuse `Sinner`, `LiterarySource`, `Theme`, `Game`)
- All new data entries use the same `id` slug convention as existing entries

---

## Open Items (pre-AC sign-off)

- [ ] Dante's identities and EGOs — research required (Dante has none in current JSON). Confirm scope: how many entries expected?
- [ ] Cross-game entities — which Wings to cover first? (Liu, W Corp, R Corp are most prominent)
- [ ] Spoiler gate threshold — default to Canto 8 or Canto 7? (Community standard check)
- [ ] Literary source explorer — open as a separate modal/panel, or tab within existing detail panel?
