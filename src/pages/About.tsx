import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, BookOpen, Compass, Sparkles, Map } from 'lucide-react';

export default function About() {
  return (
    <div className="dark flex w-full flex-col bg-background font-sans text-foreground">      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 w-full items-center border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <img
            src="/favicon.svg"
            alt="Ruina Atlas"
            className="h-8 w-8 object-contain"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight leading-none">Ruina Atlas</h1>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary border border-primary/30">
                Public Beta
              </span>
            </div>
            <p className="hidden text-[10px] font-medium text-muted-foreground sm:block leading-none mt-1">
              Literary connections of Project Moon's universe
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        {/* Logo Hero */}
        <div className="mb-12 flex flex-col items-center gap-6">
          <img
            src="/logoWithoutBackground.png"
            alt="Ruina Atlas Logo"
            className="w-64 max-w-[80vw] object-contain sm:w-80"
          />
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Ruina Atlas
            </h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Map the literary world of Project Moon
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="w-full max-w-2xl space-y-8">
          {/* What is this */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <BookOpen className="h-5 w-5 text-primary" />
              What is Ruina Atlas?
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ruina Atlas is a fan-made literary map tool for Project Moon's universe — connecting the Sinners of Limbus Company to their literary origins across all three games. Currently in <strong>Public Beta</strong>, the atlas is a living document that grows through community research and lore analysis.
            </p>
          </section>

          {/* Why */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Compass className="h-5 w-5 text-primary" />
              Why a literary map?
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Project Moon's games are deeply rooted in world literature — from Dante Alighieri's Divine Comedy to Robert Louis Stevenson's Strange Case of Dr Jekyll and Mr Hyde. Ruina Atlas makes these connections visible, helping fans discover the books behind the games.
            </p>
          </section>

          {/* Features */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Features
            </h3>
            <ul className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {[
                'Explore 13 Sinners across all 3 Project Moon games',
                'Trace literary sources from Dante to Kafka',
                'Filter by wing affiliation and theme',
                'Discover cross-game entity connections',
                'Browse Canto-by-Canto story breakdowns',
                'Source explorer for literary references',
              ].map((feat) => (
                <li key={feat} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {feat}
                </li>
              ))}
            </ul>
          </section>

          {/* Tech */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Built with</h3>
            <p className="text-sm text-muted-foreground">
              React · TypeScript · Vite · Tailwind CSS · D3.js · React Router · Vercel
            </p>
          </section>

          {/* Disclaimer */}
          <section className="rounded-lg border border-border/40 bg-card p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="font-medium text-foreground">Fan project disclaimer:</strong>{' '}
              Ruina Atlas is a fan-made project and is not affiliated with or endorsed by Project Moon. All literary connections are researched by fans and may not be exhaustive or definitive. Project Moon and its games are the intellectual property of their respective creators.
            </p>
          </section>

          {/* Actions */}
          <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center">
            <Button asChild className="w-full sm:w-auto">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Back to the Atlas
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/roadmap">
                <Map className="h-4 w-4" />
                View Roadmap
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <a href="https://github.com/LamNz79/ruina-atlas" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex h-8 w-full items-center justify-center border-t border-border/40 bg-background/95 px-6 text-[11px] font-medium text-muted-foreground backdrop-blur">
        <a
          href="https://github.com/eldritchtools/limbus-shared-library"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors hover:underline"
        >
          Data: eldritchtools/limbus-shared-library
        </a>
      </footer>
    </div>
  );
}
