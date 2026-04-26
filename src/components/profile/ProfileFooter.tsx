import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileFooterProps {
  category: string;
  nav: {
    prevId?: string;
    nextId?: string;
  };
}

export const ProfileFooter = ({ category, nav }: ProfileFooterProps) => {
  const navigate = useNavigate();

  return (
    <footer className="sm:hidden sticky bottom-0 z-50 flex items-center justify-between border-t border-border/40 bg-background/95 px-6 py-3 backdrop-blur">
      <Button
        variant="outline"
        size="sm"
        className="flex-1 h-10 gap-2 border-border/20"
        disabled={!nav.prevId}
        onClick={() => navigate(`/profile/${category}/${nav.prevId}`)}
      >
        <ChevronLeft className="h-4 w-4" /> Previous
      </Button>
      <div className="w-8" />
      <Button
        variant="outline"
        size="sm"
        className="flex-1 h-10 gap-2 border-border/20"
        disabled={!nav.nextId}
        onClick={() => navigate(`/profile/${category}/${nav.nextId}`)}
      >
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    </footer>
  );
};
