import type { Sinner, GraphEdge } from '../types';

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
    for (const s2 of sinners) {
      if (s1.id >= s2.id) continue; // undirected, only process once
      const k = key(s1.id, s2.id);
      if (added.has(k)) continue;

      // 1) Cross-game continuity edge
      if (s1.crossGameContinuity && s2.crossGameContinuity) {
        edges.push({ source: s1.id, target: s2.id, type: 'cross-game-continuity' });
        added.add(k);
        continue;
      }

      // 2) Shared literary source (by source ID)
      const s1SourceIds = new Set(s1.literarySources.map((ls) => ls.id));
      const hasLiterary = s2.literarySources.some((ls) => s1SourceIds.has(ls.id));
      if (hasLiterary) {
        edges.push({ source: s1.id, target: s2.id, type: 'literary-origin' });
        added.add(k);
        continue;
      }

      // 3) Shared theme
      const s1Themes = new Set(s1.themes);
      const hasTheme = s2.themes.some((t) => s1Themes.has(t));
      if (hasTheme) {
        edges.push({ source: s1.id, target: s2.id, type: 'thematic-link' });
        added.add(k);
      }
    }
  }

  return edges;
}
