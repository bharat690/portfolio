import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterProps {
  focus: [number, number] | null;
  reducedMotion: boolean;
  compact: boolean;
}

const sourceScale = 0.00435;
const portraitCenter = new THREE.Vector2(448, 600);

function PortraitLayer({
  texture,
  width,
  height,
  x,
  y,
  z,
  order,
}: {
  texture: THREE.Texture;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  order: number;
}) {
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.015,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  }), [texture]);

  return (
    <mesh
      position={[x, y, z]}
      renderOrder={order}
      material={material}
      castShadow={false}
      receiveShadow={false}
    >
      <planeGeometry args={[width * sourceScale, height * sourceScale]} />
    </mesh>
  );
}

export function Character({ focus, reducedMotion, compact }: CharacterProps) {
  const [headTexture, bodyTexture] = useLoader(THREE.TextureLoader, [
    '/character/bharat-head.png',
    '/character/bharat-upper-body.png',
  ]);
  const { gl, pointer } = useThree();
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 8);
    for (const texture of [headTexture, bodyTexture]) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = anisotropy;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
    }
  }, [bodyTexture, gl, headTexture]);

  const dimensions = compact
    ? { unit: 0.004, depth: 0.16 }
    : { unit: sourceScale, depth: 0.12 };

  useFrame((state, delta) => {
    const body = bodyRef.current;
    const head = headRef.current;
    if (!body || !head) return;

    const targetX = THREE.MathUtils.clamp(focus?.[0] ?? pointer.x, -1, 1);
    const targetY = THREE.MathUtils.clamp(focus?.[1] ?? pointer.y, -1, 1);
    const movement = reducedMotion ? 0.3 : 1;
    const breathing = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.006;

    body.position.y = -0.04 + breathing;
    body.rotation.y = THREE.MathUtils.damp(body.rotation.y, targetX * 0.018 * movement, 3, delta);
    body.rotation.x = THREE.MathUtils.damp(body.rotation.x, -targetY * 0.009 * movement, 3, delta);

    head.rotation.y = THREE.MathUtils.damp(head.rotation.y, targetX * 0.115 * movement, 5, delta);
    head.rotation.x = THREE.MathUtils.damp(head.rotation.x, -targetY * 0.065 * movement, 5, delta);

    if (eyesRef.current) {
      eyesRef.current.position.x = THREE.MathUtils.damp(eyesRef.current.position.x, targetX * 0.024 * movement, 9, delta);
      eyesRef.current.position.y = THREE.MathUtils.damp(eyesRef.current.position.y, targetY * 0.018 * movement, 9, delta);
    }
  });

  const scaleRatio = dimensions.unit / sourceScale;
  const headX = (452.5 - portraitCenter.x) * sourceScale;
  const headY = (portraitCenter.y - 330) * sourceScale;
  const bodyY = (portraitCenter.y - 877.5) * sourceScale;

  return (
    <group scale={scaleRatio}>
      <group ref={bodyRef} position={[0, -0.04, 0]}>
        <PortraitLayer
          texture={bodyTexture}
          width={896}
          height={645}
          x={0}
          y={bodyY}
          z={dimensions.depth}
          order={1}
        />
      </group>
      <group ref={headRef} position={[headX, headY - 0.04, dimensions.depth + 0.018]}>
        <PortraitLayer
          texture={headTexture}
          width={515}
          height={660}
          x={0}
          y={0}
          z={0}
          order={2}
        />
        <group ref={eyesRef} position={[0, 0, 0.035]}>
          {[-0.18, 0.30].map((x) => (
            <group key={x} position={[x, -0.17, 0]}>
              <mesh scale={[1, 1, 0.42]}>
                <sphereGeometry args={[0.023, 14, 10]} />
                <meshStandardMaterial color="#10100e" roughness={0.22} metalness={0.12} />
              </mesh>
              <mesh position={[-0.006, 0.009, 0.019]}>
                <sphereGeometry args={[0.0035, 8, 6]} />
                <meshBasicMaterial color="#c9c2b3" />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}
