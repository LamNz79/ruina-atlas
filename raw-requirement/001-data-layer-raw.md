# Raw Requirement — M1: Shared Data Layer

**Captured:** 2026-04-13
**Source:** `project_moon_roadmap.json` → "next_action: Ask Claude to write the TypeScript data model for the shared data layer"
**Extracted by:** Claude Sonnet 4.6

---

## Raw Requirement

Before any UI work starts, we need a typed data layer covering:

- 13 Limbus Company Sinners
- Their literary origins (book, author, specific connection)
- Thematic tags (guilt, vengeance, decay, etc.)
- All available Identities and EGOs per Sinner
- Cross-game appearance flags (Lobotomy / Ruina / Limbus)

This data is consumed by the lore graph (M2) and the team builder (M5). Both tools must share one schema.

## Normalized Requirement

See: `requirement/001-data-layer-requirement.md`

---

## Notes

- Fan-knowledge work, not algorithmic. The authoring of literary connections requires fan accuracy verification.
- No backend — static JSON in the repo.
- TypeScript types must be `import type` only (zero runtime dependency).
- Graph edges are derived from data, not stored.
- 13 Sinners to cover: Dante, Faust, Ishmael, Sinclair, Don Quixote, Ryoshu, Meursault, Hong Lu, Heathcliff, Yi Sang, Rodion, Outis, Gregor.
- Literary sources to cover: Divine Comedy, Faust, Moby-Dick, Demian, Don Quixote, The Stranger, Wuthering Heights, The Metamorphosis, Crime and Punishment, Dream of the Red Chamber, Yi Sang (Korean author), Utai/Rashomon, Odyssey.