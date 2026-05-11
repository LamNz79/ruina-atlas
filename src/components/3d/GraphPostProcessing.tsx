import { EffectComposer, Bloom, Noise, Vignette, Scanline, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

export function GraphPostProcessing() {
  return (
    <EffectComposer>
      <Bloom 
        intensity={1.5} 
        luminanceThreshold={0.3} 
        luminanceSmoothing={0.9} 
        mipmapBlur 
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0015, 0.0015)}
      />
      <Scanline opacity={0.1} density={1.5} />
      <Noise opacity={0.08} />
      <Vignette eskil={false} offset={0.05} darkness={1.2} />
    </EffectComposer>
  );
}
