import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Info } from 'lucide-react';
import { EDGE_COLORS, EDGE_LABELS, ALL_EDGE_TYPES } from './LoreGraphConstants';
import type { EdgeType } from '../types';

const GraphLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Filter out internal structural links if we want a cleaner legend
  const visibleEdgeTypes = ALL_EDGE_TYPES.filter(type => 
    type !== 'shared-literary-group' && type !== 'structural-hierarchy'
  );

  return (
    <div className="absolute bottom-6 left-6 z-50 flex flex-col items-start gap-2">
      {/* Legend Panel */}
      {isOpen && (
        <div className="mb-2 w-64 animate-in fade-in slide-in-from-bottom-4 rounded-sm border border-border/40 bg-background/80 p-4 backdrop-blur-md shadow-2xl">
          <div className="mb-3 flex items-center justify-between border-b border-border/20 pb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Info className="h-3 w-3" />
              Graph Intelligence
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {visibleEdgeTypes.map((type) => (
              <div key={type} className="group flex items-start gap-3">
                <div className="relative mt-1.5 h-1 w-10 flex-shrink-0">
                  {/* The visual line representation */}
                  <div 
                    className={`h-full w-full rounded-full ${
                      type === 'wing-affiliation' || type === 'ego-synchronization' || type === 'bridge-continuity'
                        ? 'border-t border-dashed'
                        : 'bg-current'
                    }`}
                    style={{ 
                      backgroundColor: type.includes('dash') ? 'transparent' : EDGE_COLORS[type],
                      borderColor: EDGE_COLORS[type],
                      borderWidth: (type === 'wing-affiliation' || type === 'ego-synchronization' || type === 'bridge-continuity') ? '1px' : '0',
                      borderStyle: (type === 'wing-affiliation' || type === 'ego-synchronization' || type === 'bridge-continuity') ? 'dashed' : 'solid'
                    }}
                  />
                  {/* Subtle glow for important links */}
                  {(type === 'cross-game-continuity' || type === 'theological-origin') && (
                    <div 
                      className="absolute inset-0 blur-[4px] opacity-40"
                      style={{ backgroundColor: EDGE_COLORS[type] }}
                    />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-foreground/90 leading-none mb-1">
                    {EDGE_LABELS[type]}
                  </p>
                  <p className="text-[9px] leading-tight text-muted-foreground/70 uppercase tracking-tighter">
                    {getLoreDescription(type)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-border/10 pt-2 opacity-50">
            <p className="text-[9px] italic text-muted-foreground">
              Hover edges for connection insights
            </p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 items-center gap-2 rounded-full border border-border/40 px-4 transition-all hover:bg-muted/20 ${
          isOpen ? 'bg-muted/40 border-primary/40' : 'bg-background/60 backdrop-blur-sm'
        }`}
      >
        <HelpCircle className={`h-4 w-4 ${isOpen ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {isOpen ? 'Close Legend' : 'Legend'}
        </span>
      </button>
    </div>
  );
};

// Helper function to map types to short lore descriptions
function getLoreDescription(type: EdgeType): string {
  switch (type) {
    case 'primary-source': return 'Core adapted work';
    case 'secondary-source': return 'Allusion or minor influence';
    case 'author-parallel': return 'Mirror World Parallel';
    case 'literary-origin': return 'Classical prototype';
    case 'theological-origin': return 'Divine/Scriptural anchor';
    case 'thematic-link': return 'Conceptual resonance';
    case 'cross-game-continuity': return 'Legacy persistence';
    case 'wing-affiliation': return 'Corporate contract';
    case 'ego-synchronization': return 'Resonance extraction';
    case 'shared-literary-group': return 'Collective source group';
    case 'bridge-continuity': return 'Spiritual transformation';
    case 'structural-hierarchy': return 'Organization branch';
    default: return 'Entity link';
  }
}

export default GraphLegend;
