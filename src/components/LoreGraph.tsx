import { TooltipProvider } from '@/components/ui/tooltip';
import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import crossGameEntities from '../data/crossGameEntities.json';
import { literarySources } from '../data/literarySources';
import type { CrossGameEntity, EdgeType, GraphEdge, Sinner, Theme } from '../types';
import { FilterPanel } from './FilterPanel';
import { GraphSettings } from './GraphSettings';
import GraphLegend from './GraphLegend';

import type { FilterState, GraphLink, GraphNode, PhysicsSettings } from './LoreGraphConstants';
import {
  ALL_EDGE_TYPES,
  DEFAULTS,
  EDGE_COLORS,
  EDGE_LABELS,
  ENTITY_COLORS,
  INITIAL_FILTER_STATE,
  NODE_GAME_COLORS,
  RISK_LEVEL_COLORS
} from './LoreGraphConstants';
import { calculateSharedThemes, getVisibleAncestorId } from './LoreGraphUtils';

interface LoreGraphProps {
  sinners: Sinner[];
  edges: GraphEdge[];
  selectedSinner: Sinner | null;
  selectedEntity: string | null;
  expandedNodeIds: Set<string>;
  focusNodeId?: string | null;
  onNodeClick: (sinner: Sinner) => void;
  onEntityClick: (entityId: string) => void;
  onSourceClick: (sourceId: string) => void;
  onToggleExpand: (id: string) => void;
  onPin: (node: any) => void;
  onClearFocus?: () => void;
}

export function LoreGraph({
  sinners,
  edges,
  selectedSinner,
  selectedEntity,
  expandedNodeIds,
  focusNodeId,
  onNodeClick,
  onEntityClick,
  onSourceClick,
  onToggleExpand,
  onPin,
  onClearFocus,
}: LoreGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const nodesRef = useRef<Map<string, GraphNode>>(new Map());
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // --- UI State ---
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [physics, setPhysics] = useState<PhysicsSettings>(DEFAULTS);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Set<EdgeType>>(new Set(ALL_EDGE_TYPES.filter(t => t !== 'thematic-link')));
  const [tooltip, setTooltip] = useState<any>({ visible: false, type: 'node', name: '', x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // --- Size constants (Match Worker) ---
  const S_R = 26;   // sinner
  const H_R = 28;   // abnormality
  const W_R = 42;   // wing
  const BK_W = 46;  // book width
  const BK_H = 82;  // book height

  // --- Data Processing ---
  const graphData = useMemo(() => {
    const entityLinks: GraphLink[] = [];
    const rawEntities = crossGameEntities.entities as CrossGameEntity[];

    rawEntities.forEach(e => {
      if (e.parentEntityId) {
        entityLinks.push({ source: e.parentEntityId, target: e.id, type: 'structural-hierarchy', label: 'Contains' });
      }
      if (e.relatedSinnerIds) {
        e.relatedSinnerIds.forEach(sid => {
          entityLinks.push({ source: e.id, target: sid, type: e.type === 'abnormality' ? 'ego-synchronization' : 'wing-affiliation', label: 'Resonance' });
        });
      }
    });

    const connectionCount: Record<string, number> = {};
    [...edges, ...entityLinks].forEach(l => {
      const sId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      connectionCount[sId] = (connectionCount[sId] ?? 0) + 1;
      connectionCount[tId] = (connectionCount[tId] ?? 0) + 1;
    });

    const sinnerNodes: GraphNode[] = sinners.filter(s => s.themes.some(t => filters.themes.has(t as Theme))).map(s => ({
      ...s, id: s.id, literarySourceIds: s.literarySources.map(ls => ls.id), themes: [...s.themes],
      nodeType: 'sinner', connectionCount: connectionCount[s.id] ?? 0,
    }));

    const visibleEntities = (() => {
      if (!filters.showArchiveNodes) return [];
      const visible = new Set<string>();

      rawEntities.forEach(e => {
        if (!e.parentEntityId) {
          const isMajorFaction = e.type === 'wing' || e.type === 'association' || e.type === 'finger' || e.type === 'syndicate';
          const isHub = ['entity-l-corp', 'entity-library', 'entity-limbus-company', 'entity-blade-lineage'].includes(e.id);
          const hasSinner = (e.relatedSinnerIds?.length ?? 0) > 0;
          if (isHub || hasSinner || isMajorFaction) visible.add(e.id);
        }
      });

      let changed = true;
      while (changed) {
        changed = false;
        rawEntities.forEach(e => {
          if (e.parentEntityId && !visible.has(e.id) && visible.has(e.parentEntityId) && expandedNodeIds.has(e.parentEntityId)) {
            visible.add(e.id);
            changed = true;
          }
        });
      }

      return rawEntities.filter(e => {
        if (!visible.has(e.id)) return false;
        if (e.type === 'wing' && !filters.showWings) return false;
        if (e.type === 'abnormality' && !filters.showAbnormalities) return false;
        if (e.type === 'association' && !filters.showAssociations) return false;
        if (e.type === 'finger' && !filters.showFingers) return false;
        if (e.type === 'character' && !filters.showCharacters) return false;
        if (e.type === 'syndicate' && !filters.showAssociations) return false; // Group with associations for now
        if (e.themes && e.themes.length > 0 && !e.themes.some(t => filters.themes.has(t as Theme))) return false;
        if (e.spoilerLevel && e.spoilerLevel > filters.cantoLevel) return false;
        return true;
      });
    })();

    const entityNodes: GraphNode[] = visibleEntities.map(e => ({
      ...e, nodeType: 'entity', entityType: e.type as any, themes: e.themes ?? [],
      literarySourceIds: (e as any).literarySourceIds ?? [],
      connectionCount: connectionCount[e.id] ?? 0,
      crossGameContinuity: e.appearances ? e.appearances.includes('lobotomy') && e.appearances.includes('ruina') : false,
    } as GraphNode));

    const usedLitIds = new Set([
      ...sinnerNodes.flatMap(s => s.literarySourceIds),
      ...entityNodes.flatMap(e => e.literarySourceIds)
    ]);

    const litNodes: GraphNode[] = literarySources.filter(ls => usedLitIds.has(ls.id)).map(ls => ({
      id: `lit-${ls.id}`, name: ls.title, canonicalGame: 'limbus' as any, literarySourceIds: [ls.id], themes: ls.themes ?? [],
      nodeType: 'literary-source', connectionCount: 0, crossGameContinuity: false,
    }));

    const litLinks: GraphLink[] = [];
    [...sinnerNodes, ...entityNodes].forEach(node => {
      node.literarySourceIds.forEach(lid => {
        const litNodeId = `lit-${lid}`;
        const sourceData = literarySources.find(ls => ls.id === lid);
        const isTheological = sourceData?.category === 'theological';
        litLinks.push({
          source: node.id,
          target: litNodeId,
          type: isTheological ? 'theological-origin' : 'literary-origin',
          label: isTheological ? 'Divine Inspiration' : 'Literary Source'
        });
      });
    });

    const allNodes = [...sinnerNodes, ...entityNodes, ...litNodes];
    const nodeMap = new Map<string, GraphNode>(allNodes.map(n => [n.id, n]));

    const allLinks = [...edges, ...entityLinks, ...litLinks].map(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
      const newS = nodeMap.has(s) ? s : getVisibleAncestorId(s, rawEntities, nodeMap);
      const newT = nodeMap.has(t) ? t : getVisibleAncestorId(t, rawEntities, nodeMap);
      return { ...l, source: newS, target: newT };
    }).filter(l => l.source !== l.target && nodeMap.has(l.source as string) && nodeMap.has(l.target as string) && activeEdgeTypes.has(l.type));

    return { nodes: allNodes, links: allLinks };
  }, [sinners, edges, expandedNodeIds, filters, activeEdgeTypes]);

  // --- Worker Lifecycle ---
  useEffect(() => {
    const worker = new Worker(new URL('./loreGraphWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const { type, nodes: workerNodes } = event.data;
      if (type === 'tick') {
        workerNodes.forEach((n: any) => {
          const local = nodesRef.current.get(n.id);
          if (local) {
            local.x = n.x;
            local.y = n.y;
          }
        });
      }
    };

    worker.postMessage({ type: 'init', data: { physics } });

    return () => worker.terminate();
  }, []);

  useEffect(() => {
    if (workerRef.current) {
      // Initialize/Update nodes with positions from refs if available
      graphData.nodes.forEach(n => {
        const existing = nodesRef.current.get(n.id);
        if (existing) {
          n.x = existing.x;
          n.y = existing.y;
        }
      });
      nodesRef.current = new Map(graphData.nodes.map(n => [n.id, n]));
      workerRef.current.postMessage({ type: 'updateData', data: { nodes: graphData.nodes, links: graphData.links } });
    }
  }, [graphData]);

  useEffect(() => {
    workerRef.current?.postMessage({ type: 'updatePhysics', data: { physics } });
  }, [physics]);

  // --- Rendering Functions ---
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set internal resolution based on DPR
    if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    }

    // Ensure CSS size matches container exactly
    if (canvas.style.width !== `${rect.width}px`) canvas.style.width = `${rect.width}px`;
    if (canvas.style.height !== `${rect.height}px`) canvas.style.height = `${rect.height}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    // 1. Scale to device pixels
    ctx.scale(dpr, dpr);
    
    // 2. Apply D3 zoom transform (translation and scale are in CSS pixels)
    const transform = transformRef.current;
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    const activeId = hoverId || focusNodeId || selectedSinner?.id || selectedEntity;

    graphData.links.forEach(l => {
      const s = nodesRef.current.get(typeof l.source === 'string' ? l.source : (l.source as any).id);
      const t = nodesRef.current.get(typeof l.target === 'string' ? l.target : (l.target as any).id);
      if (!s || !t) return;

      const isConnected = (s.id === activeId || t.id === activeId);
      if (typeof s.x !== 'number' || typeof s.y !== 'number' || typeof t.x !== 'number' || typeof t.y !== 'number') return;
      
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);

      ctx.strokeStyle = EDGE_COLORS[l.type] || '#ccc';
      ctx.globalAlpha = isConnected ? 0.9 : (activeId ? 0.05 : 0.3);
      ctx.lineWidth = isConnected ? 2 / transform.k : 1 / transform.k;

      if (isConnected) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.strokeStyle;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.stroke();
    });

    ctx.restore();
  }, [graphData.links, hoverId, focusNodeId, selectedSinner, selectedEntity]);

  const updateSVGPositions = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;
    const transform = transformRef.current;
    const svg = d3.select(svgRef.current);
    
    // Update SVG container dimensions to match precisely
    const rect = containerRef.current.getBoundingClientRect();
    if (svg.attr('width') !== rect.width.toString()) svg.attr('width', rect.width);
    if (svg.attr('height') !== rect.height.toString()) svg.attr('height', rect.height);

    svg.select('.zoom-group').attr('transform', transform.toString());

    svg.selectAll<SVGGElement, GraphNode>('.node-group')
      .attr('transform', d => {
        const n = nodesRef.current.get(d.id);
        return (n && typeof n.x === 'number' && typeof n.y === 'number') ? `translate(${n.x},${n.y})` : '';
      });
  }, []);

  const renderRef = useRef({ renderCanvas, updateSVGPositions });
  useEffect(() => {
    renderRef.current = { renderCanvas, updateSVGPositions };
  }, [renderCanvas, updateSVGPositions]);

  useEffect(() => {
    let frameId: number;
    const loop = () => {
      renderRef.current.renderCanvas();
      renderRef.current.updateSVGPositions();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []); // Stable loop that doesn't restart

  // --- SVG Node Rendering Logic ---
  const makeHexPath = (r: number) => {
    const pts: [number, number][] = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return [r * Math.cos(a), r * Math.sin(a)];
    });
    return `M${pts.map(p => p.join(',')).join('L')}Z`;
  };

  const renderNodeContent = useCallback((el: d3.Selection<SVGGElement, GraphNode, any, any>) => {
    el.each(function (d) {
      const nodeEl = d3.select(this);
      nodeEl.selectAll('*').remove();

      // Add node type for CSS selection
      nodeEl.attr('data-node-type', d.nodeType);
      if (d.entityType) nodeEl.attr('data-entity-type', d.entityType);

      const color = d.nodeType === 'sinner' ? NODE_GAME_COLORS[d.canonicalGame] : ENTITY_COLORS[d.entityType || 'character'];

      if (d.nodeType === 'literary-source') {
        const sourceId = d.id.replace('lit-', '');
        const sourceData = literarySources.find(ls => ls.id === sourceId);
        const isTheological = sourceData?.category === 'theological';
        
        // Base Card / Background
        nodeEl.append('rect').attr('class', 'node-hit book-card-base')
          .attr('x', -BK_W / 2).attr('y', -BK_H / 2)
          .attr('width', BK_W).attr('height', BK_H)
          .attr('rx', 1).attr('fill', '#080809').attr('stroke', isTheological ? '#f5c518' : '#a08a70').attr('stroke-width', 2);

        // Cover Image
        if (sourceData?.coverImage) {
          nodeEl.append('image').attr('class', 'book-cover-preview')
            .attr('href', sourceData.coverImage)
            .attr('x', -BK_W / 2 + 3).attr('y', -BK_H / 2 + 1)
            .attr('width', BK_W - 4).attr('height', BK_H - 2)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .style('filter', 'grayscale(100%) brightness(20%)').style('opacity', 0.6);
        }

        // Spine Decoration (Left side)
        nodeEl.append('line').attr('x1', -BK_W / 2 + 3).attr('y1', -BK_H / 2).attr('x2', -BK_W / 2 + 3).attr('y2', BK_H / 2)
          .attr('stroke', isTheological ? '#f5c518' : '#a08a70').attr('stroke-width', 0.5).attr('opacity', 0.8);

        // Theological "Divine Halo" / Aura
        if (isTheological) {
          nodeEl.insert('rect', ':first-child')
            .attr('x', -BK_W / 2 - 10).attr('y', -BK_H / 2 - 10)
            .attr('width', BK_W + 20).attr('height', BK_H + 20)
            .attr('fill', 'none').attr('stroke', '#fdfbd3').attr('stroke-width', 2.5).attr('opacity', 0.4).attr('rx', 4)
            .style('filter', 'blur(8px)');
          
          nodeEl.append('path').attr('d', 'M-8,-25 L8,-25 M0,-30 L0,-20') // Small cross/anchor symbol
            .attr('stroke', '#f5c518').attr('stroke-width', 1.5).attr('fill', 'none');
        }

        // Standard Icon
        const iconPath = 'M6 3.126v6.5c-1.25-.85-3.25-.85-4.5 0v-6.5c1.25-.85 3.25-.85 4.5 0z M6 3.126c1.25-.85 3.25-.85 4.5 0v6.5c-1.25-.85-3.25-.85-4.5 0';
        nodeEl.append('path').attr('d', iconPath).attr('transform', `translate(-6, -6) scale(1.2)`)
          .attr('stroke', isTheological ? '#f5c518' : '#a08a70').attr('fill', 'none').attr('stroke-width', 1).attr('opacity', 0.7);

      } else if (d.nodeType === 'entity') {
        if (d.entityType === 'wing') {
          const wingColor = d.id === 'wing-n-corp' ? '#e2e8f0' : d.id === 'wing-w-corp' ? '#60a5fa' : d.id === 'wing-k-corp' ? '#34d399' : d.id === 'wing-t-corp' ? '#fbbf24' : color;
          nodeEl.append('path').attr('class', 'node-hit').attr('d', makeHexPath(W_R)).attr('fill', '#080809').attr('stroke', wingColor).attr('stroke-width', 2.5);
          nodeEl.append('text').text(d.name.charAt(0)).attr('text-anchor', 'middle').attr('dy', '0.35em').attr('fill', wingColor).attr('font-size', '20px').attr('font-weight', '900');
        } else if (d.entityType === 'abnormality') {
          const riskColor = d.riskLevel ? RISK_LEVEL_COLORS[d.riskLevel] : '#8a4a5a';
          nodeEl.append('path').attr('d', makeHexPath(H_R)).attr('fill', 'none').attr('stroke', riskColor).attr('stroke-width', 10).attr('opacity', 0.25).style('filter', 'blur(6px)');
          nodeEl.append('path').attr('class', 'node-hit').attr('d', makeHexPath(H_R)).attr('fill', '#0a0a0c').attr('stroke', riskColor).attr('stroke-width', 1.8);
          nodeEl.append('text').text(d.subjectNumber || '?-??-??').attr('text-anchor', 'middle').attr('dy', '0.35em').attr('fill', riskColor).attr('font-size', '9px').attr('font-weight', '900');
        } else if (d.entityType === 'association' || d.entityType === 'syndicate') {
          const isBladeLineage = d.id === 'entity-blade-lineage';
          const factionColor = isBladeLineage ? '#22c55e' : '#d4af37';
          
          // Diamond shape for Blade Lineage / Syndicates
          nodeEl.append('path').attr('d', `M0 -${H_R} L${H_R} 0 L0 ${H_R} L-${H_R} 0 Z`).attr('fill', '#0c0c0e').attr('stroke', factionColor).attr('stroke-width', 2);
          
          if (isBladeLineage) {
            // Gat (Bamboo Hat) Icon
            const gatPath = 'M-12,5 Q0,-8 12,5 L12,8 Q0,-5 -12,8 Z M-6,5 Q0,-18 6,5';
            nodeEl.append('path').attr('d', gatPath).attr('fill', 'none').attr('stroke', factionColor).attr('stroke-width', 1.5).attr('opacity', 0.9);
          } else {
            nodeEl.append('text').text(d.name.charAt(0)).attr('text-anchor', 'middle').attr('dy', '0.35em').attr('fill', factionColor).attr('font-size', '16px').attr('font-weight', '900');
          }
        } else if (d.entityType === 'finger') {
          nodeEl.append('path').attr('d', `M0 -${H_R} L${H_R} ${H_R} L-${H_R} ${H_R} Z`).attr('fill', '#080809').attr('stroke', '#9333ea').attr('stroke-width', 2.5);
          nodeEl.append('text').text((d as any).tokenLabel || '?').attr('text-anchor', 'middle').attr('dy', '0.65em').attr('fill', '#e2e8f0').attr('font-size', '16px').attr('font-weight', '900');
        } else {
          nodeEl.append('circle').attr('class', 'node-hit').attr('r', H_R).attr('fill', '#0c0c0e').attr('stroke', color).attr('stroke-width', 2);
        }
      } else if (d.nodeType === 'sinner') {
        const sigColor = d.id === 'dante' ? '#b01c37' : ((d as any).signatureColor || '#b8202f');
        nodeEl.append('circle').attr('r', S_R + 8).attr('fill', sigColor).attr('opacity', 0.12).style('filter', 'blur(6px)');
        nodeEl.append('circle').attr('class', 'node-hit').attr('r', S_R).attr('fill', '#0c0c0e').attr('stroke', sigColor).attr('stroke-width', 2);
        nodeEl.append('text').attr('class', 'sinner-number').text((d as any).sinnerNumber || '??').attr('text-anchor', 'middle').attr('dy', '0.35em').attr('fill', sigColor).attr('font-size', '14px').attr('font-weight', '900');
        if ((d as any).emblemPath) {
          nodeEl.append('path').attr('class', 'sinner-emblem').attr('d', (d as any).emblemPath).attr('transform', `translate(-12, -12)`).attr('fill', 'none').attr('stroke', sigColor).attr('stroke-width', 1.5).style('opacity', 0);
        }
      }

      nodeEl.append('text').text(d.name).attr('dy', d.nodeType === 'literary-source' ? BK_H / 2 + 13 : (d.entityType === 'wing' ? W_R + 15 : H_R + 13))
        .attr('text-anchor', 'middle').attr('fill', '#e8e0d5').attr('font-size', '11px').attr('font-weight', '600').style('text-shadow', '0 2px 4px rgba(0,0,0,0.8)');
    });
  }, []);

  // --- SVG Update Effect ---
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    let g = svg.select<SVGGElement>('.zoom-group');
    
    if (g.empty()) {
      const defs = svg.append('defs');
      const glow = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
      glow.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
      const merge = glow.append('feMerge');
      merge.append('feMergeNode').attr('in', 'coloredBlur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');

      const divineHalo = defs.append('radialGradient').attr('id', 'divine-halo');
      divineHalo.append('stop').attr('offset', '0%').attr('stop-color', '#fdfbd3').attr('stop-opacity', 0.6);
      divineHalo.append('stop').attr('offset', '70%').attr('stop-color', '#f5c518').attr('stop-opacity', 0.2);
      divineHalo.append('stop').attr('offset', '100%').attr('stop-color', '#f5c518').attr('stop-opacity', 0);

      g = svg.append('g').attr('class', 'zoom-group');
      
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.05, 4])
        .on('zoom', (e) => { transformRef.current = e.transform; });
      svg.call(zoom);
      zoomRef.current = zoom;
      
      const width = containerRef.current?.clientWidth || 800;
      const height = containerRef.current?.clientHeight || 800;
      svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.45));
    }

    const nodesSelection = g.selectAll<SVGGElement, GraphNode>('.node-group')
      .data(graphData.nodes, d => d.id);

    const nodesEnter = nodesSelection.enter()
      .append('g')
      .attr('class', 'node-group')
      .on('click', (e, d) => {
        e.stopPropagation();
        if (d.nodeType === 'sinner') onNodeClick(sinners.find(s => s.id === d.id)!);
        else if (d.nodeType === 'literary-source') onSourceClick(d.id.replace('lit-', ''));
        else {
          if (d.entityType === 'wing' && onToggleExpand) onToggleExpand(d.id);
          onEntityClick(d.id);
        }
      })
      .on('mouseenter', (event, d) => {
        if (isDraggingRef.current) return;
        setHoverId(d.id);
        const rect = containerRef.current!.getBoundingClientRect();
        setTooltip({ visible: true, type: 'node', name: d.name, game: d.canonicalGame, themes: d.themes, x: event.clientX - rect.left, y: event.clientY - rect.top });
      })
      .on('mouseleave', () => {
        if (isDraggingRef.current) return;
        setHoverId(null);
        setTooltip(t => ({ ...t, visible: false }));
      })
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (e, d) => {
          isDraggingRef.current = true;
          workerRef.current?.postMessage({ type: 'dragStart', data: { id: d.id, x: e.x, y: e.y } });
        })
        .on('drag', (e, d) => workerRef.current?.postMessage({ type: 'dragMove', data: { id: d.id, x: e.x, y: e.y } }))
        .on('end', (e, d) => {
          isDraggingRef.current = false;
          workerRef.current?.postMessage({ type: 'dragEnd', data: { id: d.id } });
        })
      );

    nodesEnter.call(renderNodeContent);
    nodesSelection.exit().remove();

    // Highlights
    const activeId = hoverId || focusNodeId || selectedSinner?.id || selectedEntity;
    const connectedIds = new Set<string>();
    if (activeId) {
      connectedIds.add(activeId);
      graphData.links.forEach(l => {
        const sId = typeof l.source === 'string' ? l.source : (l.source as any).id;
        const tId = typeof l.target === 'string' ? l.target : (l.target as any).id;
        if (sId === activeId || tId === activeId) { connectedIds.add(sId); connectedIds.add(tId); }
      });
    }

    g.selectAll<SVGGElement, GraphNode>('.node-group')
      .attr('opacity', d => !activeId || connectedIds.has(d.id) ? 1 : 0.15)
      .each(function(d) {
        const isActive = activeId === d.id;
        d3.select(this).selectAll('.sinner-emblem')
          .transition().duration(200)
          .style('opacity', isActive ? 0.9 : 0);
        d3.select(this).selectAll('.sinner-number')
          .transition().duration(200)
          .style('opacity', isActive ? 0 : 1);
        d3.select(this).selectAll('.node-hit')
          .transition().duration(200)
          .attr('stroke-width', isActive ? 4 : (d.entityType === 'wing' ? 2.5 : 2));
      });

  }, [graphData, hoverId, focusNodeId, selectedSinner, selectedEntity, renderNodeContent, sinners]);

  // --- Zoom to selection ---
  useEffect(() => {
    const targetId = selectedSinner?.id || selectedEntity;
    if (!targetId || !zoomRef.current || !svgRef.current || !containerRef.current) return;

    const timer = setTimeout(() => {
      const node = nodesRef.current.get(targetId);
      if (!node || typeof node.x !== 'number' || typeof node.y !== 'number') return;

      const width = containerRef.current!.clientWidth;
      const height = containerRef.current!.clientHeight;
      const scale = 1.6;

      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-node.x, -node.y);

      d3.select(svgRef.current!)
        .transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .call(zoomRef.current!.transform, transform);
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedSinner, selectedEntity]);

  return (
    <TooltipProvider>
      <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-[#050506] font-sans">
        <div className="scanline-overlay absolute inset-0 z-10 pointer-events-none" />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        <svg ref={svgRef} className="absolute inset-0 w-full h-full" style={{ background: 'transparent' }} />

        {tooltip.visible && (
          <div className="absolute z-50 pointer-events-none p-3 bg-black/90 border border-bronze/50 rounded-sm backdrop-blur-xl shadow-xl"
            style={{ left: tooltip.x + 20, top: tooltip.y }}>
            <div className="text-[10px] font-mono text-bronze/60 tracking-tighter mb-1">DATA_STREAM::CONNECTED</div>
            <div className="text-sm font-bold text-[#e8e0d5] uppercase tracking-wider mb-0.5">{tooltip.name}</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-widest">{tooltip.game}</div>
          </div>
        )}

        <GraphLegend />
        <FilterPanel filters={filters} onFiltersChange={setFilters} />
        <GraphSettings
          {...physics}
          activeEdgeTypes={activeEdgeTypes}
          onToggleEdgeType={t => setActiveEdgeTypes(prev => {
            const next = new Set(prev);
            if (next.has(t)) next.delete(t); else next.add(t);
            return next;
          })}
          onNodeSpacingChange={v => setPhysics(p => ({ ...p, nodeSpacing: v }))}
          onRepulsionChange={v => setPhysics(p => ({ ...p, repulsion: v }))}
          onCenteringChange={v => setPhysics(p => ({ ...p, centering: v }))}
          onResetLayout={() => setPhysics(DEFAULTS)}
          onResetZoom={() => svgRef.current && zoomRef.current && d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity)}
        />
      </div>
    </TooltipProvider>
  );
}
