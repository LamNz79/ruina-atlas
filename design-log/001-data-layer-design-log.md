# 001-data-layer-design-log.md

> **Immutability note:** This log records decisions made on 2026-04-13. Future revisions append to **Revision History** or spawn a new log. Core sections are not retroactively rewritten.

- **ID:** `001`
- **Date:** 2026-04-13
- **Feature:** M1 — Shared Data Layer
- **Status:** Draft
- **Roadmap ref:** `project_moon_roadmap.json` → M1

---

## 1. Context & Problem

Before any UI (lore graph, team builder) can be built, all consuming components need a **single, authoritative schema** for:
- Sinners and their cross-game identity
- Literary sources (book, author, passage)
- Themes (guilt, vengeance, metamorphosis, etc.)
- Identities and EGOs attached to each Sinner
- Edge types for the lore graph

Currently there is no data layer — the roadmap says this must ship before M2. The work is fan-knowledge authoring, not algorithmic.

---

## 2. Design Decisions

### 2.1 Entity Model

Five core types in `src/types/index.ts`:

| Type | Purpose |
|------|---------|
| `LiterarySource` | A book or work that inspired a Sinner's identity/theme |
| `Theme` | A thematic tag (guilt, vengeance, decay, etc.) — string union for now, extensible |
| `GameAppearance` | Enum flag — which of the 3 games this entity appears in |
| `Identity` | A named identity variant a Sinner can wear (e.g. "Liu Association Section 4") |
| `EGO` | An EGO equipment piece (name + floor of L.C. origin) |
| `Sinner` | The canonical entity — base lore, literary connections, theme tags, list of Identities and EGOs |

**No separate `Edge` type** — graph edges are **derived at runtime** from `Sinner.literarySources[]` and `Sinner.themes[]`. Two Sinners with the same `LiterarySource` produce a "shares literary origin" edge. Same `Theme` = "thematic link" edge. Cross-game continuity edges are explicit boolean flags on `Sinner`.

### 2.2 Edge Derivation Rules (runtime)

| Condition | Edge Label |
|-----------|------------|
| Same `LiterarySource.id` | Literary Origin |
| Same `Theme` value | Thematic Link |
| `crossGameContinuity: true` on one or both | Cross-Game Continuity |
| Both in `literarySource.sharedGroup` (e.g. "Divine Comedy" group) | Shared Literary Group |

### 2.3 Game Appearance Flag

```typescript
type Game = 'lobotomy' | 'ruina' | 'limbus';
type GameAppearance = Game[]; // e.g. ['ruina', 'limbus']
```

No separate boolean fields. `GameAppearance` is always an array so filters are simple `includes()` checks.

### 2.4 Theme as String Union (not enum YET)

Themes are low-cardinality strings for now. Defined as `const THEMES = [...] as const` so the type is `THEMES[number]`. Upgraded to a full `enum` only when the list stabilizes.

Initial theme set: `guilt`, `vengeance`, `decay`, `metamorphosis`, `absurdity`, `redemption`, `futility`, `identity-fragmentation`, `machinery`, `nihilism`, `faith`, `family`

### 2.5 File Structure

```
src/
  types/
    index.ts          ← all TypeScript interfaces / types
  data/
    sinners.json      ← array of Sinner objects (12–13 entries, M1 scope)
    literarySources.json  ← lookup table, referenced by sinner entries
  index.ts            ← barrel re-export
```

No subdirectory per Sinner. Flat `sinners.json` array keeps D3 graph data normalization simple.

### 2.6 Import Strategy for React

`import type { Sinner } from '../types';` — all types are `import type` only, zero runtime dependency. No class, no runtime validation library in M1.

---

## 3. Technical Implementation

### 3.1 Types — Sinner

```typescript
interface Sinner {
  id: string;                    // slug, e.g. 'yi-sang'
  name: string;                  // display name
  canonicalGame: Game;           // game where they first appear as playable
  appearances: GameAppearance;  // which games they show up in
  crossGameContinuity: boolean; // do they physically appear across games?

  literarySources: LiterarySourceRef[];  // references, not embedded
  themes: Theme[];

  // Lore section (plain text, supports markdown in rendering)
  loreSummary: string;
  literaryConnectionNotes: string; // how the source material connects to this Sinner specifically

  // Attached content
  identities: Identity[];
  egos: EGO[];

  // Graph rendering hints
  graphNodeSize?: number;  // optional override, default derived from number of sources
}

interface LiterarySourceRef {
  id: string;   // key into literarySources.json
  role: 'primary' | 'secondary' | 'influence';
  specificConnection: string; // e.g. "Yi Sang's poem 'Fog' mirrors the original's despair"
}

interface Identity {
  id: string;
  displayName: string;
  sourceGame: Game;
  wingOrGroup?: string;  // e.g. "Liu Association", "Nightmare Discord"
  damageType?: string;   // optional, for team builder filtering
  loreNote?: string;
}

interface EGO {
  id: string;
  displayName: string;
  floor: string;       // e.g. "Moutheast Corner"
  colorTheme: string;  // hex for UI accent, e.g. '#7A3B8C'
  description: string;
}
```

### 3.2 Types — LiterarySource

```typescript
interface LiterarySource {
  id: string;           // key, e.g. 'divine-comedy'
  title: string;        // display title
  author: string;
  year?: number;
  language: string;
  passage?: string;     // notable quote excerpt, optional
  passageContext?: string; // who is speaking in the passage

  // Graph grouping — sources from same work share a group node
  sharedGroup?: string;  // e.g. 'divine-comedy' groups Inferno/Ciardi/Purgatorio refs
  theme: Theme[];       // themes this source explores

  // Useful for link-out
  wikiUrl?: string;
}
```

### 3.3 Type — Theme

```typescript
type Theme = typeof THEMES[number];

const THEMES = [
  'guilt',
  'vengeance',
  'decay',
  'metamorphosis',
  'absurdity',
  'redemption',
  'futility',
  'identity-fragmentation',
  'machinery',
  'nihilism',
  'faith',
  'family',
] as const;
```

### 3.4 Type — Game

```typescript
type Game = 'lobotomy' | 'ruina' | 'limbus';
```

### 3.5 Seed Data Coverage (M1 scope)

13 Sinners, 12–15 `LiterarySource` entries.

Covered: Dante, Faust, Ishmael, Sinclair, Don Quixote, Ryoshu, Meursault, Hong Lu, Heathcliff, Yi Sang, Rodion, Outis, Gregor.

| Sinner | Primary Literary Source |
|--------|------------------------|
| Dante | Dante's Inferno (Divine Comedy) |
| Faust | Goethe's Faust |
| Ishmael | Moby-Dick |
| Sinclair | Hermann Hesse — Demian / Siddhartha |
| Don Quixote | Cervantes — Don Quixote |
| Ryoshu | Utai (Japanese poetry), Rashomon |
| Meursault | Camus — The Stranger |
| Hong Lu | Dream of the Red Chamber (红楼梦) |
| Heathcliff | Brontë — Wuthering Heights |
| Yi Sang | Yi Sang (Korean author) — The Flight of Earth + Kim Sodam |
| Rodion | Dostoevsky — Crime and Punishment |
| Outis | Homer — Odyssey (nobody = Odysseus) |
| Gregor | Kafka — The Metamorphosis |

Secondary sources and thematic links will be added in M3 (full content).

---

## 4. Constraints & Considerations

- **No backend.** Static JSON files committed to the repo. No API, no DB.
- **No runtime validation in M1.** Types are the schema. M3 may add `zod` if a community contributor asks for it.
- **LiterarySource refs are IDs only.** The actual LiterarySource objects live in `literarySources.json`. This avoids duplicating title/author across sinner entries.
- **Graph edges are derived, not stored.** This keeps the JSON clean and guarantees edges are always consistent with the data. The D3 graph component computes edges from the data at mount time.
- **No images in M1.** Identities and EGOs may have art — defer to M4 (profile cards) when CDN strategy is decided.

---

## 5. Integration Notes

### Frontend (React)

```typescript
// Lazy load — only the JSON slice you need
const sinnerData = useMemo(() => sinnerJson as Sinner[], [sinnerJson]);
```

### D3 Graph (M2)

```typescript
// Edges derived at runtime from data
const edges = useMemo(() => {
  return deriveEdges(sinnerData); // → { source, target, type }[]
}, [sinnerData]);
```

### Team Builder (M5)

Filters work on `identities[].wingOrGroup`, `identities[].damageType`, `themes[]`, `literarySources[].id`.

---

## 6. Related Components

| Component | Relationship |
|-----------|-------------|
| `src/types/index.ts` | Consumed by all components |
| `src/data/sinners.json` | Primary data, M1 deliverable |
| `src/data/literarySources.json` | Lookup, M1 deliverable |
| D3 graph component (M2) | Reads `literarySources[]` and `themes[]` to compute edges |
| Team builder (M5) | Reads `identities[]`, `themes[]`, `literarySources[]` for filters |

---

## 7. Revision History

| Date | Change | Log |
|------|--------|-----|
| 2026-04-13 | Initial draft | 001 |

---

## 8. Questions & Open Items

- [ ] **Outis + Dante both reference Divine Comedy** — do they share a `LiterarySource` entry or have separate refs? Decision: share `divine-comedy` entry, both get `role: 'primary'`, graph shows shared origin edge.
- [ ] **Yi Sang's literary complexity** — Yi Sang (the Sinner) references both Yi Sang (Korean author) AND classical Chinese poetry. Should `literarySources` distinguish between author-as-source vs. poem-as-passage? Decision: two separate `LiterarySource` entries, `kim-yi-sang` and `chinese-classical-poetry`, both with `role: 'primary'`.
- [ ] **EGO floor names** — should these be raw strings or a union type? Decision: raw strings for now. The 20+ floor names from L.C. can be a union later.
- [ ] **No images in M1** — confirm this is acceptable for M2 graph MVP (nodes can be colored circles + label). Profile card images deferred to M4.
- [ ] **Mantine vs Tailwind** — no decision needed for data layer. Noted for M2 UI work.