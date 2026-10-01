import { useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
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
  const modelRef = useRef<THREE.Group>(null);
  const focusLightRef = useRef<THREE.PointLight>(null);
  const { camera } = useThree();
  const highlightMaterials = useRef<Array<{
    material: THREE.MeshStandardMaterial;
    base: THREE.Color;
    intensity: number;
  }>>([]);
  const towardCamera = useRef(new THREE.Vector3());
  const highlightColor = useRef(new THREE.Color('#3b0909'));
  const highlightAmount = useRef(0);
  const colliderRadius = {
    medal: 0.35,
    badge: 0.36,
    radio: 0.37,
    magazine: 0.39,
    knife: 0.43,
  }[artifact.id];
  const initialY = artifact.position[1];
  const baseRotation = artifact.rotation;

  useLayoutEffect(() => {
    if (!modelRef.current) return;
    const entries: typeof highlightMaterials.current = [];
    modelRef.current.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (!(material instanceof THREE.MeshStandardMaterial)) continue;
        if (entries.some((entry) => entry.material === material)) continue;
        entries.push({
          material,
          base: material.emissive.clone(),
          intensity: material.emissiveIntensity,
        });
      }
    });
    highlightMaterials.current = entries;
    return () => {
      for (const entry of entries) {
        entry.material.emissive.copy(entry.base);
        entry.material.emissiveIntensity = entry.intensity;
      }
    };
  }, [artifact.id]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const frameDelta = Math.min(delta, 1 / 30);
    const focused = hovered || selected;
    const targetScale = selected ? 1.075 : hovered ? 1.035 : 1;
    const idle = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.54 + artifact.position[0] * 1.7) * 0.012;

    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, targetScale, 5, frameDelta));
    group.position.y = initialY + (reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.46 + artifact.position[0]) * 0.014);
    group.position.z = THREE.MathUtils.damp(
      group.position.z,
      artifact.position[2] + (selected ? 0.2 : hovered ? 0.11 : 0),
      4,
      frameDelta,
    );
    camera.updateMatrixWorld();
    group.updateWorldMatrix(true, false);
    towardCamera.current.setFromMatrixPosition(camera.matrixWorld).sub(group.position).normalize();
    const faceYaw = THREE.MathUtils.clamp(Math.atan2(towardCamera.current.x, towardCamera.current.z), -0.16, 0.16);
    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      baseRotation[0] + (focused ? -0.035 : idle * 0.4),
      3,
      frameDelta,
    );
    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      baseRotation[1] + (focused ? faceYaw : idle),
      3,
      frameDelta,
    );
    group.rotation.z = THREE.MathUtils.damp(
      group.rotation.z,
      baseRotation[2] + (reducedMotion ? 0 : idle * 0.45),
      3,
      frameDelta,
    );

    const targetHighlight = selected ? 0.46 : hovered ? 0.28 : 0;
    highlightAmount.current = THREE.MathUtils.damp(highlightAmount.current, targetHighlight, 5, delta);
    if (focusLightRef.current) {
      focusLightRef.current.intensity = THREE.MathUtils.damp(
        focusLightRef.current.intensity,
        selected ? 1.1 : hovered ? 0.82 : 0.34,
        5,
        delta,
      );
    }
    for (const entry of highlightMaterials.current) {
      entry.material.emissive.copy(entry.base).lerp(highlightColor.current, highlightAmount.current);
      entry.material.emissiveIntensity = entry.intensity;
    }
  });

  return (
    <group
      ref={groupRef}
      name={`artifact-${artifact.id}`}
      userData={{ artifactId: artifact.id }}
      position={artifact.position}
      rotation={artifact.rotation}
    >
      <group
        ref={modelRef}
        scale={artifact.id === 'magazine' ? 0.72 : artifact.id === 'knife' ? 0.75 : 0.86}
      >
        <ArtifactModel id={artifact.id} />
      </group>
      <mesh
        name={`artifact-hit-${artifact.id}`}
        userData={{ artifactId: artifact.id }}
        onPointerEnter={(event) => {
          event.stopPropagation();
          onHover(artifact.id);
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          onHover(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(artifact.id);
        }}
      >
        <sphereGeometry args={[colliderRadius, 16, 12]} />
        <meshBasicMaterial
          colorWrite={false}
          depthWrite={false}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight
        ref={focusLightRef}
        position={[0, 0.12, 0.46]}
        color="#c9c3b7"
        intensity={0.34}
        distance={1.9}
        decay={2}
      />
    </group>
  );
}
