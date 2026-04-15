import { THEMES, THEME_META } from '../types';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <DialogContent className="sm:max-w-[480px] max-h-[75vh] flex flex-col">
        <DialogHeader className="flex-row items-center gap-3 space-y-0">
          <DialogTitle className="text-base font-bold tracking-tight">Theme Guide</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 py-2">
            {THEMES.map((theme) => {
              const meta = THEME_META[theme];
              return (
                <div key={theme} className="space-y-1.5">
                  <Badge
                    variant="secondary"
                    className="px-2 py-0.5 text-[11px] font-semibold text-foreground border border-border/60"
                  >
                    {meta.label}
                  </Badge>
                  <p className="text-[12px] leading-relaxed text-muted-foreground pl-0.5">
                    {meta.description}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
