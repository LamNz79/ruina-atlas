import { useState, useEffect, useCallback } from 'react';

export interface SquadMember {
  sinnerId: string;
  identityId: string | null;
  /** Maps E.G.O Rarity (ZAYIN, TETH, etc.) to the selected E.G.O ID */
  egoLoadout: Record<string, string | null>;
}

export type Squad = Record<string, SquadMember>;

const STORAGE_KEY = 'ruina-atlas-squad';

export function useTeamBuilder() {
  const [squad, setSquad] = useState<Squad>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: Ensure egoLoadout exists
        Object.keys(parsed).forEach(key => {
          if (!parsed[key].egoLoadout) parsed[key].egoLoadout = {};
        });
        return parsed;
      } catch (e) {
        console.error('Failed to load squad', e);
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(squad));
  }, [squad]);

  const setMember = useCallback((sinnerId: string, identityId: string | null) => {
    setSquad((prev) => ({
      ...prev,
      [sinnerId]: { 
        sinnerId, 
        identityId, 
        egoLoadout: prev[sinnerId]?.egoLoadout || {} 
      }
    }));
  }, []);

  const toggleEgo = useCallback((sinnerId: string, egoId: string, rarity: string) => {
    setSquad((prev) => {
      const currentMember = prev[sinnerId] || { sinnerId, identityId: null, egoLoadout: {} };
      const currentLoadout = { ...currentMember.egoLoadout };
      
      // If already selected, toggle off. Otherwise, set it (overwriting existing for that rarity)
      if (currentLoadout[rarity] === egoId) {
        delete currentLoadout[rarity];
      } else {
        currentLoadout[rarity] = egoId;
      }

      return {
        ...prev,
        [sinnerId]: { ...currentMember, egoLoadout: currentLoadout }
      };
    });
  }, []);

  const clearSquad = useCallback(() => {
    setSquad({});
  }, []);

  return {
    squad,
    setMember,
    toggleEgo,
    clearSquad
  };
}
