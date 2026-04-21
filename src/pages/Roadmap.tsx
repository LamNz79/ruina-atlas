import { Link } from 'react-router-dom';
import roadmapData from '../../docs/roadmap.json';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Clock3,
  GitBranch,
  Hammer,
  Map,
  Target,
} from 'lucide-react';

type Milestone = {
  id: string;
  name: string;
  status: string;
  priority: string;
  description: string;
  deliverables?: string[];
  implemented_now?: string[];
  remaining_work?: string[];
  references?: Record<string, string>;
};

type RoadmapData = {
  project: string;
  last_updated?: string;
  status: string;
  summary: string;
  milestones: Milestone[];
  current_snapshot?: {
    sinners: number;
    literary_sources: number;
    cross_game_entities: number;
    major_ui_surfaces: string[];
  };
  next_action?: string;
};

const roadmap = roadmapData as RoadmapData;

const STATUS_META: Record<string, { label: string; className: string; icon: typeof CircleDot }> = {
  completed: {
    label: 'Completed',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    icon: CheckCircle2,
  },
  in_progress: {
    label: 'In Progress',
    className: 'border-primary/30 bg-primary/10 text-primary',
    icon: Hammer,
  },
  not_started: {
    label: 'Not Started',
    className: 'border-border/50 bg-muted/40 text-muted-foreground',
    icon: Clock3,
  },
};

function getStatusMeta(status: string) {
  if (status.startsWith('completed')) return STATUS_META.completed;
  if (status.startsWith('in_progress')) return STATUS_META.in_progress;
  return STATUS_META.not_started;
}

function getPriorityTone(priority: string) {
  switch (priority) {
    case 'critical':
      return 'border-[#e06070]/30 bg-[#e06070]/10 text-[#f2a0ad]';
    case 'high':
      return 'border-[#f5c518]/30 bg-[#f5c518]/10 text-[#f5c518]';
    case 'medium':
      return 'border-[#a08a70]/30 bg-[#a08a70]/10 text-[#d3bea7]';
    default:
      return 'border-border/50 bg-muted/40 text-muted-foreground';
  }
}

export default function Roadmap() {
  return (
    <div className="dark flex min-h-screen w-full flex-col overflow-auto bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <img
            src="/favicon.svg"
            alt="Ruina Atlas"
            className="h-8 w-8 object-contain"
          />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight leading-none">{roadmap.project}</h1>
            <p className="hidden text-[10px] font-medium text-muted-foreground sm:block leading-none mt-0.5">
              Project roadmap and milestone tracking
            </p>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium">
          <Link to="/">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Atlas
          </Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-6xl space-y-8">
          <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <Card className="border-border/40 bg-card/70 shadow-xl backdrop-blur-sm">
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                    <Map className="mr-1.5 h-3.5 w-3.5" />
                    {roadmap.status}
                  </Badge>
                  {roadmap.last_updated && (
                    <Badge variant="outline" className="border-border/50 bg-muted/40 text-muted-foreground">
                      Updated {roadmap.last_updated}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Build the atlas without faking the map
                  </CardTitle>
                  <CardDescription className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {roadmap.summary}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-border/40 bg-card/70 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Next Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {roadmap.next_action ?? 'Continue the current milestone with the highest-signal cleanup pass.'}
                </p>
              </CardContent>
            </Card>
          </section>

          {roadmap.current_snapshot && (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
                <CardContent className="p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Sinners</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{roadmap.current_snapshot.sinners}</p>
                </CardContent>
              </Card>
              <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
                <CardContent className="p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Literary Sources</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{roadmap.current_snapshot.literary_sources}</p>
                </CardContent>
              </Card>
              <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
                <CardContent className="p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Entities</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{roadmap.current_snapshot.cross_game_entities}</p>
                </CardContent>
              </Card>
              <Card className="border-border/40 bg-card/70 backdrop-blur-sm">
                <CardContent className="p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">UI Surfaces</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{roadmap.current_snapshot.major_ui_surfaces.length}</p>
                </CardContent>
              </Card>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Milestones</h2>
            </div>

            <div className="space-y-4">
              {roadmap.milestones.map((milestone) => {
                const statusMeta = getStatusMeta(milestone.status);
                const StatusIcon = statusMeta.icon;

                return (
                  <Card key={milestone.id} className="border-border/40 bg-card/70 shadow-lg backdrop-blur-sm">
                    <CardHeader className="space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="border-border/50 bg-muted/40 font-mono text-[10px] text-muted-foreground">
                              {milestone.id}
                            </Badge>
                            <Badge variant="outline" className={statusMeta.className}>
                              <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                              {statusMeta.label}
                            </Badge>
                            <Badge variant="outline" className={getPriorityTone(milestone.priority)}>
                              {milestone.priority}
                            </Badge>
                          </div>
                          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
                            {milestone.name}
                          </CardTitle>
                          <CardDescription className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                            {milestone.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                      {milestone.deliverables && milestone.deliverables.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                            Deliverables
                          </p>
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {milestone.deliverables.map((item) => (
                              <li key={item} className="rounded-md border border-border/40 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {milestone.implemented_now && milestone.implemented_now.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                            Implemented Now
                          </p>
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {milestone.implemented_now.map((item) => (
                              <li key={item} className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm text-muted-foreground">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {milestone.remaining_work && milestone.remaining_work.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                            Remaining Work
                          </p>
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {milestone.remaining_work.map((item) => (
                              <li key={item} className="rounded-md border border-primary/15 bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {milestone.references && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {Object.entries(milestone.references).map(([label, value]) => (
                            <Badge
                              key={label}
                              variant="outline"
                              className="border-border/50 bg-muted/30 text-muted-foreground"
                            >
                              {label}: {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
