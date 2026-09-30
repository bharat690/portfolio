import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { portraitContours } from './portraitContours';

interface CharacterProps {
  focus: [number, number] | null;
  reducedMotion: boolean;
  compact: boolean;
}

type ReliefProfile = 'head' | 'body';

const sourceScale = 0.00435;
const portraitCenter = new THREE.Vector2(448, 600);
const pupilGeometry = new THREE.SphereGeometry(0.023, 20, 14);
const pupilMaterial = new THREE.MeshPhysicalMaterial({
  color: '#0a0908',
  roughness: 0.19,
  metalness: 0.08,
  clearcoat: 0.7,
  clearcoatRoughness: 0.12,
});
const pupilGlintGeometry = new THREE.SphereGeometry(0.0035, 10, 8);
const pupilGlintMaterial = new THREE.MeshBasicMaterial({ color: '#c9c2b3' });
const bustMaterial = new THREE.MeshStandardMaterial({
  color: '#090a0a',
  roughness: 0.8,
  metalness: 0.06,
});

function gaussian(value: number, center: number, spread: number): number {
  const distance = (value - center) / spread;
  return Math.exp(-0.5 * distance * distance);
}

function createReliefGeometry(width: number, height: number, profile: ReliefProfile): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(
    width * sourceScale,
    height * sourceScale,
    profile === 'head' ? 80 : 100,
    profile === 'head' ? 104 : 72,
  );
  const positions = geometry.attributes.position;
  const uv = geometry.attributes.uv;

  for (let index = 0; index < positions.count; index += 1) {
    const u = uv.getX(index);
    const imageY = (1 - uv.getY(index)) * height;
    const nx = (u - 0.5) * 2;
    const sideRound = Math.sqrt(Math.max(0, 1 - nx * nx * 0.78));
    let depth: number;

    if (profile === 'head') {
      const ny = (imageY / height - 0.5) * 2;
      const helmet = (
        gaussian(u, 0.29, 0.15) + gaussian(u, 0.7, 0.15)
      ) * gaussian(imageY, 73, 58) * 0.1;
      const cheeks = gaussian(u, 0.51, 0.23) * gaussian(imageY, 393, 158) * 0.13;
      const nose = gaussian(u, 0.52, 0.044) * gaussian(imageY, 383, 60) * 0.19;
      const brow = gaussian(u, 0.52, 0.2) * gaussian(imageY, 297, 32) * 0.045;
      const sockets = (
        gaussian(u, 0.42, 0.045) + gaussian(u, 0.64, 0.045)
      ) * gaussian(imageY, 366, 25) * 0.045;
      depth = 0.21 * sideRound * (1 - 0.12 * ny * ny) + helmet + cheeks + nose + brow - sockets;
    } else {
      const upperChest = gaussian(imageY, 180, 240);
      const vestPanels = (
        gaussian(u, 0.37, 0.075) + gaussian(u, 0.65, 0.075)
      ) * (
        gaussian(imageY, 285, 66) + gaussian(imageY, 398, 55)
      ) * 0.055;
      const centerPlate = gaussian(u, 0.51, 0.25) * gaussian(imageY, 300, 245) * 0.075;
      depth = 0.26 * sideRound * (0.74 + 0.26 * upperChest) + vestPanels + centerPlate;
    }

    positions.setZ(index, depth);
  }

  geometry.computeVertexNormals();
  return geometry;
}

function createBustShell(profile: ReliefProfile): THREE.BufferGeometry {
  const silhouette = portraitContours[profile];
  const shape = new THREE.Shape();

  silhouette.points.forEach(([pixelX, pixelY], index) => {
    const x = (pixelX - silhouette.width / 2) * sourceScale;
    const y = (silhouette.height / 2 - pixelY) * sourceScale;
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: profile === 'head' ? 0.24 : 0.2,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.01,
    bevelThickness: 0.012,
  });
}

function PortraitLayer({
  texture,
  width,
  height,
  x,
  y,
  z,
  order,
  profile,
}: {
  texture: THREE.Texture;
  width: number;
  height: number;
  x: number;
  y: number;
  z: number;
  order: number;
  profile: ReliefProfile;
}) {
  const geometry = useMemo(() => createReliefGeometry(width, height, profile), [height, profile, width]);
  const bust = useMemo(() => createBustShell(profile), [profile]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.015,
    depthWrite: false,
    side: THREE.DoubleSide,
    roughness: 0.94,
    metalness: 0.02,
    bumpMap: texture,
    bumpScale: profile === 'head' ? 0.003 : 0.002,
  }), [profile, texture]);

  return (
    <>
      <mesh
        position={[x, y, z - (profile === 'head' ? 0.34 : 0.24)]}
        renderOrder={order - 1}
        geometry={bust}
        material={bustMaterial}
        castShadow
        receiveShadow
      />
      <mesh
        position={[x, y, z]}
        renderOrder={order}
        material={material}
        geometry={geometry}
        castShadow={false}
        receiveShadow={false}
      />
    </>
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

    head.rotation.y = THREE.MathUtils.damp(head.rotation.y, targetX * 0.23 * movement, 5, delta);
    head.rotation.x = THREE.MathUtils.damp(head.rotation.x, -targetY * 0.105 * movement, 5, delta);

    if (eyesRef.current) {
      eyesRef.current.position.x = THREE.MathUtils.damp(eyesRef.current.position.x, targetX * 0.035 * movement, 9, delta);
      eyesRef.current.position.y = THREE.MathUtils.damp(eyesRef.current.position.y, targetY * 0.027 * movement, 9, delta);
    }
  });

  const scaleRatio = dimensions.unit / sourceScale;
  const headX = (452.5 - portraitCenter.x) * sourceScale;
  const headY = (portraitCenter.y - 330) * sourceScale;
  const bodyY = (portraitCenter.y - 877.5) * sourceScale;

  return (
    <group scale={scaleRatio}>
      <group ref={bodyRef} name="bharat-upper-body" position={[0, -0.04, 0]}>
        <PortraitLayer
          texture={bodyTexture}
          width={896}
          height={645}
          x={0}
          y={bodyY}
          z={dimensions.depth}
          order={1}
          profile="body"
        />
      </group>
      <group ref={headRef} name="bharat-head" position={[headX, headY - 0.04, dimensions.depth + 0.018]}>
        <PortraitLayer
          texture={headTexture}
          width={515}
          height={660}
          x={0}
          y={0}
          z={0}
          order={2}
          profile="head"
        />
        <group ref={eyesRef} name="bharat-eyes" position={[0, 0, 0.31]}>
          {[-0.18, 0.30].map((x) => (
            <group key={x} position={[x, -0.17, 0]}>
              <mesh geometry={pupilGeometry} material={pupilMaterial} scale={[1, 1, 0.42]} />
              <mesh geometry={pupilGlintGeometry} material={pupilGlintMaterial} position={[-0.006, 0.009, 0.019]} />
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}
