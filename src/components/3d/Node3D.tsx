import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as animejs from 'animejs';
const { animate } = animejs as any;
import type { GraphNode } from '../LoreGraphConstants';
import { NODE_GAME_COLORS, ENTITY_COLORS } from '../LoreGraphConstants';
import { mapD3To3D, getNodeScale } from './LoreGraph3DUtils';

interface Node3DProps {
  node: GraphNode;
  visualPositions: React.MutableRefObject<Map<string, THREE.Vector3>>;
  isHovered: boolean;
  isSelected: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}

export function Node3D({ node, visualPositions, isHovered, isSelected, onPointerOver, onPointerOut, onClick }: Node3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Determine geometry based on node type
  const geometry = useMemo(() => {
    if (node.id === 'dante') return new THREE.IcosahedronGeometry(0.8, 2);
    if (node.nodeType === 'sinner') return new THREE.SphereGeometry(0.6, 32, 32);
    if (node.entityType === 'wing') return new THREE.DodecahedronGeometry(0.7);
    if (node.nodeType === 'literary-source') return new THREE.OctahedronGeometry(0.5);
    return new THREE.SphereGeometry(0.5, 16, 16);
  }, [node]);

  const baseScaleValue = useMemo(() => getNodeScale(node), [node]);

  // Animate on hover/select
  useEffect(() => {
    if (groupRef.current) {
      animate(groupRef.current.scale, {
        x: (isSelected ? 1.5 : isHovered ? 1.2 : 1) * baseScaleValue,
        y: (isSelected ? 1.5 : isHovered ? 1.2 : 1) * baseScaleValue,
        z: (isSelected ? 1.5 : isHovered ? 1.2 : 1) * baseScaleValue,
        duration: 400,
        easing: 'easeOutElastic(1, .8)'
      });
    }
  }, [isHovered, isSelected, baseScaleValue]);

  useFrame((state) => {
    if (groupRef.current) {
      const vPos = visualPositions.current.get(node.id);
      if (vPos) {
        groupRef.current.position.copy(vPos);
      }
      
      const time = state.clock.elapsedTime;
      const idHash = node.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Apply celestial "drift" to the visual mesh layer only
      // This keeps the link anchor (groupRef) stable while the node "breathes"
      if (meshRef.current) {
        meshRef.current.position.y = Math.sin(time * 0.4 + idHash) * 0.15;
        meshRef.current.position.x = Math.cos(time * 0.2 + idHash) * 0.08;
        
        meshRef.current.rotation.y += 0.005;
        meshRef.current.rotation.z += 0.002;
      }

      // Ring rotation if exists
      if (ringRef.current) {
        ringRef.current.rotation.z += 0.01;
      }
    }
  });



  const color = useMemo(() => {
    if (node.nodeType === 'sinner') return NODE_GAME_COLORS[node.canonicalGame] || '#b8202f';
    return ENTITY_COLORS[node.entityType || 'character'] || '#a08a70';
  }, [node]);

  const isMajorFaction = node.entityType === 'wing' || node.entityType === 'association';

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onClick={onClick}
      >
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={isHovered || isSelected ? 1.5 : 0.4}
          metalness={0.9}
          roughness={0.1}
          wireframe={node.nodeType === 'literary-source'}
        />
      </mesh>
      
      {/* Planetary Rings for Wings/Factions */}
      {isMajorFaction && (
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.1, 0.015, 16, 100]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}

      {/* Node Name */}
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.25}
        color="#e8e0d5"
        anchorX="center"
        anchorY="top"
        visible={isHovered || isSelected}
      >
        {node.name.toUpperCase()}
      </Text>

      {/* Selection Aura */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[1.3, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.05} wireframe />
        </mesh>
      )}
    </group>
  );
}

