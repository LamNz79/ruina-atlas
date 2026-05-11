import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { GraphLink, GraphNode } from '../LoreGraphConstants';
import { EDGE_COLORS } from '../LoreGraphConstants';
import { mapD3To3D } from './LoreGraph3DUtils';

interface Edge3DProps {
  link: GraphLink;
  nodesMap: Map<string, GraphNode>;
  visualPositions: React.MutableRefObject<Map<string, THREE.Vector3>>;
  activeId: string | null;
}

export function Edge3D({ link, nodesMap, visualPositions, activeId }: Edge3DProps) {
  const lineRef = useRef<THREE.Line>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  const color = useMemo(() => EDGE_COLORS[link.type] || '#a08a70', [link.type]);

  // Persistent position array to avoid re-allocations
  const positions = useMemo(() => new Float32Array(6), []);

  useFrame(() => {
    if (!geometryRef.current) return;

    const sId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const tId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    
    const vPosS = visualPositions.current.get(sId);
    const vPosT = visualPositions.current.get(tId);

    if (vPosS && vPosT) {
      // Update values in the existing array
      positions[0] = vPosS.x; positions[1] = vPosS.y; positions[2] = vPosS.z;
      positions[3] = vPosT.x; positions[4] = vPosT.y; positions[5] = vPosT.z;
      
      // Ensure the attribute exists and update it
      let posAttr = geometryRef.current.getAttribute('position') as THREE.BufferAttribute;
      if (!posAttr) {
        posAttr = new THREE.BufferAttribute(positions, 3);
        geometryRef.current.setAttribute('position', posAttr);
      } else {
        posAttr.needsUpdate = true;
      }
      
      // Update bounding sphere to prevent frustum culling
      geometryRef.current.computeBoundingSphere();
      
      if (lineRef.current) {
        lineRef.current.visible = true;
      }
    } else {
      if (lineRef.current) {
        lineRef.current.visible = false;
      }
    }
  });




  const isConnected = useMemo(() => {
    const sId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const tId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return activeId === sId || activeId === tId;
  }, [link, activeId]);

  return (
    <line ref={lineRef as any}>
      <bufferGeometry ref={geometryRef} />
      <lineBasicMaterial 
        color={color} 
        transparent 
        opacity={isConnected ? 0.9 : activeId ? 0.02 : 0.15} 
        linewidth={isConnected ? 3 : 1}
        depthWrite={false}
      />
    </line>
  );
}
