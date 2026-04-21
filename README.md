# Ruina Atlas

> Map the literary and lore connections of Project Moon.

**Ruina Atlas** is an open-source fan tool for [Lobotomy Corporation](https://store.steampowered.com/app/568220/Lobotomy_Corporation/), [Library of Ruina](https://store.steampowered.com/app/1123810/Library_Of_Ruina/), and [Limbus Company](https://store.steampowered.com/app/1973530/Limbus_Company/).

It focuses on the part other databases usually skip: the literary layer. The app connects Sinners, books, themes, cantos, and cross-game entities in one graph-first interface.

> Work in progress. The graph and core data model are live, and M3 content expansion is underway.

---

## Current status

- [x] Shared TypeScript data model
- [x] 13 Sinner entries in `src/data/sinners.json`
- [x] Lore graph MVP in React + TypeScript + D3
- [x] Literary source explorer modal
- [x] Filter panel for game, theme, and literary source
- [x] Cross-game entity nodes and entity detail panel
- [x] Spoiler-gated canto annotations in the Sinner panel
- [ ] M3 content polish and consistency pass
- [ ] Sinner profile card/page expansion
- [ ] Lore-aware team builder

Current data snapshot:

- 13 Sinners
- 27 literary sources
- 12 cross-game entities

---

## What the app does

1. **Lore graph**
   Explore a force-directed graph linking Sinners to shared themes, literary roots, and cross-game continuity.

2. **Literary source explorer**
   Open a source such as *The Divine Comedy* or *Crime and Punishment* and see the author, themes, passage, and connected Sinners.

3. **Cross-game entity layer**
   Browse non-Sinner nodes such as Wings, abnormalities, and recurring characters with their own detail panel.

4. **Spoiler-aware canto view**
   Read canto appearances in the Sinner panel with spoiler gating enabled by default for later content.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React + TypeScript |
| Build tool | Vite |
| Graph | D3.js |
| Search | Fuse.js |
| Styling | Tailwind + shadcn/ui |
| Data | Static JSON files |
| Hosting target | Vercel |

---

## Data layout

Core data lives under `src/data`:

- `sinners.json`: main Sinner entries, literary mappings, canto notes, identities, EGOs
- `literarySources.json`: books, authors, passages, themes, shared-group metadata
- `crossGameEntities.json`: Wings, abnormalities, and recurring characters
- `cantos.json`: canto metadata and spoiler levels

Type definitions live in `src/types/index.ts`.

---

## Roadmap

The project is currently in **M3: Lore graph full content**.

Main remaining work in M3:

- complete data quality and consistency pass across Sinners, sources, and entity links
- tighten shared literary group behavior and edge semantics
- expand and verify cross-game entity coverage
- refresh project docs as implementation changes land

Full milestone tracking lives in [`docs/roadmap.json`](docs/roadmap.json).

---

## Contributing

The highest-value contributions right now are data and correctness:

- lore corrections
- source attribution fixes
- missing literary connections
- graph/UI bug reports

If you want to contribute code, open an issue or PR with the exact behavior you want to improve.

---

## Disclaimer

Ruina Atlas is an unofficial, non-commercial fan project. All game content, characters, and lore belong to [Project Moon](https://projectmoon.studio/).
