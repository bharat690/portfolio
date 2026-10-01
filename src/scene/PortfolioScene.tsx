import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { artifacts, type ArtifactId } from '../data/portfolio';
import { Character } from './character/Character';
import { ArtifactItem } from './artifacts/ArtifactItem';
import { Environment } from './Environment';

interface PortfolioSceneProps {
  hoveredArtifact: ArtifactId | null;
  selectedArtifact: ArtifactId | null;
  onHoverArtifact: (id: ArtifactId | null) => void;
  onSelectArtifact: (id: ArtifactId) => void;
  reducedMotion: boolean;
}

function SceneContents(props: PortfolioSceneProps) {
  const { camera, pointer, size } = useThree();
  const cameraTarget = useRef(new THREE.Vector3(0, 0.05, 0));
  const compact = size.width < 640;
  const positionedArtifacts = useMemo(
    () => artifacts.map((item) => compact
      ? {
          ...item,
          position: item.id === 'medal' ? [2.1, 1.75, -0.48] as [number, number, number]
            : item.id === 'badge' ? [-2.1, -1.15, 0.3] as [number, number, number]
              : item.id === 'radio' ? [2.1, 0.62, 0.28] as [number, number, number]
                : item.id === 'magazine' ? [2.1, -1.5, -0.7] as [number, number, number]
                  : [2.1, -0.4, 0.45] as [number, number, number],
          rotation: item.id === 'knife' ? [0, -0.08, 1.48] as [number, number, number] : item.rotation,
        }
      : item),
    [compact],
  );
  const focusArtifact = useMemo(
    () => positionedArtifacts.find((item) => item.id === (props.selectedArtifact ?? props.hoveredArtifact)),
    [positionedArtifacts, props.selectedArtifact, props.hoveredArtifact],
  );
  const selectedArtifact = props.selectedArtifact
    ? positionedArtifacts.find((item) => item.id === props.selectedArtifact)
    : null;
  const attentionTarget: [number, number, number] | null = focusArtifact
    ? [...focusArtifact.position]
    : null;

  useFrame((_, delta) => {
    const motion = props.reducedMotion ? 0.14 : 1;
    const frameDelta = Math.min(delta, 1 / 30);
    const cameraDistance = (compact ? 12 : 9) - (selectedArtifact ? 0.12 : 0);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraDistance, 2, frameDelta);
    const artifactWeight = (selectedArtifact ? 0.045 : focusArtifact ? 0.025 : 0) * motion;
    const targetX = focusArtifact
      ? focusArtifact.position[0] * artifactWeight
      : pointer.x * 0.11 * motion;
    const targetY = focusArtifact
      ? focusArtifact.position[1] * artifactWeight
      : pointer.y * 0.055 * motion;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 1.7, frameDelta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.25 + targetY, 1.7, frameDelta);
    cameraTarget.current.set(targetX * 0.32, targetY, 0);
    camera.lookAt(cameraTarget.current);

  });

  return (
    <>
      <Environment reducedMotion={props.reducedMotion} compact={compact} />
      <Character attentionTarget={attentionTarget} reducedMotion={props.reducedMotion} compact={compact} />
      {positionedArtifacts.map((artifact) => (
        <ArtifactItem
          key={artifact.id}
          artifact={artifact}
          hovered={!props.selectedArtifact && props.hoveredArtifact === artifact.id}
          selected={props.selectedArtifact === artifact.id}
          reducedMotion={props.reducedMotion}
          onHover={props.onHoverArtifact}
          onSelect={props.onSelectArtifact}
        />
      ))}
    </>
  );
}

export function PortfolioScene(props: PortfolioSceneProps) {
  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.25]}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.25, 9], fov: 36, near: 0.1, far: 30 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Suspense fallback={null}>
          <SceneContents {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
