import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Flex, Stack, Box, Grid } from '../layout';
import { egoEntries } from '../../data/ego';
import type { EgoEntry } from '../../data/ego';
import { Sparkles, Trash2 } from 'lucide-react';

interface EgoPickerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sinnerName: string | undefined;
  activeEgoIds: Record<string, string | null>;
  onToggleEgo: (egoId: string, rarity: string) => void;
}

export function EgoPicker({ isOpen, onOpenChange, sinnerName, activeEgoIds, onToggleEgo }: EgoPickerProps) {
  if (!sinnerName) return null;

  // Filter E.G.O by character name
  const charactersEgo = egoEntries.filter(e => e.character === sinnerName);
  
  // Group by rarity
  const rarities = ['ZAYIN', 'TETH', 'HE', 'WAW', 'ALEPH'];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-v2 border-[#a08a70]/30 sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold text-[#e8e0d5] uppercase tracking-[0.2em] chromatic-text">
            {sinnerName} - E.G.O Arsenal
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs font-medium">
            Project standard E.G.O for tactical resonance. Only one per rank can be projected.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          <Stack gap={6} className="py-4">
            {rarities.map(rarity => {
              const options = charactersEgo.filter(e => e.rarity === rarity);
              if (options.length === 0) return null;

              const selectedId = activeEgoIds[rarity];

              return (
                <Stack key={rarity} gap={3}>
                  <Flex justify="between" align="center">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a08a70]">{rarity} - Rank Projection</h4>
                    {selectedId && (
                      <span className="text-[9px] font-bold text-primary uppercase animate-pulse">Active</span>
                    )}
                  </Flex>
                  <Grid gap={3} className="grid-cols-1 sm:grid-cols-2">
                    {options.map((ego) => (
                      <EgoCard 
                        key={ego.id} 
                        ego={ego} 
                        isSelected={selectedId === ego.id} 
                        onSelect={() => onToggleEgo(ego.id, rarity)}
                      />
                    ))}
                  </Grid>
                </Stack>
              );
            })}
          </Stack>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function EgoCard({ ego, isSelected, onSelect }: { ego: EgoEntry, isSelected: boolean, onSelect: () => void }) {
  return (
    <Box 
      onClick={onSelect}
      className={`
        glass-v2 group h-20 p-0 cursor-pointer overflow-hidden border-border/20 transition-all 
        ${isSelected ? 'border-primary/60 bg-primary/5' : 'hover:border-[#f5c518]/30 hover:bg-[#f5c518]/5'}
      `}
    >
      <div className="flex h-full">
        <div className="w-20 relative shrink-0">
          <img src={ego.image} alt="" className={`h-full w-full object-cover transition-all ${isSelected ? 'grayscale-0' : 'grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100'}`} />
          {isSelected && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 p-3 flex flex-col justify-center">
          <h5 className={`text-xs font-bold leading-tight transition-colors ${isSelected ? 'text-primary' : 'text-[#e8e0d5] group-hover:text-[#f5c518]'}`}>
            {ego.name}
          </h5>
          <Flex gap={1} className="mt-2">
             {Object.entries(ego.cost).map(([aff, val]) => (
               <Flex key={aff} gap={0.5} align="center">
                 <div className={`h-1.5 w-1.5 rounded-full bg-affinity-${aff.toLowerCase()}`} />
                 <span className="text-[9px] font-bold text-muted-foreground">{val}</span>
               </Flex>
             ))}
          </Flex>
        </div>
      </div>
    </Box>
  );
}
