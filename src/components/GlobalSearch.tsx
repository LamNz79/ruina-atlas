import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { sinners } from '../data/sinners';
import crossGameEntities from '../data/crossGameEntities.json';
import { literarySources } from '../data/literarySources';
import type { CrossGameEntity, LiterarySource } from '../types';
import { Search, BookOpen, User, Box, Command as CommandIcon, History, Shield, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: 'sinner' | 'entity' | 'source', id: string) => void;
}

type SearchItem = {
  id: string;
  name: string;
  type: 'sinner' | 'entity' | 'source';
  subtitle?: string;
  meta?: string;
  extra?: string; // e.g., Damange type or specialized label
};

const TYPE_COLORS: Record<string, string> = {
  sinner: 'var(--crimson)',
  entity: 'var(--gold)',
  source: 'var(--bronze)',
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
        extra: s.themes.slice(0, 1).join('')
      })),
      ...(crossGameEntities.entities as CrossGameEntity[]).map(e => ({
        id: e.id,
        name: e.name,
        type: 'entity' as const,
        subtitle: `${e.type.charAt(0).toUpperCase() + e.type.slice(1)}`,
        meta: e.canonicalGame,
        extra: e.type
      })),
      ...(literarySources as LiterarySource[]).map(ls => ({
        id: ls.id,
        name: ls.title,
        type: 'source' as const,
        subtitle: 'Literary Source',
        meta: ls.author
      }))
    ];
    return items;
  }, []);

  const fuse = useMemo(() => new Fuse(searchData, {
    keys: ['name', 'subtitle', 'meta'],
    threshold: 0.3,
    location: 0,
    distance: 100,
    minMatchCharLength: 1,
    includeScore: true,
  }), [searchData]);

  const results = useMemo(() => {
    if (!query) return searchData.slice(0, 6); // Suggestions
    return fuse.search(query).map(r => r.item).slice(0, 12);
  }, [fuse, query, searchData]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

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
        onSelect(selected.type, selected.id);
        onOpenChange(false);
        setQuery('');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 glass-v2 border-bronze/30 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="scan-line px-5 py-4 flex items-center gap-4 bg-muted/30 border-b border-bronze/10">
          <Search className="h-5 w-5 text-bronze animate-pulse" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50 tracking-tight"
            style={{ fontFamily: 'var(--font-space)' }}
            placeholder="Search the Infinite Archive..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-2">
            {!query && <span className="text-[10px] font-bold text-bronze/40 uppercase tracking-widest hidden sm:block">Archive Core Active</span>}
            <div className="terminal-kbd flex items-center gap-1 opacity-80">
              <CommandIcon className="h-2.5 w-2.5" />
              <span>K</span>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[420px] scroll-bronze">
          <div className="px-3 pt-4 pb-2">
            <h3 className="px-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              {query ? <Sparkles className="h-3 w-3" /> : <History className="h-3 w-3" />}
              {query ? 'Matched Signals' : 'Recent Observations'}
            </h3>
          </div>

          {results.length > 0 ? (
            <div className="p-2 pt-0 space-y-1">
              {results.map((item, idx) => {
                const color = TYPE_COLORS[item.type];
                const isActive = idx === selectedIndex;

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`group relative flex items-center gap-4 px-4 py-3 cursor-pointer transition-all duration-200 ${isActive ? 'active-item-glow' : 'hover:bg-white/[0.03]'
                      }`}
                    onClick={() => {
                      onSelect(item.type, item.id);
                      onOpenChange(false);
                      setQuery('');
                    }}
                  >
                    <div
                      className={`shrink-0 h-10 w-10 flex items-center justify-center border transition-colors ${isActive ? 'border-bronze/50 bg-bronze/10' : 'border-white/5 bg-white/[0.02]'
                        }`}
                      style={{ borderColor: isActive ? color : undefined }}
                    >
                      {item.type === 'sinner' && <User className="h-5 w-5" style={{ color: isActive ? color : 'var(--text-faint)' }} />}
                      {item.type === 'entity' && (item.extra === 'wing' ? <Shield className="h-5 w-5" /> : <Box className="h-5 w-5" />)}
                      {item.type === 'source' && <BookOpen className="h-5 w-5" />}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <p className={`text-md font-medium truncate tracking-tight transition-colors ${isActive ? 'text-text-bright' : 'text-text-d'
                          }`} style={{ fontFamily: 'var(--font-newsreader)' }}>
                          {item.name}
                        </p>
                        {item.extra && item.type === 'entity' && (
                          <Badge variant="outline" className="h-4 px-1.5 text-[8px] uppercase tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">
                            {item.extra}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50 flex items-center gap-2">
                        <span style={{ color: color }}>{item.subtitle}</span>
                        {item.meta && (
                          <>
                            <span>/</span>
                            <span>{item.meta}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {isActive && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-gold/60 uppercase">Initialize</span>
                        <kbd className="terminal-kbd border-gold/30 text-gold">↵</kbd>
                      </div>
                    )}
                  </div>
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
