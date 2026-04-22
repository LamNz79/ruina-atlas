import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Flex, Stack, Box, Grid } from '../layout';
import type { IdentityDetail } from '../../types';
import { Heart, Zap, Shield, Star, Sword, Target } from 'lucide-react';

interface IdentityDossierProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  identity: {
    id: string;
    displayName: string;
    image: string;
    details?: IdentityDetail;
  } | null;
}

export function IdentityDossier({ isOpen, onOpenChange, identity }: IdentityDossierProps) {
  if (!identity) return null;

  const details = identity.details;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-v2 border-[#a08a70]/40 sm:max-w-[450px] h-[90vh] right-0 left-auto translate-x-0 rounded-l-2xl p-0 overflow-hidden flex flex-col">
        <Box className="relative h-64 shrink-0 overflow-hidden">
          <img 
            src={identity.image} 
            alt={identity.displayName} 
            className="h-full w-full object-cover object-top"
            style={{ objectPosition: 'center 35%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          <DialogHeader className="absolute bottom-0 left-0 p-6 w-full text-left">
            <Stack gap={1}>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f5c518]/60">Tactical Archive</span>
              <DialogTitle className="text-2xl font-black text-[#e8e0d5] uppercase tracking-tighter leading-none chromatic-text">
                {identity.displayName}
              </DialogTitle>
              <Flex gap={2} className="mt-2">
                {details?.affinity.map(aff => (
                  <Badge key={aff} className={`bg-affinity-${aff.toLowerCase()} text-white border-none text-[9px] uppercase font-bold py-0 h-4`}>
                    {aff}
                  </Badge>
                ))}
              </Flex>
            </Stack>
          </DialogHeader>
        </Box>

        <ScrollArea className="flex-1 p-6">
          <Stack gap={8}>
            {/* Stats Grid */}
            <Stack gap={4}>
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a08a70]">Vitals & Parameters</h4>
              <Grid cols={2} gap={3}>
                <StatBox icon={<Heart className="h-3.5 w-3.5" />} label="Max HP" value={details?.stats.hp_30 || '---'} />
                <StatBox icon={<Zap className="h-3.5 w-3.5" />} label="Speed" value={details?.stats.speed_30 || '---'} />
                <StatBox icon={<Shield className="h-3.5 w-3.5" />} label="Defense" value={details?.stats.def_30 || '---'} />
                <StatBox icon={<Star className="h-3.5 w-3.5" />} label="Rarity" value={details?.tierCategory.toUpperCase() || '---'} />
              </Grid>
            </Stack>

            {/* Resistances */}
            <Stack gap={4}>
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a08a70]">Defensive Resilience</h4>
              <Grid cols={3} gap={2}>
                <ResistanceBox label="Slash" value={details?.resistances.slash || 'Normal'} />
                <ResistanceBox label="Pierce" value={details?.resistances.pierce || 'Normal'} />
                <ResistanceBox label="Blunt" value={details?.resistances.blunt || 'Normal'} />
              </Grid>
            </Stack>

            {/* Capabilities */}
            <Stack gap={4}>
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a08a70]">Combat Capabilities</h4>
              <Flex gap={2} wrap>
                {details?.attackType.map(type => (
                  <Badge key={type} variant="outline" className="border-primary/30 text-primary text-[10px] uppercase font-bold">
                    <Sword className="h-3 w-3 mr-1.5" />
                    {type}
                  </Badge>
                ))}
                {details?.speciality.map(spec => (
                  <Badge key={spec} variant="outline" className="border-[#f5c518]/30 text-[#f5c518] text-[10px] uppercase font-bold">
                    <Target className="h-3 w-3 mr-1.5" />
                    {spec}
                  </Badge>
                ))}
              </Flex>
            </Stack>

            {/* Assessment */}
            <Box className="p-4 bg-[#f5c518]/5 border border-[#f5c518]/20 rounded-lg">
               <Stack gap={2}>
                 <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#f5c518]">Analysis Note</h5>
                 <p className="text-xs text-[#e8e0d5]/80 leading-relaxed font-medium">
                   This identity shows a {details?.ratings.end}/10 performance rating in endgame scenarios. 
                   Optimal {details?.speciality[0]} focus allows for high synergy with specific Sin resonance patterns.
                 </p>
               </Stack>
            </Box>
          </Stack>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <Box className="p-3 bg-muted/10 border border-border/20 rounded-lg flex items-center gap-3">
      <div className="text-primary">{icon}</div>
      <Stack gap={0}>
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-sm font-black text-[#e8e0d5] font-mono tracking-tighter">{value}</span>
      </Stack>
    </Box>
  );
}

function ResistanceBox({ label, value }: { label: string, value: string }) {
  const isWeak = value.toLowerCase().includes('fatal') || value.toLowerCase().includes('weak');
  const isStrong = value.toLowerCase().includes('ineff') || value.toLowerCase().includes('resist');

  return (
    <Box className="p-2 border border-border/20 rounded-lg text-center">
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">{label}</span>
      <span className={cn(
        "text-[10px] font-black uppercase font-mono tracking-tighter",
        isWeak && "text-red-400",
        isStrong && "text-emerald-400",
        !isWeak && !isStrong && "text-[#e8e0d5]"
      )}>
        {value}
      </span>
    </Box>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
