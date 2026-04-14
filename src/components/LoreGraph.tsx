import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import type { Sinner, GraphEdge, EdgeType } from '../types';

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
  'literary-origin': '#e63946',        // 🔴 red
  'thematic-link': '#4895ef',          // 🔵 blue
  'cross-game-continuity': '#f9c74f', // 🟡 yellow
  'shared-literary-group': '#90be6d',  // 🟢 green
};

const EDGE_LABELS: Record<EdgeType, string> = {
  'literary-origin': 'Literary Origin',
  'thematic-link': 'Shared Theme',
  'cross-game-continuity': 'Cross-Game',
  'shared-literary-group': 'Shared Group',
};

interface LoreGraphProps {
  sinners: Sinner[];
  edges: GraphEdge[];
  selectedSinner: Sinner | null;
  onNodeClick: (sinner: Sinner) => void;
  activeEdgeTypes: Set<EdgeType>;
}

export function LoreGraph({
  sinners,
  edges,
  selectedSinner,
  onNodeClick,
  activeEdgeTypes,
}: LoreGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const buildGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // ── Zoom & Pan ──────────────────────────────────────────────────────────
    const zoomGroup = svg.append('g').attr('class', 'zoom-group');
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on('zoom', (event) => {
          zoomGroup.attr('transform', event.transform);
        })
    );

    // ── Build Nodes ────────────────────────────────────────────────────────
    const nodes: GraphNode[] = sinners.map((s) => ({
      id: s.id,
      name: s.name,
      literarySourceIds: s.literarySources.map((ls) => ls.id),
      themes: [...s.themes],
      crossGameContinuity: s.crossGameContinuity,
      appearances: [...s.appearances],
      isSelected: selectedSinner?.id === s.id,
    }));

    // ── Build Links ────────────────────────────────────────────────────────
    const links: GraphLink[] = edges
      .filter((e) => activeEdgeTypes.has(e.type))
      .map((e) => ({
        source: e.source,
        target: e.target,
        type: e.type,
      }));

    // ── Force Simulation ───────────────────────────────────────────────────
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(160)
          .strength(0.4)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // ── Links ───────────────────────────────────────────────────────────────
    const linkGroup = zoomGroup.append('g').attr('class', 'links');
    const linkEls = linkGroup
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .join('line')
      .attr('stroke', (d) => EDGE_COLORS[d.type])
      .attr('stroke-opacity', 0.45)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d) =>
        d.type === 'cross-game-continuity' ? '6,4' : 'none'
      );

    // ── Nodes ──────────────────────────────────────────────────────────────
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
          })
      )
      .on('click', (_, d) => {
        const s = sinners.find((s) => s.id === d.id);
        if (s) onNodeClick(s);
      });

    // Node circle
    nodeEls
      .append('circle')
      .attr('r', (d) => (d.crossGameContinuity ? 26 : 22))
      .attr('fill', (d) =>
        d.isSelected
          ? '#e63946'
          : d.crossGameContinuity
          ? '#1a1a2e'
          : '#16213e'
      )
      .attr('stroke', (d) =>
        d.isSelected ? '#e63946' : '#4895ef'
      )
      .attr('stroke-width', (d) => (d.isSelected ? 3 : 2));

    // Cross-game glow ring
    nodeEls
      .filter((d) => d.crossGameContinuity)
      .append('circle')
      .attr('r', (d) => (d.crossGameContinuity ? 30 : 26))
      .attr('fill', 'none')
      .attr('stroke', (d) =>
        d.isSelected ? '#e63946' : '#f9c74f'
      )
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.5);

    // Node label
    nodeEls
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => (d.crossGameContinuity ? 42 : 38))
      .attr('font-size', '11px')
      .attr('fill', '#c8d6e5')
      .attr('font-family', '"Space Grotesk", sans-serif')
      .attr('pointer-events', 'none');

    // Hover tooltip circle (invisible hit area)
    nodeEls
      .append('circle')
      .attr('r', 34)
      .attr('fill', 'transparent');

    // ── Simulation Tick ────────────────────────────────────────────────────
    simulation.on('tick', () => {
      linkEls
        .attr('x1', (d) => (d.source as GraphNode).x!)
        .attr('y1', (d) => (d.source as GraphNode).y!)
        .attr('x2', (d) => (d.target as GraphNode).x!)
        .attr('y2', (d) => (d.target as GraphNode).y!);

      nodeEls.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, [sinners, edges, selectedSinner, onNodeClick, activeEdgeTypes]);

  useEffect(() => {
    const cleanup = buildGraph();
    return () => cleanup?.();
  }, [buildGraph]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ display: 'block' }} />
    </div>
  );
}

export { EDGE_COLORS, EDGE_LABELS };
export type { GraphNode, GraphLink };
