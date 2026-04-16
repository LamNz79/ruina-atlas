# Ruina Atlas — Project Roadmap

**Project status:** In progress
**Last updated:** April 2026

---

## What is Ruina Atlas?

Ruina Atlas is a fan-made web tool for the Project Moon game series — *Lobotomy Corporation*, *Library of Ruina*, and *Limbus Company*. It has two main features:

1. **An interactive lore graph** — a visual map connecting the 13 Sinners to their real-world literary origins (the books, stories, and characters they're based on), and showing how they appear across all three games.
2. **A lore-aware team builder** — a team composition tool that lets you filter by literary origin and thematic connections, not just damage numbers. A unique angle compared to tools like Prydwen or GLL.

Both features share the same underlying database of character and lore information.

---

## What Makes This Different?

No existing fan tool maps the literary sources behind Project Moon's characters. Ruina Atlas fills that gap — it's the tool only a fan who actually knows the lore can build.

The focus is on the **lore layer**: who a Sinner is based on, what themes they carry across games, how they connect to other characters. For mechanical stats and tier lists, it links out to existing wikis rather than trying to compete with them.

---

## Roadmap Overview

| # | Feature | Status |
|---|---------|--------|
| M1 | Build the shared data model | ✅ Done |
| M2 | Launch the lore graph (basic version) | ✅ Done |
| M3 | Expand the lore graph with full content | 🔄 In progress |
| M4 | Add individual Sinner profile pages | ⏳ Not started |
| M5 | Build the lore-aware team builder | ⏳ Not started |
| M6 | Add cross-game search | ⏳ Not started |

---

## Milestones in Detail

### ✅ M1 — Shared Data Foundation
*Completed April 13, 2026*

Before any visuals or UI, the project needed a solid database of characters. This milestone built the foundation that everything else reads from.

**What was built:**
- A structured data format defining each Sinner's literary source, themes, and cross-game appearances
- Seed data covering all 13 Sinners: Dante, Faust, Ishmael, Sinclair, Don Quixote, Ryoshu, Meursault, Hong Lu, Heathcliff, Yi Sang, Rodion, Outis, and Gregor

---

### ✅ M2 — Lore Graph (Basic Version)
*Completed April 15, 2026*

The first working version of the interactive graph, live on the web.

**What was built:**
- An interactive graph where each Sinner is a node you can click
- Clicking a node shows their literary source, themes, and which games they appear in
- Edges (connecting lines) show literary origins, shared themes, and cross-game links
- Deployed publicly at a Vercel URL

**Next step after launch:** Share with r/LimbusCompany and the wiki Discord for community feedback.

---

### 🔄 M3 — Lore Graph (Full Content)
*In progress — estimated 2–4 weeks of evenings*

Expanding the graph with richer data and polish.

**What's being added:**
- Canto-by-canto story annotations (with a spoiler toggle)
- Cross-game entities: Angela/Ayin, the Wings, key Abnormalities
- A literary source explorer panel showing the original book, author, and themes adapted
- Filters by game, theme, and literary origin

This milestone is content-heavy — it can be shipped patch by patch rather than all at once.

---

### ⏳ M4 — Sinner Profile Pages
*Not started — estimated 1 week*

Rich individual pages for each Sinner, cross-linked from their graph nodes.

**What will be built:**
- A full profile: lore summary, literary source, all Identities and EGOs
- Cross-game timeline
- Links out to existing wikis for mechanical/gameplay detail

The goal is to cover what wikis don't: the deep lore layer, not the stats.

---

### ⏳ M5 — Lore-Aware Team Builder
*Not started — estimated 2–3 weeks*

The second major feature. A team builder that filters by literary and thematic connections, not just combat numbers.

**What will be built:**
- A team slot UI (6 Sinners, 1 Identity + 1 EGO each)
- Filters by: damage type, literary origin, theme, game
- Resonance highlights: pairs that share a literary source or thematic arc
- Save and share teams via URL

This will be built after M3, once there's an active community who can weigh in on what filters they actually want.

---

### ⏳ M6 — Cross-Game Search
*Not started — estimated 3–5 days*

A single search box spanning all three games.

**Example:** Search "Angela" → see her Lobotomy Corporation origin, Library of Ruina arc, and Limbus appearances in one result.

---

## Key Decisions

- **Data before UI** — the character database was built first, before any visuals
- **Lore graph first** — more unique than a team builder, and a stronger proof of concept
- **Don't compete with Prydwen/GLL** — link out for mechanical data, focus on the lore layer they don't have
- **No backend needed** — all data is stored as static files; no server required for the MVP
