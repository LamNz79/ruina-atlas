import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EntityCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  description?: string;
  badges?: Array<{ label: string; variant?: "default" | "secondary" | "destructive" | "outline" | null | undefined; color?: string }>;
  linkTo?: string;
  themeColor?: string;
  aspectRatio?: string;
  className?: string;
}

export const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  imageUrl,
  description,
  badges = [],
  linkTo,
  themeColor,
  aspectRatio = "aspect-video",
  className = ""
}) => {
  const content = (
    <Card 
      className={`group overflow-hidden border-border/40 bg-card/60 transition-all hover:scale-[1.02] hover:shadow-2xl hover:border-primary/40 relative h-full ${className}`}
      style={themeColor ? { 
        '--card-theme': themeColor,
        boxShadow: `0 0 20px -12px ${themeColor}40`
      } as any : {}}
    >
      {/* Visual Area */}
      <div className={`relative ${aspectRatio} overflow-hidden bg-muted/20 border-b border-border/40`}>
        {imageUrl ? (
          <>
            {/* Blurred Backdrop */}
            <img 
              src={imageUrl} 
              className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-20 scale-110" 
              aria-hidden="true" 
            />
            {/* Main Art */}
            <img 
              src={imageUrl} 
              alt={title} 
              className="relative h-full w-full object-contain p-2 transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] z-10" 
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/5">
            <span className="text-4xl font-serif italic text-primary/10 opacity-20 uppercase">
              {title.slice(0, 1)}
            </span>
          </div>
        )}
        
        {/* Overlay Glow if themeColor exists */}
        {themeColor && (
          <div 
            className="absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-30" 
            style={{ backgroundColor: themeColor }}
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        
        {/* Label Overlays */}
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          <p className="text-[10px] font-black uppercase tracking-tight text-white/90 truncate drop-shadow-md">
            {title}
          </p>
          {subtitle && (
            <Badge variant="outline" className="text-[8px] h-3.5 px-1 font-bold border-white/20 bg-black/20 text-white/70 backdrop-blur-sm shrink-0">
              {subtitle}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-3 space-y-2 bg-gradient-to-b from-card/80 to-card/40 flex-1 flex flex-col">
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {badges.map((badge, idx) => (
              <Badge 
                key={idx} 
                variant={badge.variant || "secondary"} 
                className="text-[9px] font-bold h-4 px-1.5"
                style={badge.color ? { color: badge.color, borderColor: `${badge.color}40`, backgroundColor: `${badge.color}10` } : {}}
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
        
        {description && (
          <p className="text-[10px] leading-relaxed text-muted-foreground line-clamp-2 italic flex-1">
            {description}
          </p>
        )}
      </CardContent>
      
      {/* Bottom accent */}
      {themeColor && (
        <div className="h-0.5 w-full bg-border/5">
          <div 
            className="h-full transition-all duration-700 group-hover:w-full" 
            style={{ width: '15%', backgroundColor: themeColor }} 
          />
        </div>
      )}
    </Card>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block h-full">{content}</Link>;
  }

  return content;
};
