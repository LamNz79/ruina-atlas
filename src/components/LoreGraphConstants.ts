import * as d3 from 'd3';
import type { EdgeType, Game, Theme } from '../types';
import { literarySources } from '../data/literarySources';
import { THEMES } from '../types';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  canonicalGame: string;
  literarySourceIds: string[];
  themes: string[];
  crossGameContinuity: boolean;
  nodeType: 'sinner' | 'entity' | 'zone-anchor' | 'literary-source';
  entityType?: 'wing' | 'abnormality' | 'character' | 'association' | 'finger';
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
  'literary-origin': 'var(--edge-literary)',
  'theological-origin': '#fdfbd3',
  'thematic-link': 'var(--edge-theme)',
  'cross-game-continuity': 'var(--edge-crossgame)',
  'shared-literary-group': 'var(--edge-group)',
  'wing-affiliation': '#00e5ff',
  'ego-synchronization': '#b8202f',
  'structural-hierarchy': '#4a5568',
  'bridge-continuity': '#d4af37',
};

export const EDGE_LABELS: Record<EdgeType, string> = {
  'literary-origin': 'Literary Origin',
  'theological-origin': 'Theological Origin',
  'thematic-link': 'Shared Theme',
  'cross-game-continuity': 'Cross-Game',
  'shared-literary-group': 'Shared Group',
  'wing-affiliation': 'Wing Affiliation',
  'ego-synchronization': 'E.G.O Synchronization',
  'structural-hierarchy': 'Structural Hierarchy',
  'bridge-continuity': 'Continuity Bridge',
};

export const ALL_EDGE_TYPES: EdgeType[] = [
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
  cantoLevel: number;
}

export const INITIAL_FILTER_STATE: FilterState = {
  themes: new Set(THEMES as unknown as Theme[]),
  showArchiveNodes: true,
  cantoLevel: 0,
};
