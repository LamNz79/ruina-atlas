import type { Sinner, Theme } from '../types';
import { sinners } from '../data/sinners';
import { literarySources } from '../data/literarySources';

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
    type: 'theme' | 'sin' | 'faction' | 'origin' | 'era';
  }>;
}

/**
 * Extracts the base sin affinity from a Sinner's EGO list.
 */
function getBaseSin(sinner: Sinner): SinType {
  const baseEgo = sinner.egos.find(e => e.rank === 'ZAYIN') || sinner.egos[0];
  if (!baseEgo) return 'Sloth';

  const desc = baseEgo.description.toLowerCase();
  for (const sin of SINS) {
    if (desc.includes(`affinity: ${sin.toLowerCase()}`)) {
      return sin;
    }
  }
  return 'Sloth';
}

/**
 * Maps languages to broad literary regions.
 */
const REGION_MAP: Record<string, string> = {
  'Korean': 'East Asian',
  'Japanese': 'East Asian',
  'Chinese': 'East Asian',
  'German': 'European',
  'Spanish': 'European',
  'French': 'European',
  'English': 'European',
  'Russian': 'European',
  'Ancient Greek': 'Ancient',
  'Hebrew': 'Ancient'
};

/**
 * Maps years to literary eras.
 */
function getEra(year?: number): string {
  if (year === undefined || year === 0) return 'Undated';
  if (year < 500) return 'Ancient';
  if (year < 1500) return 'Medieval';
  if (year < 1800) return 'Early Modern';
  return 'Modern';
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
  const activeSynergies: Array<{ label: string; score: number; type: 'theme' | 'sin' | 'faction' | 'origin' | 'era' }> = [];
  
  // Theme Synergies
  Object.entries(CORE_THEMES).forEach(([slug, label]) => {
    const count = activeSinners.filter(s => s.themes.includes(slug as Theme)).length;
    if (count >= 2) {
      activeSynergies.push({ label: `${label} RESONANCE`, score: count, type: 'theme' });
    }
  });
  
  // Sin Synergies
  SINS.forEach(sin => {
    if (sinAffinities[sin] >= 2) {
      activeSynergies.push({ label: `${sin.toUpperCase()} AFFINITY`, score: sinAffinities[sin], type: 'sin' });
    }
  });
  
  // Faction Synergies
  const factionCounts: Record<string, number> = {};
  activeSinners.forEach(s => {
    const factions = new Set(s.identities.map(id => id.wingOrGroup).filter(Boolean));
    factions.forEach(f => {
      factionCounts[f!] = (factionCounts[f!] || 0) + 1;
    });
  });
  
  Object.entries(factionCounts).forEach(([faction, count]) => {
    if (count >= 3) {
      activeSynergies.push({ label: `${faction.toUpperCase()} COHESION`, score: count, type: 'faction' });
    }
  });

  // 4. Literary Origin & Era Synergies
  const regionCounts: Record<string, number> = {};
  const eraCounts: Record<string, number> = {};

  activeSinners.forEach(s => {
    const primarySourceRef = s.literarySources.find(ls => ls.role === 'primary');
    if (primarySourceRef) {
      const source = literarySources.find(ls => ls.id === primarySourceRef.id);
      if (source) {
        const region = REGION_MAP[source.language] || 'Other';
        regionCounts[region] = (regionCounts[region] || 0) + 1;

        const era = getEra(source.year);
        if (era !== 'Undated') {
          eraCounts[era] = (eraCounts[era] || 0) + 1;
        }
      }
    }
  });

  Object.entries(regionCounts).forEach(([region, count]) => {
    if (count >= 2) {
      activeSynergies.push({ label: `${region.toUpperCase()} ORIGIN`, score: count, type: 'origin' });
    }
  });

  Object.entries(eraCounts).forEach(([era, count]) => {
    if (count >= 2) {
      activeSynergies.push({ label: `${era.toUpperCase()} ERA`, score: count, type: 'era' });
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
