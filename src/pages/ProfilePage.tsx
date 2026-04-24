import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Layout Primitives
import { Stack, Container, Section, Box } from '../components/layout/index';

// Logic Hooks
import { useDossierData } from '../hooks/useDossierData';

// Profile Components
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileFooter } from '../components/profile/ProfileFooter';
import { HeroFrame } from '../components/profile/HeroFrame';
import SinnerModule from '../components/profile/SinnerModule';
import SourceModule from '../components/profile/SourceModule';
import EntityModule from '../components/profile/EntityModule';

// Types
import type { Sinner, LiterarySource, CrossGameEntity } from '../types';

export default function ProfilePage() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const [spoilerEnabled, setSpoilerEnabled] = useState(false);

  // Use the architectural hook to handle all logic
  const { entity, name, connectedSinners, relatedIdentities, nav } = useDossierData(category, id);

  if (!entity) {
    return (
      <Stack justify="center" align="center" className="h-screen bg-background">
        <h1 className="text-2xl font-bold italic opacity-50">Dossier not found in archives</h1>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/">Return to Atlas</Link>
        </Button>
      </Stack>
    );
  }

  return (
    <Box className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Background Ambience */}
      <Box className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(184,32,47,0.05),transparent_50%)]" />
      </Box>

      <ProfileHeader
        category={category!}
        name={name}
        nav={nav}
        spoilerEnabled={spoilerEnabled}
        onSpoilerToggle={setSpoilerEnabled}
      />

      <Container className="py-12 relative z-10">
        <Stack gap={20}>

          {/* Universal Hero Section */}
          <Section spacing="none" className="flex flex-col md:flex-row gap-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
            <HeroFrame category={category!} id={id!} name={name} entity={entity} />

            <Stack gap={6} className="flex-1 pt-4">
              <Stack gap={2}>
                <Badge variant="outline" className="w-fit text-[10px] font-black uppercase tracking-[0.2em] border-primary/30 text-primary px-3 py-1">
                  {category} Dossier
                </Badge>
                <h1 className="text-6xl font-black tracking-tighter leading-none">
                  {name}
                </h1>
                {category === 'sinner' && (
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    {(entity as Sinner).appearances.join(' \u00B7 ')}
                  </p>
                )}
              </Stack>

              <p className="text-xl leading-relaxed text-muted-foreground/90 max-w-3xl font-medium">
                {(entity as any).loreSummary || (entity as any).passage || "Confidential profile data restricted to high-ranking administrators."}
              </p>

              {category === 'sinner' && (entity as Sinner).literaryConnectionNotes && (
                <Box className="p-4 bg-muted/20 border-l-4 border-primary/40 rounded-r-xl italic text-sm text-muted-foreground">
                  {(entity as Sinner).literaryConnectionNotes}
                </Box>
              )}
            </Stack>
          </Section>

          {/* Module Rendering */}
          <Box className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {category === 'sinner' && (
              <SinnerModule sinner={entity as Sinner} spoilerEnabled={spoilerEnabled} />
            )}
            {category === 'source' && (
              <SourceModule source={entity as LiterarySource} connectedSinners={connectedSinners as any} />
            )}
            {category === 'entity' && (
              <EntityModule
                entity={entity as CrossGameEntity}
                connectedSinners={connectedSinners as Sinner[]}
                relatedIdentities={relatedIdentities}
              />
            )}
          </Box>
        </Stack>
      </Container>

      <ProfileFooter category={category!} nav={nav} />
    </Box>
  );
}
