import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Artifact } from '../../data/portfolio';
import { ArtifactModel } from './ArtifactModel';

interface ArtifactItemProps {
  artifact: Artifact;
  hovered: boolean;
  selected: boolean;
  reducedMotion: boolean;
  onHover: (id: Artifact['id'] | null) => void;
  onSelect: (id: Artifact['id']) => void;
}

export function ArtifactItem({ artifact, hovered, selected, reducedMotion, onHover, onSelect }: ArtifactItemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const initialY = artifact.position[1];

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const focus = hovered || selected;
    const targetScale = focus ? 1.08 : 1;
    const drift = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.65 + artifact.position[0] * 1.9) * 0.035;
    groupRef.current.scale.setScalar(THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 6, delta));
    groupRef.current.position.y = initialY + drift;
    groupRef.current.position.z = artifact.position[2] + (focus ? 0.16 : 0);
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      artifact.rotation[1] + (focus ? 0.12 : 0),
      4,
      delta,
    );
    if (ringRef.current) {
      ringRef.current.visible = focus;
      ringRef.current.rotation.z += reducedMotion ? 0 : delta * 0.08;
    }
  });

  return (
    <group
      ref={groupRef}
      position={artifact.position}
      rotation={artifact.rotation}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover(artifact.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        onHover(null);
        document.body.style.cursor = '';
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(artifact.id);
      }}
    >
      <group scale={artifact.id === 'magazine' ? 0.72 : artifact.id === 'knife' ? 0.75 : 0.86}>
        <ArtifactModel id={artifact.id} />
      </group>
      <mesh ref={ringRef} position={[0, 0, -0.13]} visible={false}>
        <ringGeometry args={[0.41, 0.425, 40]} />
        <meshBasicMaterial color="#b31313" transparent opacity={0.78} side={THREE.DoubleSide} />
      </mesh>
      {(hovered || selected) && <pointLight position={[0, 0, 0.5]} color="#9e1111" intensity={0.32} distance={1.8} />}
    </group>
  );
}
