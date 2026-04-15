# 003-lore-graph-full-content-design-log.md

> **Immutability note:** This log records decisions made on 2026-04-15. Future revisions append to **Revision History**. Core sections are not retroactively rewritten.

- **ID:** `003`
- **Date:** 2026-04-15
- **Feature:** M3 — Lore Graph Full Content
- **Status:** Draft
- **Roadmap ref:** `roadmap.json` → M3

---

## 1. Context & Problem

The current M1 data layer has 13 Sinners with seed lore and basic identity/EGO counts — but:

1. **Dante is empty** — no identities, no EGOs, minimal lore depth
2. **Most Sinners have only one literary source** — the rich multi-source connections (secondary + influence) are absent
3. **No canto data** — the story progression layer is missing entirely
4. **No cross-game entity coverage** — Angela, Ayin, Wings, Abnormalities are absent from the graph
5. **No filter system** — users can browse but not narrow
6. **The literary source is hidden** — you can only reach it through a Sinner's detail, not browse books independently

M3 is the content-completeness milestone. The UI from M2 is already capable — this is filling the data and adding the filter layer.

---

## 2. Design Decisions

### 2.1 Data Structure — Canto Annotations

Extend `Sinner` type with a new optional field:

```typescript
interface CantoAnnotation {
  number: number;         // 1, 2, 3, ...
  summary: string;        // 1–2 sentence description
  isMajor: boolean;       // true = major character role, false = minor/cameo
}

interface Sinner {
  // ... existing fields
  cantos?: CantoAnnotation[];  // new — optional, M3 scope
}
```

**Why optional?** Prevents breaking changes if some Sinners have no canto data yet. Existing JSON entries without `cantos` field continue to work.

### 2.2 Data Structure — Cross-Game Entities

New file: `src/data/crossGameEntities.json`

```typescript
interface CrossGameEntity {
  id: string;             // e.g. 'entity-angela'
  name: string;
  type: 'character' | 'wing' | 'abnormality';
  canonicalGame: Game;
  appearances: GameAppearance;
  literaryOrigin?: string;    // book/author if applicable
  loreSummary: string;         // 2–3 sentences
  themes: Theme[];
  relatedSinnerIds?: string[]; // links to connected Sinners
}
```

**Why a separate file?** Cross-game entities are not Sinners — they have different fields and a different visual treatment in the graph. Keeping them in `crossGameEntities.json` keeps `sinners.json` clean and lets the D3 component route to different render paths by type.

### 2.3 Data Structure — Literary Source Explorer

No new file. The literary source explorer is a **UI layer over `literarySources.json`**. The same data that powers Sinner connections also powers the standalone explorer. This is an architectural win — one source of truth, two access patterns.

### 2.4 Filter Panel Architecture

Filters live in `LoreGraph.tsx` as local React state:

```typescript
interface FilterState {
  games: Set<Game>;           // which games to show
  themes: Set<Theme>;         // which themes to show
  literarySources: Set<string>; // which source IDs to show
}
```

- Filters are **inclusive** — a node must match at least one active filter in each category to remain visible
- **Between categories** (game × theme × source): all three must match = AND logic
- **Within each category**: any match = OR logic (e.g. "Moby-Dick" OR "Faust" = show both)

**Dim, don't remove:** Nodes outside the filter set get `opacity: 0.15` — the graph structure remains visible, making filter exploration intuitive rather than jarring.

### 2.5 Spoiler Toggle Architecture

```typescript
interface SpoilerState {
  enabled: boolean;   // false = hide Canto 9+, true = show all
}
```

- Default: `enabled: false` (new-player-safe)
- Toggle is a simple `Switch` component in the graph header
- **No localStorage in M3** — state resets on refresh. localStorage persistence deferred to M5 alongside URL param sharing.

### 2.6 Cross-Game Entities in the Graph

New `entityType` field on graph nodes:

```typescript
interface GraphNode {
  // ... existing fields
  nodeType: 'sinner' | 'entity';   // new — determines render style
}
```

Visual treatment:
- **Sinner nodes:** colored circle, size proportional to number of literary sources (existing behavior)
- **Entity nodes:** diamond/rhombus shape, outlined rather than filled, distinct color family

Edge behavior: entity nodes can connect to Sinners via `relatedSinnerIds[]`. These edges render with a distinct dashed style.

---

## 3. Technical Implementation

### 3.1 File Structure

```
src/
  data/
    sinners.json          ← extend with cantos[]
    literarySources.json  ← already exists, no changes needed
    crossGameEntities.json  ← new — M3
  components/
    LoreGraph.tsx         ← extend with filter state + entity nodes
    LorePanel.tsx         ← extend with spoiler toggle + source explorer
    FilterPanel.tsx       ← new — collapsible filter UI
    SourceExplorer.tsx    ← new — literary source browse modal
    CrossGameEntityPanel.tsx ← new — entity detail panel
```

### 3.2 New Types (src/types/index.ts)

```typescript
// Add to existing Sinner interface via intersection type
interface CantoAnnotation {
  number: number;
  summary: string;
  isMajor: boolean;
}

// New — cross-game entity
interface CrossGameEntity {
  id: string;             // prefixed 'entity-{slug}'
  name: string;
  type: 'character' | 'wing' | 'abnormality';
  canonicalGame: Game;
  appearances: GameAppearance;
  literaryOrigin?: string;
  loreSummary: string;
  themes: Theme[];
  relatedSinnerIds?: string[];
}

type NodeType = 'sinner' | 'entity';
```

### 3.3 Filter State in LoreGraph

```typescript
const [filters, setFilters] = useState<FilterState>({
  games: new Set(['lobotomy', 'ruina', 'limbus']),
  themes: new Set(THEMES),
  literarySources: new Set(literarySources.map(s => s.id)),
});
```

Filter application at render time — nodes receive opacity based on whether they match the current filter set. No re-simulation needed.

### 3.4 Dependencies

- No new runtime dependencies in M3
- Uses existing shadcn `Switch` for spoiler toggle
- Uses existing shadcn `Card` for filter panel sections
- No D3 API changes — same force layout, new node type

---

## 4. Constraints & Considerations

- **Dante's identities/EGOs** are the highest-risk data gap. Dante has no playable identity in Limbus — research whether any exist in LC or Ruina, or whether this is expected to remain empty.
- **Canto data is spoilery by nature.** Annotations must be clearly marked and gated. The toggle default must be safe for new players.
- **Cross-game entity count** — start with 5–8 entities (Angela, Ayin, 3 Wings, 2 Abnormalities). Expand in future patches.
- **Literary source explorer** — keep it lightweight in M3. A modal is sufficient. A dedicated tab within the detail panel adds complexity and is deferred.
- **No backend.** All data is static JSON. Cross-game entities are added to the JSON file, not fetched dynamically.

---

## 5. Integration Notes

### LoreGraph.tsx
- Reads `crossGameEntities.json` alongside `sinners.json`
- Renders two node types: `sinner` and `entity`
- Filter state passed down from `LoreGraph` to sub-components
- Filtered nodes get `opacity: 0.15` via D3 `.attr('opacity', ...)`

### LorePanel.tsx
- Receives `spoilerEnabled` prop from `App.tsx` (or manages locally in panel)
- Renders canto annotations conditionally based on spoiler state
- Literary source badges link to `SourceExplorer` modal

### FilterPanel.tsx (new)
- Self-contained component
- Reads `literarySources` and `THEMES` from `src/index.ts` barrel
- Emits `onFilterChange` to parent

### SourceExplorer.tsx (new)
- Modal triggered from `LorePanel` literary source badge click
- Reads `literarySources.json` directly
- Shows all Sinners with `role: 'primary' | 'secondary'` for that source

---

## 6. Related Components

| Component | Changes |
|-----------|---------|
| `src/types/index.ts` | Add `CantoAnnotation`, `CrossGameEntity`, `NodeType` |
| `src/data/sinners.json` | Add `cantos[]` to all 13 entries, fix Dante identities/EGOs |
| `src/data/crossGameEntities.json` | New — 5–8 entity entries |
| `src/components/LoreGraph.tsx` | Filter state, entity node rendering, dimming logic |
| `src/components/LorePanel.tsx` | Spoiler toggle, canto rendering, source badge → modal |
| `src/components/FilterPanel.tsx` | New — filter UI |
| `src/components/SourceExplorer.tsx` | New — literary source modal |
| `src/components/CrossGameEntityPanel.tsx` | New — entity detail panel |

---

## 7. Revision History

| Date | Change | Log |
|------|--------|-----|
| 2026-04-15 | Initial draft — M3 full content scope | 003 |

---

## 8. Questions & Open Items

- [ ] **Dante identities/EGOs** — how many expected? Does Dante appear as a playable character in Lobotomy Corporation or Library of Ruina at all? Need fan research before data entry.
- [ ] **Spoiler gate threshold** — default OFF hides Canto 9+. Does the community standard consider "Canto 8 complete" as spoiler-free, or is it lower (Canto 7)?
- [ ] **Literary source explorer UX** — modal overlay vs. tab within existing detail panel?
- [ ] **Which 5 Wings to cover first?** W Corp, Liu, R Corp, Index, N Corp are the most prominent. Confirm or prioritize.
- [ ] **Which 2–3 Abnormalities for M3?** Suggestions: The Silent Girl (LC → Ruina), The Red Shoes (LC → Ruina), Blood Bath (LC → Ruina) — all have notable literary connections. Confirm.
- [ ] **Filter state persistence** — confirmed no localStorage in M3. Confirm this is acceptable for the MVP scope.
