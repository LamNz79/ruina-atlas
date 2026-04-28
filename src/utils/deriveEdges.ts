import type { Sinner, GraphEdge, EdgeType } from '../types';
import { literarySources } from '../data/literarySources';

/**
 * Derive all graph edges from the Sinner data at runtime.
 * Edges are NOT stored in JSON — computed fresh from literarySources and themes.
 */
export function deriveEdges(sinners: Sinner[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const added = new Set<string>();

  const key = (a: string, b: string): string =>
    [a, b].sort().join('||');

  for (const s1 of sinners) {
    // 1) Links from Sinner to Literary/Theological Source
    for (const lsRef of s1.literarySources || []) {
      const k = key(s1.id, `lit-${lsRef.id}`);
      if (!added.has(k)) {
        const sourceData = literarySources.find(ls => ls.id === lsRef.id);
        
        let type: EdgeType = 'literary-origin';
        if (lsRef.role === 'primary') {
          type = 'primary-source';
        } else if (lsRef.role === 'secondary') {
          type = 'secondary-source';
        } else if (lsRef.role === 'author-parallel' || lsRef.role === 'influence') {
          type = 'author-parallel'; 
        } else if (sourceData?.category === 'theological') {
          type = 'theological-origin';
        }
        
        edges.push({ source: s1.id, target: `lit-${lsRef.id}`, type });
        added.add(k);
      }
    }

    // 2) Dante (Manager) to all other Sinners connection
    if (s1.id === 'dante') {
      for (const s2 of sinners) {
        if (s1.id === s2.id) continue;
        const k = key(s1.id, s2.id);
        edges.push({ source: s1.id, target: s2.id, type: 'structural-hierarchy' });
        added.add(k);
      }
    }

    for (const s2 of sinners) {
      if (s1.id >= s2.id) continue; // undirected, only process once
      const k = key(s1.id, s2.id);
      if (added.has(k)) continue;

      // 3) Cross-game continuity edge
      if (s1.crossGameContinuity && s2.crossGameContinuity) {
        edges.push({ source: s1.id, target: s2.id, type: 'cross-game-continuity' });
        added.add(k);
        continue;
      }

      // 4) Shared theme (between Sinners)
      const s1Themes = new Set(s1.themes || []);
      const hasTheme = (s2.themes || []).some((t) => s1Themes.has(t));
      if (hasTheme) {
        edges.push({ source: s1.id, target: s2.id, type: 'thematic-link' });
        added.add(k);
      }
    }
  }

  return edges;
}
