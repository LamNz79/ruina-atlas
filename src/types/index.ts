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

export const THEME_META: Record<Theme, { label: string; description: string }> = {
  guilt: {
    label: 'Guilt',
    description: 'The weight of moral transgression and the drive to atone',
  },
  vengeance: {
    label: 'Vengeance',
    description: 'Retaliation as identity — violence justified by past wrongs',
  },
  decay: {
    label: 'Decay',
    description: 'Systems, bodies, and hope eroding under the weight of the City',
  },
  metamorphosis: {
    label: 'Metamorphosis',
    description: 'Transformation forced upon the self — bug, machine, or something else',
  },
  absurdity: {
    label: 'Absurdism',
    description: 'The City demands meaning from a universe that offers none',
  },
  redemption: {
    label: 'Redemption',
    description: 'Earning forgiveness — for others or for the self',
  },
  futility: {
    label: 'Futility',
    description: 'The Sisyphean cycle — effort that changes nothing',
  },
  'identity-fragmentation': {
    label: 'Identity Fragmentation',
    description: 'The self fracturing under trauma, memory loss, or competing roles',
  },
  machinery: {
    label: 'Machinery',
    description: 'Technology as trap — the City weaponizes progress against its people',
  },
  nihilism: {
    label: 'Nihilism',
    description: 'The absence of inherent meaning — and the choice to create it anyway',
  },
  faith: {
    label: 'Faith',
    description: 'Belief in something beyond the self — in a god, a person, or a cause',
  },
  family: {
    label: 'Family',
    description: 'Blood and chosen bonds — the weight of kinship and its betrayals',
  },
};

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
  /** Human-readable name for the shared group node. */
  sharedGroupName?: string;
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
  /**
   * Cross-reference ID into public/assets/ego/ego.json.
   * Used to look up image path and additional EGO metadata.
   * Not present on pre-existing entries that haven't been matched.
   */
  egoId?: string;
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

  /**
   * Canto annotation layer — M3 scope.
   * Each entry describes this Sinner's presence/role in a specific canto or intervallo.
   * Spoiler-gated: filtered by spoiler toggle in the UI.
   */
  cantos?: CantoAnnotation[];

  /**
   * Named abilities — currently used for Dante, who has no identities/EGOs
   * but manifests unique powers through the Golden Bough contract system.
   */
  powers?: DantePower[];
}

/**
 * A named ability or power associated with a Sinner.
 * Used primarily for Dante — whose unique clock-head mechanics produce
 * abilities beyond the standard Identity/EGO Arsenal framework.
 */
export interface DantePower {
  name: string;
  description: string;
}

/**
 * A single canto or intervallo annotation for a Sinner.
 * @see Sinner.cantos
 * @see src/data/cantos.json — canonical canto list (title, displayNumber, spoilerLevel)
 */
export interface CantoAnnotation {
  /**
   * Canto ID — key into cantos.json.
   * e.g. 'canto-4', 'intervallo-1', 'intervallo-3-1', 'canto-9'
   */
  id: string;
  /** 1–2 sentence description of this Sinner's role in this canto. */
  summary: string;
  /** True = this Sinner is the focus character of this canto. */
  isMajor: boolean;
}

/**
 * Canonical canto/intervallo metadata — single source of truth for all canto titles,
 * display numbers, and spoiler levels.
 * @see src/data/cantos.json
 */
export interface Canto {
  id: string;
  displayNumber: number | string;
  title: string;
  spoilerLevel: number;
}

/**
 * Cross-game entities — Wings, Abnormalities, and recurring characters
 * that appear across Lobotomy Corporation, Library of Ruina, and Limbus Company.
 * Rendered as distinct diamond-shaped nodes in the lore graph.
 * @see src/data/crossGameEntities.json
 */
export type CrossGameEntityType = 'character' | 'wing' | 'abnormality';

export interface CrossGameEntity {
  id: string;                 // prefixed 'entity-{slug}', e.g. 'entity-w-corp'
  name: string;
  type: CrossGameEntityType;
  canonicalGame: Game;
  appearances: GameAppearance;
  /** Literary origin book/author if applicable */
  literaryOrigin?: string;
  loreSummary: string;
  themes: Theme[];
  /** Sinner IDs connected to this entity (produces graph edges) */
  relatedSinnerIds?: string[];
  /** Icon image path relative to public/, e.g. '/wings/cinqIcon.png' */
  icon?: string;
  /** Risk Level (Abnormalities only), e.g. 'ALEPH' */
  riskLevel?: string;
  /** Subject Number (Abnormalities only), e.g. 'O-03-03' */
  subjectNumber?: string;
  /** Intelligence briefing for each sinner link (Record<SinnerId, Briefing>) */
  connectionInsights?: Record<string, string>;
  /** Entity IDs connected to this entity (Entity-to-Entity bridging) */
  relatedEntityIds?: string[];
}

// ── Graph Edge (Derived at Runtime) ─────────────────────────────────────────

/**
 * Graph edge — derived at runtime, NOT stored in JSON.
 * Computed by the D3 component from Sinner.literarySources[] and Sinner.themes[].
 *
 * @see src/utils/deriveEdges.ts
 */
export type EdgeType = 'literary-origin' | 'thematic-link' | 'cross-game-continuity' | 'shared-literary-group' | 'wing-affiliation' | 'ego-synchronization' | 'structural-hierarchy' | 'bridge-continuity';

export interface GraphEdge {
  source: string; // Sinner.id
  target: string; // Sinner.id
  type: EdgeType;
}

// ── Asset Map ────────────────────────────────────────────────────────────────

/** Maps identity ID → image path (null = no image available). */
export type IdentityImageMap = Record<string, string | null>;

// ── Identity Game Data (Prydwen) ───────────────────────────────────────────────

export interface IdentityStats {
  hp_1: string;
  hp_30: string;
  def_1: string;
  def_30: string;
  speed_1: string;
  speed_30: string;
}

export interface IdentityResistances {
  blunt: string;
  slash: string;
  pierce: string;
}

export interface IdentityRatings {
  beg: string;
  end: string;
}

export interface IdentityDetail {
  attackType: string[];
  speciality: string[];
  affinity: string[];
  stats: IdentityStats;
  resistances: IdentityResistances;
  ratings: IdentityRatings;
  tierCategory: string; // 'dps' | 'support' | 'tank' | 'status'
}

/** Maps eldritchtools identity ID → prydwen game detail data. */
export type IdentityDetailMap = Record<string, IdentityDetail>;
