import type { CrossGameEntity } from '../types';
import type { GraphNode, GraphLink } from './LoreGraphConstants';

export const getVisibleAncestorId = (id: string, entities: CrossGameEntity[], nodeMap: Map<string, GraphNode>): string => {
  let currentId = id;
  for (let i = 0; i < 5; i++) {
    const entity = entities.find(e => e.id === currentId);
    if (!entity || !entity.parentEntityId) break;
    if (nodeMap.has(entity.parentEntityId)) return entity.parentEntityId;
    currentId = entity.parentEntityId;
  }
  return id;
};

export const calculateSharedThemes = (allLinks: GraphLink[], nodeMap: Map<string, GraphNode>) => {
  const sharedThemeCount: Record<string, number> = {};
  for (const link of allLinks) {
    const srcId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
    const tgtId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
    const src = nodeMap.get(srcId);
    const tgt = nodeMap.get(tgtId);
    if (src && tgt) {
      const count = new Set(src.themes.filter((t: string) => tgt.themes.includes(t))).size;
      sharedThemeCount[`${srcId}-${tgtId}`] = count;
      sharedThemeCount[`${tgtId}-${srcId}`] = count;
    }
  }
  return sharedThemeCount;
};
