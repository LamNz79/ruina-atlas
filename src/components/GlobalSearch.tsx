import { useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { sinners } from '../data/sinners';
import crossGameEntities from '../data/crossGameEntities.json';
import { literarySources } from '../data/literarySources';
import type { CrossGameEntity, LiterarySource } from '../types';
import { Search, BookOpen, User, Box as BoxIcon, Command as CommandIcon, History, Shield, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { identityImages } from '../data/identityImages';
import { getEgoImage } from '../data/ego';
import { Flex, Stack } from './layout/index';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: 'sinner' | 'entity' | 'source' | 'identity' | 'ego', id: string) => void;
}

type SearchItem = {
  id: string;
  name: string;
  type: 'sinner' | 'entity' | 'source' | 'identity' | 'ego';
  subtitle?: string;
  meta?: string;
  extra?: any; // e.g., Damange type or specialized label
  iconUrl?: string;
};

const TYPE_COLORS: Record<string, string> = {
  sinner: 'var(--crimson)',
  entity: 'var(--gold)',
  source: 'var(--bronze)',
  identity: '#3b82f6',
  ego: '#ef4444',
};

export function GlobalSearch({ open, onOpenChange, onSelect }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchData = useMemo(() => {
    const items: SearchItem[] = [
      ...sinners.map(s => ({
        id: s.id,
        name: s.name,
        type: 'sinner' as const,
        subtitle: 'Limbus Sinner',
        meta: s.canonicalGame,
        extra: s.themes.slice(0, 1).join(''),
        iconUrl: identityImages[s.identities.find(i => i.displayName === 'LCB Sinner')?.id || ''] ?? undefined
      })),
      ...(crossGameEntities.entities as CrossGameEntity[]).map(e => ({
        id: e.id,
        name: e.name,
        type: 'entity' as const,
        subtitle: `${e.type.charAt(0).toUpperCase() + e.type.slice(1)}`,
        meta: e.canonicalGame,
        extra: e.type,
        iconUrl: (e as any).icon ?? undefined
      })),
      ...(literarySources as LiterarySource[]).map(ls => ({
        id: ls.id,
        name: ls.title,
        type: 'source' as const,
        subtitle: 'Literary Source',
        meta: ls.author
      })),
      // Add all Identities
      ...sinners.flatMap(s => s.identities.map(idnt => ({
        id: s.id, // We select the sinner for identity navigation
        name: idnt.displayName,
        type: 'identity' as const,
        subtitle: `Identity: ${s.name}`,
        meta: idnt.sourceGame,
        extra: idnt.wingOrGroup || undefined,
        iconUrl: identityImages[idnt.id] ?? undefined
      }))),
      // Add all EGOs
      ...sinners.flatMap(s => s.egos.map(ego => ({
        id: s.id,
        name: ego.displayName,
        type: 'ego' as const,
        subtitle: `EGO: ${s.name}`,
        meta: ego.rank,
        iconUrl: ego.egoId ? getEgoImage(ego.egoId) : undefined
      })))
    ];
    return items;
  }, []);

  const fuse = useMemo(() => new Fuse(searchData, {
    keys: ['name', 'subtitle', 'meta', 'extra'],
    threshold: 0.3,
    location: 0,
    distance: 100,
    minMatchCharLength: 1,
    includeScore: true,
  }), [searchData]);

  const results = useMemo(() => {
    if (!query) return searchData.slice(0, 8); // Suggestions
    return fuse.search(query).map(r => r.item).slice(0, 15);
  }, [fuse, query, searchData]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleSearchSelect = useCallback((item: SearchItem) => {
    onSelect(item.type === 'identity' || item.type === 'ego' ? 'sinner' : item.type, item.id);
    onOpenChange(false);
    setQuery('');
  }, [onOpenChange, onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      const selected = results[selectedIndex];
      if (selected) {
        handleSearchSelect(selected);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 gap-0 glass-v2 border-bronze/30 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="scan-line px-5 py-4 flex items-center gap-4 bg-muted/30 border-b border-bronze/10">
          <Search className="h-5 w-5 text-bronze animate-pulse" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50 tracking-tight"
            style={{ fontFamily: 'var(--font-space)' }}
            placeholder="Search Sinners, Identities, EGOs, or Sources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-2">
            {!query && <span className="text-[10px] font-bold text-bronze/40 uppercase tracking-widest hidden sm:block">Dossier Access: Verified</span>}
            <div className="terminal-kbd flex items-center gap-1 opacity-80">
              <CommandIcon className="h-2.5 w-2.5" />
              <span>K</span>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[480px] scroll-bronze">
          <div className="px-3 pt-4 pb-1">
            <h3 className="px-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              {query ? <Sparkles className="h-3 w-3" /> : <History className="h-3 w-3" />}
              {query ? 'Archive Matches' : 'Archive Highlights'}
            </h3>
          </div>

          {results.length > 0 ? (
            <div className="p-2 pt-0 space-y-1">
              {results.map((item, idx) => {
                const color = TYPE_COLORS[item.type];
                const isActive = idx === selectedIndex;

                return (
                  <Flex
                    key={`${item.type}-${item.id}-${item.name}`}
                    gap={4}
                    className={`group relative px-4 py-2 cursor-pointer transition-all duration-200 rounded-lg ${isActive ? 'active-item-glow bg-white/[0.05]' : 'hover:bg-white/[0.03]'
                      }`}
                    onClick={() => {
                      onSelect(item.type === 'identity' || item.type === 'ego' ? 'sinner' : item.type, item.id);
                      onOpenChange(false);
                      setQuery('');
                    }}
                  >
                    <Flex
                      justify="center"
                      className={`shrink-0 h-14 w-14 border transition-all overflow-hidden relative shadow-inner ${isActive ? 'border-bronze/50' : 'border-white/5 bg-white/[0.02]'
                        }`}
                      style={{ borderColor: isActive ? color : undefined, borderRadius: '12px' }}
                    >
                      {item.iconUrl ? (
                        <>
                          <img src={item.iconUrl} className="absolute inset-0 h-full w-full object-cover blur-md opacity-30 scale-150" aria-hidden="true" />
                          <img src={item.iconUrl} className="relative h-full w-full object-cover z-10 transition-transform duration-500 group-hover:scale-110" alt={item.name} />
                          <div className="absolute inset-0 z-20 border border-white/10 rounded-[11px]" aria-hidden="true" />
                        </>
                      ) : (
                        item.type === 'sinner' ? <User className="h-6 w-6" style={{ color: isActive ? color : 'var(--text-faint)' }} /> :
                          item.type === 'entity' ? (item.extra === 'wing' ? <Shield className="h-6 w-6" /> : <BoxIcon className="h-6 w-6" />) :
                            item.type === 'source' ? <BookOpen className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />
                      )}
                    </Flex>

                    <Stack gap={1} className="flex-1 overflow-hidden">
                      <Flex gap={2}>
                        <p className={`text-md font-medium truncate tracking-tight transition-colors ${isActive ? 'text-text-bright' : 'text-text-d'
                          }`} style={{ fontFamily: 'var(--font-newsreader)' }}>
                          {item.name}
                        </p>
                        {item.extra && item.type === 'entity' && (
                          <Badge variant="outline" className="h-4 px-1.5 text-[8px] uppercase tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">
                            {item.extra}
                          </Badge>
                        )}
                      </Flex>
                      <Flex gap={2} className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50">
                        <span style={{ color: color }}>{item.subtitle}</span>
                        {item.meta && (
                          <>
                            <span>/</span>
                            <span>{item.meta}</span>
                          </>
                        )}
                      </Flex>
                    </Stack>

                    {isActive && (
                      <Flex gap={1.5}>
                        <span className="text-[9px] font-bold text-gold/60 uppercase">Initialize</span>
                        <kbd className="terminal-kbd border-gold/30 text-gold">↵</kbd>
                      </Flex>
                    )}
                  </Flex>
                );
              })}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              <div className="h-12 w-12 rounded-full bg-crimson/10 flex items-center justify-center mb-4 border border-crimson/20">
                <Search className="h-6 w-6 text-crimson/60" />
              </div>
              <p className="text-sm font-medium text-text-bright tracking-tight">Signal interference detected</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                No records matching "{query}" were found in the current Archive sector.
              </p>
            </div>
          )}
        </ScrollArea>

        <div className="px-5 py-3 border-t border-bronze/10 bg-black/40 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <kbd className="terminal-kbd">↑↓</kbd>
              <span>Recalibrate</span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="terminal-kbd">Esc</kbd>
              <span>Abort</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-gold/40">
            <CommandIcon className="h-3 w-3" />
            <span>Sector 9.5-LC</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
