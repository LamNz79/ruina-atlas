# 003-lore-graph-full-content-design-log.md

> **Immutability note:** This log records the M3 direction and later editorial corrections. Revisions should append rather than silently rewrite the decision trail.

- **ID:** `003`
- **Date:** `2026-04-15`
- **Feature:** `M3 - Lore Graph Full Content`
- **Status:** `active`
- **Roadmap ref:** `docs/roadmap.json` -> `M3`

---

## 1. Context

M3 started as a content-completeness milestone: more canto coverage, more entity nodes, more literary source data, and stronger browse flows around the graph.

As the repo matured, one editorial problem became obvious:

- a hard quota for literary sources pushes the data toward weak or speculative connections

That is the wrong tradeoff for Ruina Atlas. The project is more useful as a trustworthy literary map than as an artificially complete graph.

---

## 2. Decision

### 2.1 Literary Source Standard

The old editorial target was effectively:

- every Sinner should have 3 or more literary source entries

The revised standard is:

- every Sinner must have 1 strong `primary` source
- add `secondary` only when the connection is specific and explainable
- add `influence` only when the connection is still genuinely defensible
- do not add entries just to satisfy a numeric target

This is the correct bar for the project because the graph is interpretive. Weak edges damage trust faster than missing optional edges.

### 2.2 Source Categories

`primary`
- the central literary basis for the Sinner

`secondary`
- a clearly adjacent text, authorial work, or closely related literary frame that strengthens interpretation

`influence`
- a looser but still defensible connection that helps explain the adaptation

If a candidate source cannot be defended in one or two specific sentences, it should not be added.

### 2.3 Canto Data Standard

Canto annotations must reflect released content only.

This means:

- no pre-authoring released summaries for unreleased cantos
- no implying a future focus canto has already happened
- use `src/data/cantos.json` as the release-gated source of valid canto ids

### 2.4 Entity Standard

Cross-game entities should be treated with the same editorial caution:

- use literary origin only when the connection is meaningful
- keep Project Moon original entities marked as such when appropriate
- prefer an explicit empty state over invented Sinner relationships

---

## 3. Current Editorial Classification

After the M3 consistency pass, the remaining 2-source Sinners are:

- Ishmael
- Sinclair
- Don Quixote
- Meursault
- Hong Lu
- Heathcliff
- Rodion
- Outis
- Gregor

Working classification:

- `solid at 2 for now`: Ishmael, Don Quixote, Meursault, Hong Lu, Heathcliff, Rodion, Outis, Gregor
- `likely has a defensible 3rd source`: Sinclair

This classification is not a promise that more entries are needed. It is only a research queue.

---

## 4. Implementation Notes

The M3 consistency pass established a few concrete rules in the code and data:

- shared-group graph nodes should only exist when they actually group multiple Sinners
- invalid source ids should fail gracefully in the source explorer
- invalid entity ids should fail gracefully in the entity panel
- entities with zero linked Sinners should show an explicit authored empty state
- canto ids in `sinners.json` should be validated against `src/data/cantos.json`

---

## 5. Consequences

Positive:

- the graph becomes more trustworthy
- future literary additions are easier to defend
- release-sensitive story data is less likely to drift into misinformation

Tradeoff:

- some Sinners will remain at 2 sources for now
- the graph may look less dense than a quota-driven version

This is acceptable. Accuracy is the better product decision.

---

## 6. Next Editorial Work

- review Sinclair first for a possible defensible third source
- leave the `solid at 2 for now` group alone unless better evidence appears
- continue improving entity summaries and release-sensitive canto coverage as story content actually ships

---

## 7. Revision History

| Date | Change | Note |
|------|--------|------|
| 2026-04-15 | Initial M3 design log | Original draft |
| 2026-04-21 | Reframed literary-source standard around defensibility instead of quota | Post-consistency-pass correction |
