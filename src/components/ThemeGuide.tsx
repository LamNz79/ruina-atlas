import { THEMES, THEME_META } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ThemeGuideProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeGuide({ open, onClose }: ThemeGuideProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[480px] grid-rows-[auto_1fr]">
        <DialogHeader className="flex-row items-center gap-3 space-y-0 row-span-1">
          <DialogTitle className="text-base font-bold tracking-tight">Theme Guide</DialogTitle>
        </DialogHeader>

        <ScrollArea className="row-span-1 min-h-0">
          <div className="space-y-4 pr-4 pb-2">
            {THEMES.map((theme) => {
              const meta = THEME_META[theme];
              return (
                <div key={theme} className="space-y-1.5">
                  <Badge
                    variant="secondary"
                    className="px-2 py-0.5 text-[11px] font-semibold border-0"
                    style={{ backgroundColor: '#f5c518', color: '#111318' }}
                  >
                    {meta.label}
                  </Badge>
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    {meta.description}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}