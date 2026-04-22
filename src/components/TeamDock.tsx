import { X, Shield, Sword, Zap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Sinner, CrossGameEntity } from '../types';

interface PinnedNode {
  id: string;
  name: string;
  type: 'sinner' | 'entity' | 'literary';
  color?: string;
  icon?: any;
}

interface TeamDockProps {
  pinnedNodes: PinnedNode[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function TeamDock({ pinnedNodes, onRemove, onClear }: TeamDockProps) {
  if (pinnedNodes.length === 0) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1 bg-black/80 border border-bronze/30 backdrop-blur-xl rounded-t-sm shadow-2xl">
        <Shield className="h-3 w-3 text-bronze" />
        <span className="text-[10px] font-black uppercase tracking-widest text-bronze/80">Lore-Aware Team Dock</span>
        <Badge variant="outline" className="h-4 px-1 text-[9px] font-mono border-bronze/40 text-bronze ml-2">
          {pinnedNodes.length}/12
        </Badge>
        <button 
          onClick={onClear}
          className="ml-4 text-[9px] uppercase font-bold text-muted-foreground hover:text-red-500 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex gap-2 p-2 bg-black/60 border border-bronze/20 backdrop-blur-2xl rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        {pinnedNodes.map((node) => (
          <div 
            key={node.id}
            className="group relative flex flex-col items-center justify-center w-14 h-16 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-bronze/40 transition-all cursor-default"
          >
            <button 
              onClick={() => onRemove(node.id)}
              className="absolute -top-1 -right-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X className="h-2.5 w-2.5" />
            </button>

            <div className="w-8 h-8 flex items-center justify-center mb-1">
              {node.type === 'sinner' && <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: node.color || '#fff' }} />}
              {node.type === 'entity' && <Shield className="h-5 w-5 text-bronze" />}
              {node.type === 'literary' && <BookOpen className="h-5 w-5 text-gold" />}
            </div>

            <span className="text-[8px] font-bold text-center px-1 truncate w-full uppercase text-ivory/80 group-hover:text-ivory transition-colors">
              {node.name.split(' ')[0]}
            </span>
            
            {/* Resonance Indicators */}
            <div className="absolute -bottom-1 flex gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
              <div className="w-1 h-1 bg-primary rounded-full" />
              <div className="w-1 h-1 bg-gold rounded-full" />
            </div>
          </div>
        ))}

        {/* Suggestion Slot */}
        {pinnedNodes.length > 0 && (
          <div className="flex flex-col items-center justify-center w-24 h-16 border border-dashed border-bronze/20 bg-bronze/5 px-2">
            <Zap className="h-3 w-3 text-gold animate-pulse mb-1" />
            <span className="text-[7px] font-black uppercase text-center text-bronze/60 leading-tight">
              Synergy: {pinnedNodes.length > 2 ? 'High' : 'Calculating...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
