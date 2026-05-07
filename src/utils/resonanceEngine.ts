import type { Sinner, Theme } from '../types';
import { sinners } from '../data/sinners';

export const SINS = ['Wrath', 'Lust', 'Sloth', 'Gluttony', 'Gloom', 'Pride', 'Envy'] as const;
export type SinType = typeof SINS[number];

export const CORE_THEMES = {
  'absurdity': 'ABSURD',
  'guilt': 'GUILT',
  'obsession': 'OBSESS',
  'decay': 'DECAY',
  'redemption': 'REDEEM'
} as const;

export interface ResonanceResult {
  sinAffinities: Record<SinType, number>;
  themeScores: Record<string, number>;
  activeSynergies: Array<{
    label: string;
    score: number;
    type: 'theme' | 'sin' | 'faction';
  }>;
}

/**
 * Extracts the base sin affinity from a Sinner's EGO list.
 * Usually the ZAYIN or base EGO is the primary affinity.
 */
function getBaseSin(sinner: Sinner): SinType {
  const baseEgo = sinner.egos.find(e => e.rank === 'ZAYIN') || sinner.egos[0];
  if (!baseEgo) return 'Sloth'; // Fallback

  const desc = baseEgo.description.toLowerCase();
  for (const sin of SINS) {
    if (desc.includes(`affinity: ${sin.toLowerCase()}`)) {
      return sin;
    }
  }
  return 'Sloth'; // Fallback
}

export function calculateResonance(pinnedNodes: any[]): ResonanceResult {
  const selectedSinnerIds = pinnedNodes
    .filter(n => n.type === 'sinner')
    .map(n => n.id);
  
  const activeSinners = sinners.filter(s => selectedSinnerIds.includes(s.id));
  
  // 1. Calculate Sin Affinities
  const sinAffinities: Record<SinType, number> = {
    Wrath: 0, Lust: 0, Sloth: 0, Gluttony: 0, Gloom: 0, Pride: 0, Envy: 0
  };
  
  activeSinners.forEach(s => {
    const sin = getBaseSin(s);
    sinAffinities[sin]++;
  });
  
  // 2. Calculate Theme Scores
  const themeScores: Record<string, number> = {};
  Object.values(CORE_THEMES).forEach(label => themeScores[label] = 0);
  
  activeSinners.forEach(s => {
    s.themes.forEach(t => {
      const label = CORE_THEMES[t as keyof typeof CORE_THEMES];
      if (label) {
        themeScores[label]++;
      }
    });
  });
  
  // 3. Identify Active Synergies
  const activeSynergies: Array<{ label: string; score: number; type: 'theme' | 'sin' | 'faction' }> = [];
  
  // Theme Synergies (2+ sinners)
  Object.entries(CORE_THEMES).forEach(([slug, label]) => {
    const count = activeSinners.filter(s => s.themes.includes(slug as Theme)).length;
    if (count >= 2) {
      activeSynergies.push({ label: `${label} RESONANCE`, score: count, type: 'theme' });
    }
  });
  
  // Sin Synergies (2+ sinners)
  SINS.forEach(sin => {
    if (sinAffinities[sin] >= 2) {
      activeSynergies.push({ label: `${sin.toUpperCase()} AFFINITY`, score: sinAffinities[sin], type: 'sin' });
    }
  });
  
  // Faction Synergies (Checking common Identity groups)
  const factionCounts: Record<string, number> = {};
  activeSinners.forEach(s => {
    const factions = new Set(s.identities.map(id => id.wingOrGroup).filter(Boolean));
    factions.forEach(f => {
      factionCounts[f!] = (factionCounts[f!] || 0) + 1;
    });
  });
  
  Object.entries(factionCounts).forEach(([faction, count]) => {
    if (count >= 3) { // Higher threshold for factions
      activeSynergies.push({ label: `${faction.toUpperCase()} COHESION`, score: count, type: 'faction' });
    }
  });
  
  // Sort by score descending
  activeSynergies.sort((a, b) => b.score - a.score);
  
  return {
    sinAffinities,
    themeScores,
    activeSynergies
  };
}
