// ─────────────────────────────────────────────────────────────────────────────
// Runia Atlas — Core Type Definitions
// Design log: design-log/001-data-layer-design-log.md
// ─────────────────────────────────────────────────────────────────────────────

// ── Game Platform ────────────────────────────────────────────────────────────

export type Game = 'lobotomy' | 'ruina' | 'limbus';

export type GameAppearance = Game[];

// ── Theme System ─────────────────────────────────────────────────────────────

/**
 * Thematic tags derived from the const array.
 * Typed as typeof THEMES[number] so the list is the single source of truth.
 */
export type Theme = typeof THEMES[number];

export const THEMES = [
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

// ── Literary Source ──────────────────────────────────────────────────────────

/**
 * A book, work, or author referenced by one or more Sinners.
 * Stored by ID in literarySources.json; referenced by Sinner entries via LiterarySourceRef.
 */
export interface LiterarySource {
  id: string;
  title: string;
  author: string;
  year?: number;
  language: string;
  passage?: string;
  passageContext?: string;
  /**
   * Graph grouping — sources from the same work share a group node.
   * e.g. 'divine-comedy' groups Inferno / Purgatorio / Paradiso refs.
   */
  sharedGroup?: string;
  themes: Theme[];
  wikiUrl?: string;
}

/**
 * A reference to a LiterarySource, embedded in a Sinner entry.
 * The actual LiterarySource object lives in literarySources.json; this is an ID + metadata.
 */
export interface LiterarySourceRef {
  id: string; // key into literarySources.json
  role: 'primary' | 'secondary' | 'influence';
  /**
   * Plain-language description of the specific connection.
   * e.g. "Yi Sang's poem 'Fog' mirrors the original work's atmosphere of despair."
   */
  specificConnection: string;
}

// ── Identity & EGO ────────────────────────────────────────────────────────────

/**
 * A named identity variant a Sinner can equip.
 * Corresponds to the "book" system in Limbus Company.
 */
export interface Identity {
  id: string;
  displayName: string;
  sourceGame: Game;
  wingOrGroup?: string; // e.g. "Liu Association", "Nightmare Discord"
  damageType?: string;  // e.g. "Pierce", "Slash", "Blunt" — optional
  loreNote?: string;
}

/**
 * An EGO equipment piece associated with a Sinner.
 * Corresponds to the EGO system from Lobotomy Corporation.
 */
export interface EGO {
  id: string;
  displayName: string;
  rank: string;        // ZAYIN | TETH | HE | WAW | ALEPH
  floor: string;      // e.g. "Moutheast Corner" — raw string, may become union later
  colorTheme: string; // hex accent color, e.g. '#7A3B8C'
  description: string;
}

// ── Sinner (Core Entity) ──────────────────────────────────────────────────────

export interface Sinner {
  id: string;              // slug, e.g. 'yi-sang'
  name: string;            // display name
  canonicalGame: Game;     // game where they first appear as playable
  appearances: GameAppearance;
  /**
   * Whether the entity physically appears across multiple games
   * (vs. being a "spiritual" or "literary" echo).
   */
  crossGameContinuity: boolean;

  literarySources: LiterarySourceRef[];
  themes: Theme[];

  /** 2–4 sentence fan-accurate lore summary. No Canto 9+ spoilers in M1. */
  loreSummary: string;
  /**
   * Explains the specific literary connection — why this book, what is adapted,
   * and how Project Moon transformed the source material.
   */
  literaryConnectionNotes: string;

  identities: Identity[];
  egos: EGO[];

  /**
   * Optional node-size override for the D3 graph.
   * If omitted, size is derived from number of literary sources.
   */
  graphNodeSize?: number;
}

// ── Graph Edge (Derived at Runtime) ─────────────────────────────────────────

/**
 * Graph edge — derived at runtime, NOT stored in JSON.
 * Computed by the D3 component from Sinner.literarySources[] and Sinner.themes[].
 *
 * @see src/utils/deriveEdges.ts
 */
export type EdgeType = 'literary-origin' | 'thematic-link' | 'cross-game-continuity' | 'shared-literary-group';

export interface GraphEdge {
  source: string; // Sinner.id
  target: string; // Sinner.id
  type: EdgeType;
}

// ── Asset Map ────────────────────────────────────────────────────────────────

/** Maps identity ID → image path (null = no image available). */
export type IdentityImageMap = Record<string, string | null>;
