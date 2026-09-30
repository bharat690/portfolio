import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { portraitContours } from './portraitContours';

interface CharacterProps {
  attentionTarget: [number, number, number] | null;
  reducedMotion: boolean;
  compact: boolean;
}

type ReliefProfile = 'head' | 'body';

const sourceScale = 0.00435;
const portraitCenter = new THREE.Vector2(448, 600);
const cursorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.5);
const headPivotSourceY = 520;
const headPivotY = (portraitCenter.y - headPivotSourceY) * sourceScale;
const neckBaseY = 0.045;
const neckBaseZ = 0.43;
const neckRadialSegments = 24;
const neckLengthSegments = 18;
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
const neckMaterial = new THREE.MeshStandardMaterial({
  color: '#111211',
  roughness: 0.98,
  metalness: 0.02,
  side: THREE.DoubleSide,
});
const neckCollarMaterial = new THREE.MeshStandardMaterial({
  color: '#22231f',
  roughness: 0.9,
  metalness: 0.08,
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

function createNeckGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const ringCount = neckLengthSegments + 1;
  const positions = new Float32Array(ringCount * neckRadialSegments * 3);
  const indices: number[] = [];

  for (let ring = 0; ring < neckLengthSegments; ring += 1) {
    for (let side = 0; side < neckRadialSegments; side += 1) {
      const start = ring * neckRadialSegments + side;
      const nextRing = start + neckRadialSegments;
      const nextSide = ring * neckRadialSegments + ((side + 1) % neckRadialSegments);
      const nextRingSide = (ring + 1) * neckRadialSegments + ((side + 1) % neckRadialSegments);
      indices.push(start, nextRing, nextSide, nextRing, nextRingSide, nextSide);
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

function deformNeck(geometry: THREE.BufferGeometry, base: THREE.Vector3, top: THREE.Vector3): void {
  const positions = geometry.attributes.position as THREE.BufferAttribute;

  for (let ring = 0; ring <= neckLengthSegments; ring += 1) {
    const t = ring / neckLengthSegments;
    const oneMinusT = 1 - t;
    const centerX = oneMinusT * oneMinusT * oneMinusT * base.x
      + 3 * oneMinusT * oneMinusT * t * (base.x)
      + 3 * oneMinusT * t * t * (top.x)
      + t * t * t * top.x;
    const centerY = oneMinusT * oneMinusT * oneMinusT * base.y
      + 3 * oneMinusT * oneMinusT * t * (base.y + 0.12)
      + 3 * oneMinusT * t * t * (top.y - 0.08)
      + t * t * t * top.y;
    const centerZ = oneMinusT * oneMinusT * oneMinusT * base.z
      + 3 * oneMinusT * oneMinusT * t * (base.z - 0.015)
      + 3 * oneMinusT * t * t * (top.z - 0.025)
      + t * t * t * top.z;
    const endTaper = 0.9 + Math.sin(Math.PI * t) * 0.1;
    const pleat = 1 + Math.cos(t * Math.PI * 12) * Math.sin(Math.PI * t) * 0.018;
    const radiusX = (0.19 + t * 0.025) * endTaper * pleat;
    const radiusZ = (0.15 + t * 0.025) * endTaper * pleat;

    for (let side = 0; side < neckRadialSegments; side += 1) {
      const angle = (side / neckRadialSegments) * Math.PI * 2;
      const vertex = ring * neckRadialSegments + side;
      positions.setXYZ(
        vertex,
        centerX + Math.cos(angle) * radiusX,
        centerY,
        centerZ + Math.sin(angle) * radiusZ,
      );
    }
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
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

export function Character({ attentionTarget, reducedMotion, compact }: CharacterProps) {
  const [headTexture, bodyTexture] = useLoader(THREE.TextureLoader, [
    '/character/bharat-head.png',
    '/character/bharat-upper-body.png',
  ]);
  const { gl, pointer, camera, raycaster } = useThree();
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const neckRef = useRef<THREE.Mesh>(null);
  const neckGeometry = useMemo(createNeckGeometry, []);
  const neckTopRef = useRef(new THREE.Vector3());
  const neckTopOffsetRef = useRef(new THREE.Vector3(0, -0.06, 0.22));
  const neckOffsetScratchRef = useRef(new THREE.Vector3());
  const neckEulerRef = useRef(new THREE.Euler());
  const neckPoseRef = useRef(new THREE.Vector2());
  const neckBaseRef = useRef(new THREE.Vector3(0, neckBaseY, neckBaseZ));
  const worldTargetRef = useRef(new THREE.Vector3());
  const localTargetRef = useRef(new THREE.Vector3());

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

    const movement = reducedMotion ? 0.3 : 1;
    const breathing = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.006;
    const idleSway = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.31) * 0.012;
    raycaster.setFromCamera(pointer, camera);
    const cursorPoint = raycaster.ray.intersectPlane(cursorPlane, worldTargetRef.current);

    if (attentionTarget) {
      worldTargetRef.current.set(...attentionTarget);
    } else if (!cursorPoint) {
      worldTargetRef.current.set(0, 0.5, 3);
    }

    body.position.y = -0.04 + breathing;
    head.updateWorldMatrix(true, false);
    localTargetRef.current.copy(worldTargetRef.current);
    head.worldToLocal(localTargetRef.current);
    const targetYaw = Math.atan2(localTargetRef.current.x, localTargetRef.current.z);
    const targetPitch = Math.atan2(
      localTargetRef.current.y,
      Math.hypot(localTargetRef.current.x, localTargetRef.current.z),
    );

    body.rotation.y = THREE.MathUtils.damp(
      body.rotation.y,
      THREE.MathUtils.clamp(targetYaw * 0.018, -0.012, 0.012) * movement,
      2,
      delta,
    );
    body.rotation.x = THREE.MathUtils.damp(
      body.rotation.x,
      THREE.MathUtils.clamp(-targetPitch * 0.012, -0.008, 0.008) * movement,
      2,
      delta,
    );

    head.rotation.y = THREE.MathUtils.damp(
      head.rotation.y,
      THREE.MathUtils.clamp(targetYaw * 0.62, -0.3, 0.3) * movement + idleSway,
      4.5,
      delta,
    );
    head.rotation.x = THREE.MathUtils.damp(
      head.rotation.x,
      THREE.MathUtils.clamp(-targetPitch * 0.6, -0.18, 0.18) * movement,
      4.5,
      delta,
    );
    neckPoseRef.current.x = THREE.MathUtils.damp(neckPoseRef.current.x, head.rotation.y * 0.46, 4, delta);
    neckPoseRef.current.y = THREE.MathUtils.damp(neckPoseRef.current.y, head.rotation.x * 0.45, 4, delta);

    if (neckRef.current) {
      neckEulerRef.current.set(neckPoseRef.current.y, neckPoseRef.current.x, 0, 'YXZ');
      neckTopRef.current
        .set(head.position.x, headPivotY - 0.04, dimensions.depth + 0.018)
        .add(neckOffsetScratchRef.current.copy(neckTopOffsetRef.current).applyEuler(neckEulerRef.current));
      neckBaseRef.current.y = body.position.y + neckBaseY;
      deformNeck(neckGeometry, neckBaseRef.current, neckTopRef.current);
    }

    if (eyesRef.current) {
      const idleEyeDrift = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.53) * 0.002;
      eyesRef.current.position.x = THREE.MathUtils.damp(
        eyesRef.current.position.x,
        THREE.MathUtils.clamp(targetYaw * 0.16, -0.1, 0.1) * movement + idleEyeDrift,
        9,
        delta,
      );
      eyesRef.current.position.y = THREE.MathUtils.damp(
        eyesRef.current.position.y,
        THREE.MathUtils.clamp(targetPitch * 0.14, -0.08, 0.08) * movement,
        9,
        delta,
      );
    }
  });

  const scaleRatio = dimensions.unit / sourceScale;
  const headX = (452.5 - portraitCenter.x) * sourceScale;
  const headY = (portraitCenter.y - 287.5) * sourceScale;
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
      <mesh
        ref={neckRef}
        name="bharat-articulated-neck"
        geometry={neckGeometry}
        material={neckMaterial}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
      <mesh position={[0, neckBaseY + 0.006, neckBaseZ]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.19, 0.025, 8, 28]} />
        <primitive object={neckCollarMaterial} attach="material" />
      </mesh>
      <group
        ref={headRef}
        name="bharat-head"
        position={[headX, headPivotY - 0.04, dimensions.depth + 0.018]}
      >
        <PortraitLayer
          texture={headTexture}
          width={515}
          height={575}
          x={0}
          y={headY - headPivotY}
          z={0}
          order={2}
          profile="head"
        />
        <group ref={eyesRef} name="bharat-eyes" position={[0, 0, 0.31]}>
          {[-0.18, 0.30].map((x) => (
            <group key={x} position={[x, -0.315, 0]}>
              <mesh geometry={pupilGeometry} material={pupilMaterial} scale={[1, 1, 0.42]} />
              <mesh geometry={pupilGlintGeometry} material={pupilGlintMaterial} position={[-0.006, 0.009, 0.019]} />
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}
