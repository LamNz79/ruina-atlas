import { useMemo } from 'react';
import { sinners } from '../data/sinners';
import { literarySources } from '../data/literarySources';
import crossGameEntities from '../data/crossGameEntities.json';
import type { Sinner, LiterarySource, CrossGameEntity } from '../types';

export function useDossierData(category: string | undefined, id: string | undefined) {
  // 1. Core Entity Fetching & Pagination
  const { entity, prevId, nextId, currentIndex, totalCount } = useMemo(() => {
    let list: any[] = [];
    switch (category) {
      case 'sinner': list = sinners; break;
      case 'source': list = literarySources; break;
      case 'entity': list = crossGameEntities.entities; break;
    }

    const currentIdx = list.findIndex((item) => item.id === id);
    const item = list[currentIdx];

    return {
      entity: item as Sinner | LiterarySource | CrossGameEntity | undefined,
      prevId: currentIdx > 0 ? list[currentIdx - 1]?.id : undefined,
      nextId: currentIdx >= 0 && currentIdx < list.length - 1 ? list[currentIdx + 1]?.id : undefined,
      currentIndex: currentIdx,
      totalCount: list.length
    };
  }, [category, id]);

  // 2. Cross-Linked Data Aggregation
  const { connectedSinners, relatedIdentities } = useMemo(() => {
    if (!entity || category === 'sinner') return { connectedSinners: [], relatedIdentities: [] };

    if (category === 'source') {
      const sinnersWithSource = sinners
        .filter((s) => s.literarySources.some((ref) => ref.id === id))
        .map((s) => {
          const ref = s.literarySources.find((ref) => ref.id === id)!;
          return {
            sinner: s,
            role: ref.role,
            specificConnection: ref.specificConnection,
          };
        });
      return { connectedSinners: sinnersWithSource, relatedIdentities: [] };
    }

    if (category === 'entity') {
      const ent = entity as CrossGameEntity;
      const directSinners = ent.relatedSinnerIds
        ? sinners.filter((s) => ent.relatedSinnerIds!.includes(s.id))
        : [];

      const derivedIds: { sinner: Sinner; identity: any }[] = [];
      sinners.forEach(s => {
        s.identities.forEach(idnt => {
          if (idnt.wingOrGroup && (
            idnt.wingOrGroup === ent.name ||
            ent.name.includes(idnt.wingOrGroup) ||
            idnt.wingOrGroup.includes(ent.name)
          )) {
            derivedIds.push({ sinner: s, identity: idnt });
          }
        });
      });

      return { connectedSinners: directSinners, relatedIdentities: derivedIds };
    }

    return { connectedSinners: [], relatedIdentities: [] };
  }, [entity, category, id]);

  return {
    entity,
    name: entity ? ((entity as any).name || (entity as any).title) : '',
    connectedSinners,
    relatedIdentities,
    nav: {
      prevId,
      nextId,
      current: currentIndex + 1,
      total: totalCount
    }
  };
}
