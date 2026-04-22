import React from 'react';
import { BookOpen, LayoutGrid } from 'lucide-react';
import { identityImages } from '../../data/identityImages';
import type { Sinner } from '../../types';
import { GlassContainer } from '../layout/GlassContainer';
import { Flex, Stack } from '../layout/index';

interface HeroFrameProps {
  category: string;
  id: string;
  name: string;
  entity: any;
}

export const HeroFrame = ({ category, id, name, entity }: HeroFrameProps) => {
  return (
    <div className="w-full md:w-1/3 aspect-[4/5] relative group">
      <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-3xl group-hover:bg-primary/20 transition-colors" />
      <GlassContainer
        intensity="high"
        className="relative h-full w-full rounded-2xl flex items-center justify-center"
      >
        {category === 'sinner' ? (
          <>
            {/* Cinematic Backdrop */}
            <img
              src={id === 'dante' ? '/assets/identities/dante.jpg' : identityImages[(entity as Sinner).identities.find(i => i.displayName === 'LCB Sinner')?.id || ''] || '/favicon.svg'}
              className="absolute inset-0 h-full w-full object-cover blur-3xl opacity-40 saturate-150 scale-110"
              aria-hidden="true"
              onError={(e) => { (e.currentTarget as any).style.display = 'none'; }}
            />

            {/* Focused Identity Art */}
            <img
              src={id === 'dante' ? '/assets/identities/dante.jpg' : identityImages[(entity as Sinner).identities.find(i => i.displayName === 'LCB Sinner')?.id || ''] || '/favicon.svg'}
              alt={name}
              className="relative h-full w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 p-4 transition-transform duration-500 group-hover:scale-[1.02]"
              onError={(e) => { e.currentTarget.src = '/favicon.svg'; }}
            />
          </>
        ) : category === 'source' ? (
          <>
            {entity.coverImage ? (
              <>
                {/* Cinematic Backdrop */}
                <img
                  src={entity.coverImage}
                  className="absolute inset-0 h-full w-full object-cover blur-3xl opacity-40 saturate-150 scale-110"
                  aria-hidden="true"
                />
                {/* Focused Book Art */}
                <img
                  src={entity.coverImage}
                  alt={name}
                  className="relative h-full w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 p-6 transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </>
            ) : (
              <Stack gap={6} justify="center" align="center" className="text-primary relative z-20">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" aria-hidden="true" />
                <BookOpen className="h-24 w-24 relative z-10" />
                <span className="text-5xl font-serif italic border-b-2 border-primary/20 pb-2 relative z-10">Archive</span>
              </Stack>
            )}
          </>
        ) : (
          <Stack gap={6} justify="center" align="center" className="relative z-20" style={{ color: (entity as any).type === 'wing' ? '#a08a70' : '#8a4a5a' }}>
            <div
              className="absolute inset-0 blur-3xl rounded-full scale-150 opacity-30 animate-pulse"
              style={{ backgroundColor: (entity as any).type === 'wing' ? '#a08a70' : '#8a4a5a' }}
              aria-hidden="true"
            />
            {entity.icon ? (
              <img src={entity.icon} className="h-32 w-32 object-contain brightness-125 relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" alt={name} />
            ) : (
              <LayoutGrid className="h-24 w-24 relative z-10 opacity-80" />
            )}
          </Stack>
        )}
      </GlassContainer>
    </div>
  );
};
