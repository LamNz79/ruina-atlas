import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CameraControls, PerspectiveCamera, Stars, Float, Points, PointMaterial } from '@react-three/drei';
import { TooltipProvider } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import * as THREE from 'three';

import { useLoreGraphData } from '../../hooks/useLoreGraphData';
import type { LoreGraphProps } from '../LoreGraph';
import type { GraphNode, PhysicsSettings, FilterState } from '../LoreGraphConstants';
import { DEFAULTS, INITIAL_FILTER_STATE, ALL_EDGE_TYPES } from '../LoreGraphConstants';
import { Node3D } from './Node3D';
import { Edge3D } from './Edge3D';
import { GraphPostProcessing } from './GraphPostProcessing';
import { mapD3To3D } from './LoreGraph3DUtils';

import { FilterPanel } from '../FilterPanel';
import { GraphSettings } from '../GraphSettings';
import GraphLegend from '../GraphLegend';

// Camera manager for cinematic movement
function CameraManager({ focusNode }: { focusNode: GraphNode | null }) {
  const controlsRef = useRef<CameraControls>(null);

  useEffect(() => {
    if (focusNode && controlsRef.current) {
      const [x, y, z] = mapD3To3D(focusNode.x!, focusNode.y!, focusNode);
      const targetPos = new THREE.Vector3(x, y, z);
      
      gsap.to(controlsRef.current.camera.position, {
        x: targetPos.x + 15,
        y: targetPos.y + 15,
        z: targetPos.z + 15,
        duration: 2,
        ease: 'power3.out',
        onUpdate: () => controlsRef.current?.update(0.01)
      });
      
      controlsRef.current.setTarget(targetPos.x, targetPos.y, targetPos.z, true);
    }
  }, [focusNode]);

  return <CameraControls ref={controlsRef} makeDefault minDistance={5} maxDistance={300} />;
}

// Volumetric Nebula effect: Dual Nebulae (Light and Smoke)
function Nebula() {
  const count = 4000;
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      const isLight = i < count / 2;
      
      // Light nebula is concentrated near the core and upper hemisphere
      // Smoke nebula is in the outskirts and lower hemisphere
      const r = isLight ? (50 + Math.random() * 80) : (120 + Math.random() * 150);
      const theta = Math.random() * Math.PI * 2;
      const phi = isLight ? Math.random() * Math.PI * 0.6 : Math.PI * 0.4 + Math.random() * Math.PI * 0.6;
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      if (isLight) {
        // Radiant Gold/White for the Seed of Light
        color.set(Math.random() > 0.3 ? '#f5c518' : '#ffffff');
      } else {
        // Oppressive Greys and Deep Reds for the Smoke
        const smokeRoll = Math.random();
        if (smokeRoll > 0.8) color.set('#b8202f'); // Sinner Red
        else if (smokeRoll > 0.4) color.set('#2a2a2a'); // Ash
        else color.set('#121212'); // Void
      }
      
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors}>
      <PointMaterial
        transparent
        vertexColors
        size={1.2}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.3}
      />
    </Points>
  );
}

// The Seed of Light (Central Star)
function SeedOfLight() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.5, 15]} />
        <meshStandardMaterial 
          color="#f5c518" 
          emissive="#f5c518" 
          emissiveIntensity={2} 
          toneMapped={false}
        />
      </mesh>
      <pointLight intensity={15} distance={150} color="#f5c518" />
      {/* Volumetric glow simulation */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color="#f5c518" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

// Galactic Grid / Ley Lines - Visualizing the Solar System Orbits
function GalacticGrid() {
  // Orbits correspond to: Dante (0), Sinners (45), Literary/Factions (90), Entities (130), Outer (200)
  const orbits = [45, 90, 135, 200]; 
  return (
    <group>
      {orbits.map((r, i) => (
        <mesh key={r} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.2, r + 0.2, 128]} />
          <meshBasicMaterial 
            color={i === 0 ? "#f5c518" : "#a08a70"} 
            transparent 
            opacity={0.08} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      ))}
      <gridHelper args={[400, 40, '#1a1a2e', '#0a0a15']} position={[0, -40, 0]} opacity={0.03} transparent />
    </group>
  );
}

// Position Manager Hook to keep nodes and edges in sync
function useGraphSync(nodes: GraphNode[]) {
  const visualPositions = useRef<Map<string, THREE.Vector3>>(new Map());

  // Priority -1 ensures this runs BEFORE Node3D and Edge3D useFrame hooks (default 0)
  useFrame((state, delta) => {
    // Smoother damping for more celestial movement
    const damping = 1 - Math.exp(-10 * delta); 
    
    nodes.forEach(node => {
      let vPos = visualPositions.current.get(node.id);
      if (!vPos) {
        const [ix, iy, iz] = mapD3To3D(node.x || 0, node.y || 0, node, visualPositions.current);
        vPos = new THREE.Vector3(ix, iy, iz);
        visualPositions.current.set(node.id, vPos);
      }

      if (node.x !== undefined && node.y !== undefined) {
        const [tx, ty, tz] = mapD3To3D(node.x, node.y, node, visualPositions.current);
        
        // Stabilize positions by lerping to exact target
        // Drift is now handled in Node3D to prevent link jitter
        vPos.x += (tx - vPos.x) * damping;
        vPos.y += (ty - vPos.y) * damping;
        vPos.z += (tz - vPos.z) * damping;
      }
    });
  }, -1);

  return visualPositions;
}


// Wrapper component to provide R3F context to useGraphSync
function LoreGraph3DScene({ 
  graphData, 
  hoverId, 
  selectedSinner, 
  selectedEntity, 
  setHoverId, 
  onNodeClick, 
  onEntityClick, 
  onSourceClick,
  sinners
}: {
  graphData: any;
  hoverId: string | null;
  selectedSinner: any;
  selectedEntity: string | null;
  setHoverId: (id: string | null) => void;
  onNodeClick: (sinner: any) => void;
  onEntityClick: (id: string) => void;
  onSourceClick: (id: string) => void;
  sinners: any[];
}) {
  const visualPositions = useGraphSync(graphData.nodes);
  const sceneGroupRef = useRef<THREE.Group>(null);

  const focusedNode = useMemo(() => {
    const id = selectedSinner?.id || selectedEntity;
    return id ? graphData.nodes.find((n: any) => n.id === id) || null : null;
  }, [selectedSinner, selectedEntity, graphData.nodes]);

  return (
    <>
      <CameraManager focusNode={focusedNode} />
      <group ref={sceneGroupRef}>
        <SeedOfLight />
        <Nebula />
        <GalacticGrid />
        
        {graphData.links.map((link: any, i: number) => (
          <Edge3D 
            key={`edge-${i}-${link.source.id || link.source}-${link.target.id || link.target}`} 
            link={link} 
            nodesMap={new Map(graphData.nodes.map((n: any) => [n.id, n]))} 
            visualPositions={visualPositions}
            activeId={hoverId} 
          />
        ))}
        
        {graphData.nodes.map((node: any) => (
          <Node3D 
            key={node.id} 
            node={node} 
            visualPositions={visualPositions}
            isHovered={hoverId === node.id}
            isSelected={(selectedSinner?.id === node.id) || (selectedEntity === node.id)}
            onPointerOver={() => setHoverId(node.id)}
            onPointerOut={() => setHoverId(null)}
            onClick={() => {
              if (node.nodeType === 'sinner') onNodeClick(sinners.find((s: any) => s.id === node.id)!);
              else if (node.nodeType === 'literary-source') onSourceClick(node.id.replace('lit-', ''));
              else onEntityClick(node.id);
            }}
          />
        ))}
      </group>
      <GraphPostProcessing />
    </>
  );
}

export function LoreGraph3D({
  sinners,
  edges,
  selectedSinner,
  selectedEntity,
  expandedNodeIds,
  onNodeClick,
  onEntityClick,
  onSourceClick,
}: LoreGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const nodesRef = useRef<Map<string, GraphNode>>(new Map());

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [physics, setPhysics] = useState<PhysicsSettings>(DEFAULTS);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Set<any>>(new Set(ALL_EDGE_TYPES.filter(t => t !== 'thematic-link')));

  const graphData = useLoreGraphData(sinners, edges, expandedNodeIds, filters, activeEdgeTypes);

  useEffect(() => {
    const worker = new Worker(new URL('../loreGraphWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    worker.onmessage = (event) => {
      const { type, nodes: workerNodes } = event.data;
      if (type === 'tick') {
        workerNodes.forEach((n: any) => {
          const local = nodesRef.current.get(n.id);
          if (local) { local.x = n.x; local.y = n.y; }
        });
      }
    };
    worker.postMessage({ type: 'init', data: { physics } });
    return () => worker.terminate();
  }, []);

  useEffect(() => {
    if (workerRef.current) {
      nodesRef.current = new Map(graphData.nodes.map(n => [n.id, n]));
      workerRef.current.postMessage({ type: 'updateData', data: { nodes: graphData.nodes, links: graphData.links } });
    }
  }, [graphData]);

  return (
    <TooltipProvider>
      <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-[#020204]">
        <Canvas shadows gl={{ antialias: true, alpha: true }}>
          <color attach="background" args={['#020204']} />
          <PerspectiveCamera makeDefault position={[50, 50, 100]} fov={45} />
          
          <ambientLight intensity={0.2} />
          <pointLight position={[50, 50, 50]} intensity={1} color="#b8202f" />
          <pointLight position={[-50, -50, -50]} intensity={1} color="#4a3b2b" />
          
          <Stars radius={200} depth={100} count={10000} factor={6} saturation={0} fade speed={1.5} />
          
          <Suspense fallback={null}>
            <LoreGraph3DScene 
              graphData={graphData}
              hoverId={hoverId}
              selectedSinner={selectedSinner}
              selectedEntity={selectedEntity}
              setHoverId={setHoverId}
              onNodeClick={onNodeClick}
              onEntityClick={onEntityClick}
              onSourceClick={onSourceClick}
              sinners={sinners}
            />
          </Suspense>
        </Canvas>

        {/* UI Overlays */}
        <AnimatePresence mode="wait">
          <motion.div 
            key="filter-panel"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-0 top-0 h-full z-20 pointer-events-none"
          >
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
          </motion.div>
          
          <motion.div 
            key="graph-legend"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 w-full z-20 pointer-events-none"
          >
             <GraphLegend />
          </motion.div>
        </AnimatePresence>

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
          onResetZoom={() => {}}
        />
      </div>
    </TooltipProvider>
  );
}

