import { useMemo } from 'react';
import crossGameEntities from '../data/crossGameEntities.json';
import { literarySources } from '../data/literarySources';
import type { CrossGameEntity, EdgeType, GraphEdge, Sinner, Theme } from '../types';
import type { FilterState, GraphLink, GraphNode } from '../components/LoreGraphConstants';
import { EDGE_LABELS } from '../components/LoreGraphConstants';
import { getVisibleAncestorId } from '../components/LoreGraphUtils';

export function useLoreGraphData(
  sinners: Sinner[],
  edges: GraphEdge[],
  expandedNodeIds: Set<string>,
  filters: FilterState,
  activeEdgeTypes: Set<EdgeType>
) {
  return useMemo(() => {
    const entityLinks: GraphLink[] = [];
    const rawEntities = crossGameEntities.entities as CrossGameEntity[];

    rawEntities.forEach(e => {
      if (e.parentEntityId) {
        entityLinks.push({ source: e.parentEntityId, target: e.id, type: 'structural-hierarchy', label: 'Contains' });
      }
      if (e.relatedSinnerIds) {
        e.relatedSinnerIds.forEach(sid => {
          entityLinks.push({ source: e.id, target: sid, type: e.type === 'abnormality' ? 'ego-synchronization' : 'wing-affiliation', label: 'Resonance' });
        });
      }
    });

    const connectionCount: Record<string, number> = {};
    [...edges, ...entityLinks].forEach(l => {
      const sId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      connectionCount[sId] = (connectionCount[sId] ?? 0) + 1;
      connectionCount[tId] = (connectionCount[tId] ?? 0) + 1;
    });

    const sinnerNodes: GraphNode[] = sinners.filter(s => s.themes.some(t => filters.themes.has(t as Theme))).map(s => ({
      ...s, id: s.id, literarySourceIds: s.literarySources.map(ls => ls.id),
      literarySources: s.literarySources, themes: [...s.themes],
      nodeType: 'sinner', connectionCount: connectionCount[s.id] ?? 0,
    }));

    const visibleEntities = (() => {
      if (!filters.showArchiveNodes) return [];
      const visible = new Set<string>();

      rawEntities.forEach(e => {
        if (!e.parentEntityId) {
          const isMajorFaction = e.type === 'wing' || e.type === 'association' || e.type === 'finger' || e.type === 'syndicate';
          const isHub = ['entity-l-corp', 'entity-library', 'entity-limbus-company', 'entity-blade-lineage'].includes(e.id);
          const hasSinner = (e.relatedSinnerIds?.length ?? 0) > 0;
          if (isHub || hasSinner || isMajorFaction) visible.add(e.id);
        }
      });

      let changed = true;
      while (changed) {
        changed = false;
        rawEntities.forEach(e => {
          if (e.parentEntityId && !visible.has(e.id) && visible.has(e.parentEntityId) && expandedNodeIds.has(e.parentEntityId)) {
            visible.add(e.id);
            changed = true;
          }
        });
      }

      return rawEntities.filter(e => {
        if (!visible.has(e.id)) return false;
        if (e.type === 'wing' && !filters.showWings) return false;
        if (e.type === 'abnormality' && !filters.showAbnormalities) return false;
        if (e.type === 'association' && !filters.showAssociations) return false;
        if (e.type === 'finger' && !filters.showFingers) return false;
        if (e.type === 'character' && !filters.showCharacters) return false;
        if (e.type === 'syndicate' && !filters.showAssociations) return false;
        if (e.themes && e.themes.length > 0 && !e.themes.some(t => filters.themes.has(t as Theme))) return false;
        if (e.spoilerLevel && e.spoilerLevel > filters.cantoLevel) return false;
        return true;
      });
    })();

    const entityNodes: GraphNode[] = visibleEntities.map(e => {
      const litSources = e.literarySources || (e.literarySourceIds?.map(id => ({ id, role: 'influence', specificConnection: '' })) ?? []);
      return {
        ...e, nodeType: 'entity', entityType: e.type as any, themes: e.themes ?? [],
        literarySources: litSources,
        literarySourceIds: litSources.map(ls => ls.id),
        connectionCount: connectionCount[e.id] ?? 0,
        crossGameContinuity: e.appearances ? e.appearances.includes('lobotomy') && e.appearances.includes('ruina') : false,
      } as GraphNode;
    });

    const usedLitIds = new Set([
      ...sinnerNodes.flatMap(s => s.literarySourceIds),
      ...entityNodes.flatMap(e => e.literarySourceIds)
    ]);

    const litNodes: GraphNode[] = literarySources.filter(ls => usedLitIds.has(ls.id)).map(ls => {
      // Find a "home" for this book (primarily Sinners, then Entities)
      const parentNode = sinnerNodes.find(s => s.literarySourceIds?.includes(ls.id)) || 
                         entityNodes.find(e => e.literarySourceIds?.includes(ls.id));
      
      return {
        id: `lit-${ls.id}`, 
        name: ls.title, 
        canonicalGame: 'limbus' as any, 
        literarySourceIds: [ls.id], 
        themes: ls.themes ?? [],
        nodeType: 'literary-source', 
        connectionCount: 0, 
        crossGameContinuity: false,
        parentEntityId: parentNode?.id
      };
    });

    const litLinks: GraphLink[] = [];
    [...sinnerNodes, ...entityNodes].forEach(node => {
      node.literarySources?.forEach(lsRef => {
        const litNodeId = `lit-${lsRef.id}`;
        const sourceData = literarySources.find(ls => ls.id === lsRef.id);
        const isTheological = sourceData?.category === 'theological';
        
        let edgeType: EdgeType = isTheological ? 'theological-origin' : 'literary-origin';
        if (lsRef.role === 'primary') edgeType = 'primary-source';
        else if (lsRef.role === 'secondary') edgeType = 'secondary-source';
        else if (lsRef.role === 'author-parallel') edgeType = 'author-parallel';

        litLinks.push({
          source: node.id,
          target: litNodeId,
          type: edgeType,
          label: EDGE_LABELS[edgeType] || (isTheological ? 'Divine Inspiration' : 'Literary Source')
        });
      });
    });

    const allNodes = [...sinnerNodes, ...entityNodes, ...litNodes];
    const nodeMap = new Map<string, GraphNode>(allNodes.map(n => [n.id, n]));

    const allLinks = [...edges, ...entityLinks, ...litLinks].map(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
      const newS = nodeMap.has(s) ? s : getVisibleAncestorId(s, rawEntities, nodeMap);
      const newT = nodeMap.has(t) ? t : getVisibleAncestorId(t, rawEntities, nodeMap);
      return { ...l, source: newS, target: newT };
    }).filter(l => l.source !== l.target && nodeMap.has(l.source as string) && nodeMap.has(l.target as string) && activeEdgeTypes.has(l.type));

    return { nodes: allNodes, links: allLinks };
  }, [sinners, edges, expandedNodeIds, filters, activeEdgeTypes]);
}
