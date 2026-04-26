import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Flex } from '../layout/index';

interface ProfileHeaderProps {
  category: string;
  name: string;
  nav: {
    prevId?: string;
    nextId?: string;
    current: number;
    total: number;
  };
  spoilerEnabled?: boolean;
  onSpoilerToggle?: (val: boolean) => void;
}

export const ProfileHeader = ({
  category,
  name,
  nav,
  spoilerEnabled,
  onSpoilerToggle
}: ProfileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Flex gap={4}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground group"
        >
          <LayoutGrid className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
          Atlas
        </Button>
        <span className="h-4 w-px bg-border/40" />
        <Flex gap={2} align="center">
          <div className="flex flex-col items-start leading-none gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">{category}</span>
            <span className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-tighter">Clearance: Level <span className="redacted-text">5</span></span>
          </div>
          <span className="h-5 w-[1px] bg-border/50 mx-1" />
          <h1 className="text-sm font-bold tracking-tight truncate max-w-[120px] sm:max-w-none chromatic-text uppercase tracking-widest">{name}</h1>
        </Flex>
      </Flex>

      <Flex gap={4}>
        {category === 'sinner' && onSpoilerToggle && (
          <Flex gap={2} className="px-3 py-1 bg-muted/30 rounded-full border border-border/40">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Spoilers</span>
            <Switch
              checked={spoilerEnabled}
              onCheckedChange={onSpoilerToggle}
              className="h-4 w-8 scale-75"
            />
            {spoilerEnabled ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5 opacity-50" />}
          </Flex>
        )}

        <Flex gap={1} className="hidden sm:flex">
          <span className="text-[10px] font-mono text-muted-foreground mr-2">
            {nav.current} / {nav.total}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={!nav.prevId}
            onClick={() => navigate(`/profile/${category}/${nav.prevId}`)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={!nav.nextId}
            onClick={() => navigate(`/profile/${category}/${nav.nextId}`)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Flex>
      </Flex>
    </header>
  );
};
