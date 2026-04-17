# Design Log 004 — Design System Implementation: Phase 1

## Metadata

| Field | Value |
|-------|-------|
| **ID** | 004 |
| **Date** | 2026-04-17 |
| **Feature** | Design System Implementation — Phase 1: Fonts + CSS Token Layer |
| **Status** | Completed |
| **Parent Design Doc** | `docs/design/DESIGN.md` — "The Archive of the Infinite Rail" |

---

## Context & Problem

Ruina Atlas currently uses Tailwind's default design tokens and shadcn/ui components without a cohesive design language. The project has a strong aesthetic identity grounded in Project Moon's gothic-industrial world, but the UI does not fully reflect it.

A design system document (`DESIGN.md`) was created to codify this identity as "The Digital Curator's Ledger" — but it has not been implemented in code.

The challenge: **apply a distinctive design language without disrupting M3/M4 roadmap progress or taking on a full MD3 migration.**

---

## Design Decisions

### Approach: Selective Override, Not Full Migration

**Decision:** Keep shadcn/ui + Tailwind as the component foundation. Override and extend with custom CSS variables and Tailwind tokens rather than migrating to a Material Design 3 component library.

**Rationale:**
- shadcn/ui components are owned by us (copied into the project) — they can be modified
- Adding a full MD3 library (e.g. Material React Wrap) adds dependency weight and fights the existing stack
- The design doc's *principles* (no borders, tonal layering, glassmorphism) are implementable in plain CSS + Tailwind
- Phase 1 focuses on foundations (fonts, color tokens) that don't touch existing component markup

**Alternatives considered:**
1. Full MD3 migration — rejected: too disruptive to M3/M4 roadmap
2. Leave as-is — rejected: the design doc exists and the UI doesn't match it
3. Component-by-component refactor — deferred to Phase 4+ (lower priority than roadmap)

---

### Phase 1 Scope: Fonts + CSS Token Layer

#### 1. Font Strategy

**Decision:** Add Google Fonts via CDN `@import` in `globals.css`. Add to Tailwind `fontFamily` config.

| Font | Role | Google Fonts slug |
|------|------|-----------------|
| Newsreader | Display, headlines, chapter titles | `newsreader` |
| Space Grotesk | Labels, data points, metadata | `space-grotesk` |
| Manrope | Body text (already clean; confirm via globals.css) | `manrope` |

**Notes:**
- Manrope is already referenced in the design doc as the body font — verify if it's currently loaded
- Newsreader has optical sizes; use `wght@400..700` for flexible weight range
- Space Grotesk: `wght@400..700` for full weight range

#### 2. Color Token Layer

**Decision:** Define CSS custom properties for surface hierarchy in `globals.css`, expose as Tailwind utilities.

```css
/* Surface Hierarchy — derived from Navy Black (#111318) */
:root {
  --surface-base: #111318;
  --surface-container-lowest: #0c0e12;
  --surface-container-low: #131620;
  --surface-container: #181c27;
  --surface-container-high: #1e2330;
  --surface-container-highest: #262d3d;

  --on-surface: #e8e0d5;         /* Warm Ivory — primary text */
  --on-surface-variant: #c4bdb3; /* Muted Ivory — secondary text */
  --on-surface-subtle: #8a847a;  /* Subtle Ivory — metadata */

  --primary: #b8202f;             /* Deep Crimson */
  --on-primary: #f5f0e8;
  --primary-container: #7a151f;
  --on-primary-container: #f5e6e8;

  --secondary: #f5c518;           /* Electric Gold */
  --on-secondary: #111318;
  --secondary-container: #a07f12;
  --on-secondary-container: #f5f0d0;

  --tertiary: #a08a70;           /* Warm Bronze — accent */
  --surface-variant: rgba(30, 35, 48, 0.6); /* Glassmorphism base */

  --outline: rgba(200, 193, 180, 0.15);     /* Ghost Border (15%) */
  --outline-strong: rgba(200, 193, 180, 0.35);
}
```

**Notes:**
- Surfaces derived by lightening/darkening Navy Black in 10% steps
- Ivory tones use warm off-white (#f5f0e8) instead of pure white
- Ghost Border = `outline` at 15% opacity (exactly as specified in DESIGN.md)
- These map to Tailwind via `tailwind.config.js` `extend.colors`

#### 3. Global Base Overrides

**Decision:** Patch shadcn/ui's default `rounded-md` to `rounded-none` globally via CSS variable override in `globals.css`.

```css
/* Override shadcn/ui default radius to 0 */
.rounded-md {
  border-radius: 0 !important;
}
```

**Note:** This single override applies 0px radius to all shadcn components using `rounded-md`. Components using `rounded-sm` or `rounded-lg` should be reviewed per-component in Phase 3.

#### 4. Utility Classes to Create

| Utility | CSS | Purpose |
|---------|-----|---------|
| `.glass` | `backdrop-filter: blur(20px); background: var(--surface-variant);` | Glassmorphism overlay |
| `.ghost-border` | `outline: 1px solid var(--outline); outline-offset: 2px;` | Ghost Border per DESIGN.md |
| `.lore-fragment` | `border-left: 4px solid var(--tertiary); padding-left: 1rem; background: var(--surface-container-high);` | Lore Fragment card style |
| `.scan-line` | `border-bottom: 2px solid var(--secondary); transition: width 0.3s;` | Input focus animation |

---

## Technical Implementation

### File Changes

| File | Change |
|------|--------|
| `src/index.css` (or `App.css`) | Add `@import` for Google Fonts |
| `tailwind.config.js` | Add `fontFamily` + `colors` extending from CSS vars |
| `src/globals.css` (if separate) | Add CSS custom properties for surface tokens |
| `src/index.css` | Add global base overrides + utility classes |

### Tailwind Config Additions

```js
// tailwind.config.js — extend.fontFamily
fontFamily: {
  newsreader: ['Newsreader', 'Georgia', 'serif'],
  space: ['Space Grotesk', 'monospace'],
  manrope: ['Manrope', 'sans-serif'],
}

// extend.colors — reference CSS vars
colors: {
  surface: {
    base: 'var(--surface-base)',
    'container-lowest': 'var(--surface-container-lowest)',
    'container-low': 'var(--surface-container-low)',
    // ...
  },
  ivory: {
    DEFAULT: 'var(--on-surface)',
    muted: 'var(--on-surface-variant)',
    subtle: 'var(--on-surface-subtle)',
  },
}
```

### Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600&display=swap');
```

---

## Constraints & Considerations

1. **Vercel deployment is automatic** — any push to `main` triggers a rebuild. Changes here are low-risk but should still be PR-based.
2. **M3/M4 roadmap takes priority** — Phase 1 should take no more than 1–2 hours. If it spills into more, defer the rest.
3. **GitHub Actions currently shows no runs** — this may indicate Vercel is connected directly to the repo and not via GitHub Actions. Vercel dashboard is the source of truth for deployment status.
4. **Current Tailwind config already uses custom colors** — check existing `extend.colors` before adding to avoid conflicts.
5. **Glassmorphism on low-end devices** — `backdrop-filter: blur()` is GPU-intensive. The `.glass` utility should be used sparingly and tested on mobile.

---

## Integration Notes

- **LorePanel.tsx** — once Phase 1 is in, the LoreFragment style can be applied to literary source quotes
- **FilterPanel.tsx** — Ghost Border utility is ideal for filter group separators
- **SourceExplorer.tsx / ThemeGuide.tsx** — modals are prime candidates for glass overlay
- **Graph tooltip** — Space Grotesk font already fits the "technical schematic" icon rule

---

## Related Components

- `src/index.css` / `src/App.css` — globals
- `tailwind.config.js` — design token exposure
- `src/components/LorePanel.tsx` — Phase 2 candidate (lore fragment styling)
- `src/components/FilterPanel.tsx` — Phase 2 candidate (ghost border)
- `src/components/SourceExplorer.tsx` / `ThemeGuide.tsx` — Phase 2 candidate (glass overlay)

---

## Revision History

| Revision | Date | Summary |
|----------|------|---------|
| 1.0 | 2026-04-17 | Initial draft — Phase 1 scope (fonts + CSS token layer) |

---

## Questions & Open Items

- [ ] **Q1:** Does `src/App.css` or `src/index.css` serve as globals? Need to check current file structure before adding CSS vars.
- [ ] **Q2:** Is Manrope already loaded via any existing import? If so, skip the duplicate.
- [ ] **Q3:** Should the `.glass` utility use `bg-opacity` or a CSS variable with alpha? (CSS var approach chosen above, but worth confirming Tailwind compatibility.)
- [ ] **Q4:** Is there a `tailwind.config.js` already in the project, or is it using `tailwind.config.ts` / PostCSS defaults?
- [ ] **Q5:** Should Phase 1 also patch shadcn button components directly, or defer that to Phase 3?
