import * as d3 from 'd3';
import type { EdgeType, Theme } from '../types';
import { THEMES } from '../types';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  canonicalGame: string;
  literarySourceIds: string[];
  literarySources?: { id: string; role: string; specificConnection: string }[];
  themes: string[];
  crossGameContinuity: boolean;
  nodeType: 'sinner' | 'entity' | 'zone-anchor' | 'literary-source';
  entityType?: 'wing' | 'abnormality' | 'character' | 'association' | 'finger' | 'syndicate';
  icon?: string;
  subjectNumber?: string;
  riskLevel?: string;
  parentEntityId?: string;
  connectionCount?: number;
  zone?: 'limbus' | 'ruina' | 'lobotomy';
  isAnchor?: boolean;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  type: EdgeType;
  label?: string;
}

export const NODE_GAME_COLORS: Record<string, string> = {
  limbus: '#b8202f',
  ruina: '#a08a70',
  lobotomy: '#7a5c3a',
};

export const ENTITY_COLORS: Record<string, string> = {
  wing: '#a08a70',
  abnormality: '#8a4a5a',
  character: '#f5c518',
  syndicate: '#22c55e', // Bamboo Green default
};

export const RISK_LEVEL_COLORS: Record<string, string> = {
  'ZAYIN': '#2ECC71',
  'TETH': '#3498DB',
  'HE': '#F1C40F',
  'WAW': '#9B59B6',
  'ALEPH': '#E74C3C',
};

export const SIN_COLORS: Record<string, string> = {
  wrath: '#ef4444',    // Red
  lust: '#f97316',     // Orange
  sloth: '#eab308',    // Yellow
  gluttony: '#22c55e', // Green
  gloom: '#3b82f6',    // Blue
  pride: '#1e3a8a',    // Dark Blue/Navy
  envy: '#a855f7',     // Purple
};

export const EDGE_COLORS: Record<EdgeType, string> = {
  'primary-source': '#b8202f',      // Deep Crimson
  'secondary-source': '#a08a70',    // Bronze
  'author-parallel': '#f5c518',     // Electric Gold
  'literary-origin': '#a08a70',     // Bronze
  'theological-origin': '#fdfbd3',  // Divine Gold
  'thematic-link': '#c4bdb3',       // Ivory
  'cross-game-continuity': '#f5c518', // Electric Gold
  'shared-literary-group': '#8a847a', // Subtle Ivory
  'wing-affiliation': '#00e5ff',
  'ego-synchronization': '#b8202f',
  'structural-hierarchy': '#4a5568',
  'bridge-continuity': '#d4af37',
};

export const EDGE_LABELS: Record<EdgeType, string> = {
  'primary-source': 'Primary Source',
  'secondary-source': 'Secondary Source',
  'author-parallel': 'Author Parallel',
  'literary-origin': 'Literary Origin',
  'theological-origin': 'Theological Origin',
  'thematic-link': 'Thematic Link',
  'cross-game-continuity': 'Cross-game Continuity',
  'shared-literary-group': 'Shared Group',
  'wing-affiliation': 'Wing Affiliation',
  'ego-synchronization': 'EGO Synchronization',
  'structural-hierarchy': 'Hierarchy',
  'bridge-continuity': 'Bridge Continuity',
};

export const ALL_EDGE_TYPES: EdgeType[] = [
  'primary-source',
  'secondary-source',
  'author-parallel',
  'literary-origin',
  'theological-origin',
  'thematic-link',
  'cross-game-continuity',
  'shared-literary-group',
  'wing-affiliation',
  'ego-synchronization',
  'structural-hierarchy',
  'bridge-continuity',
];

export interface PhysicsSettings {
  nodeSpacing: number;
  repulsion: number;
  centering: number;
}

export const DEFAULTS: PhysicsSettings = {
  nodeSpacing: 180,
  repulsion: -3000,
  centering: 0.04,
};

export interface FilterState {
  themes: Set<Theme>;
  showArchiveNodes: boolean;
  showWings: boolean;
  showAbnormalities: boolean;
  showAssociations: boolean;
  showFingers: boolean;
  showCharacters: boolean;
  cantoLevel: number;
}

export const INITIAL_FILTER_STATE: FilterState = {
  themes: new Set(THEMES as unknown as Theme[]),
  showArchiveNodes: false,
  showWings: false,
  showAbnormalities: false,
  showAssociations: false,
  showFingers: false,
  showCharacters: false,
  cantoLevel: 0,
};
