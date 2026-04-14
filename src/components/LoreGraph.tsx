import { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import type { Sinner, GraphEdge, EdgeType } from '../types';
import { GraphSettings } from './GraphSettings';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  literarySourceIds: string[];
  themes: string[];
  crossGameContinuity: boolean;
  appearances: string[];
  isSelected: boolean;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  type: EdgeType;
}

const EDGE_COLORS: Record<EdgeType, string> = {
  'literary-origin': '#f5c2e7',
  'thematic-link': '#89b4fa',
  'cross-game-continuity': '#f9e2af',
  'shared-literary-group': '#a6e3a1',
};

const EDGE_LABELS: Record<EdgeType, string> = {
  'literary-origin': 'Literary Origin',
  'thematic-link': 'Shared Theme',
  'cross-game-continuity': 'Cross-Game',
  'shared-literary-group': 'Shared Group',
};

const ALL_EDGE_TYPES: EdgeType[] = [
  'literary-origin',
  'thematic-link',
  'cross-game-continuity',
];

export interface PhysicsSettings {
  nodeSpacing: number;
  repulsion: number;
  centering: number;
}

const DEFAULTS: PhysicsSettings = {
  nodeSpacing: 160,
  repulsion: -400,
  centering: 0.07,
};

interface LoreGraphProps {
  sinners: Sinner[];
  edges: GraphEdge[];
  selectedSinner: Sinner | null;
  onNodeClick: (sinner: Sinner) => void;
}

export function LoreGraph({
  sinners,
  edges,
  selectedSinner,
  onNodeClick,
}: LoreGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [physics, setPhysics] = useState<PhysicsSettings>(DEFAULTS);
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Set<EdgeType>>(
    new Set(ALL_EDGE_TYPES),
  );

  const toggleEdgeType = useCallback((type: EdgeType) => {
    setActiveEdgeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const buildGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const zoomGroup = svg.append('g').attr('class', 'zoom-group');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        zoomGroup.attr('transform', event.transform);
      });
    zoomRef.current = zoom;
    svg.call(zoom);

    const nodes: GraphNode[] = sinners.map((s) => ({
      id: s.id,
      name: s.name,
      literarySourceIds: s.literarySources.map((ls) => ls.id),
      themes: [...s.themes],
      crossGameContinuity: s.crossGameContinuity,
      appearances: [...s.appearances],
      isSelected: selectedSinner?.id === s.id,
    }));

    const links: GraphLink[] = edges
      .filter((e) => activeEdgeTypes.has(e.type))
      .map((e) => ({
        source: e.source,
        target: e.target,
        type: e.type,
      }));

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(physics.nodeSpacing)
          .strength(0.4),
      )
      .force('charge', d3.forceManyBody().strength(physics.repulsion))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(physics.centering))
      .force('collision', d3.forceCollide().radius(55));

    const linkGroup = zoomGroup.append('g').attr('class', 'links');
    const linkEls = linkGroup
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => EDGE_COLORS[d.type])
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d) =>
        d.type === 'cross-game-continuity' ? '6,4' : 'none',
      );

    const nodeGroup = zoomGroup.append('g').attr('class', 'nodes');
    const nodeEls = nodeGroup
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      )
      .on('click', (_, d) => {
        const s = sinners.find((s) => s.id === d.id);
        if (s) onNodeClick(s);
      });

    nodeEls
      .append('circle')
      .attr('r', (d) => (d.crossGameContinuity ? 26 : 22))
      .attr('fill', (d) =>
        d.isSelected
          ? '#e63946'
          : d.crossGameContinuity
          ? '#1a1a2e'
          : '#16213e',
      )
      .attr('stroke', (d) =>
        d.isSelected ? '#e63946' : '#4895ef',
      )
      .attr('stroke-width', (d) => (d.isSelected ? 3 : 2));

    nodeEls
      .filter((d) => d.crossGameContinuity)
      .append('circle')
      .attr('r', (d) => (d.crossGameContinuity ? 30 : 26))
      .attr('fill', 'none')
      .attr('stroke', (d) =>
        d.isSelected ? '#e63946' : '#f9c74f',
      )
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.5);

    nodeEls
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.crossGameContinuity ? 42 : 38))
      .attr('font-size', '11px')
      .attr('fill', '#c8d6e5')
      .attr('font-family', '"Space Grotesk", sans-serif')
      .attr('pointer-events', 'none');

    nodeEls
      .append('circle')
      .attr('r', 34)
      .attr('fill', 'transparent');

    simulation.on('tick', () => {
      linkEls
        .attr('x1', (d) => (d.source as GraphNode).x!)
        .attr('y1', (d) => (d.source as GraphNode).y!)
        .attr('x2', (d) => (d.target as GraphNode).x!)
        .attr('y2', (d) => (d.target as GraphNode).y!);

      nodeEls.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [sinners, edges, selectedSinner, onNodeClick, activeEdgeTypes, physics]);

  useEffect(() => {
    const cleanup = buildGraph();
    return () => cleanup?.();
  }, [buildGraph]);

  const handleResetLayout = useCallback(() => {
    setPhysics(DEFAULTS);
  }, []);

  const handleResetZoom = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg ref={svgRef} style={{ display: 'block' }} />
      <GraphSettings
        nodeSpacing={physics.nodeSpacing}
        repulsion={physics.repulsion}
        centering={physics.centering}
        onNodeSpacingChange={(v) => setPhysics((p) => ({ ...p, nodeSpacing: v }))}
        onRepulsionChange={(v) => setPhysics((p) => ({ ...p, repulsion: v }))}
        onCenteringChange={(v) => setPhysics((p) => ({ ...p, centering: v }))}
        activeEdgeTypes={activeEdgeTypes}
        onToggleEdgeType={toggleEdgeType}
        onResetLayout={handleResetLayout}
        onResetZoom={handleResetZoom}
      />
    </div>
  );
}

export { EDGE_COLORS, EDGE_LABELS };
export type { GraphNode, GraphLink };
