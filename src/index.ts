// ─────────────────────────────────────────────────────────────────────────────
// Runia Atlas — Barrel Export
// Re-exports all types and data from a single import point.
// ─────────────────────────────────────────────────────────────────────────────

// Types
export type {
  Game,
  GameAppearance,
  Theme,
  LiterarySource,
  LiterarySourceRef,
  Identity,
  EGO,
  Sinner,
  EdgeType,
  GraphEdge,
} from './types/index';

export { THEMES } from './types/index';

// Data
export { sinners } from './data/sinners';
export { literarySources } from './data/literarySources';
