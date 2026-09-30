import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterProps {
  focus: [number, number] | null;
  reducedMotion: boolean;
  compact: boolean;
}

function createTacticalGrain() {
  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  let seed = 91427;
  for (let index = 0; index < size * size; index += 1) {
    seed = (seed * 16807) % 2147483647;
    const value = 96 + Math.floor((seed / 2147483647) * 159);
    const offset = index * 4;
    pixels[offset] = value;
    pixels[offset + 1] = value;
    pixels[offset + 2] = value;
    pixels[offset + 3] = 255;
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

const tacticalGrain = createTacticalGrain();
function createMaskPaint() {
  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  let seed = 7319;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      seed = (seed * 16807) % 2147483647;
      const grain = seed / 2147483647;
      const broadStain = (Math.sin(x * 0.19) + Math.cos(y * 0.14) + Math.sin((x + y) * 0.09)) * 13;
      const fleck = grain < 0.035 ? -95 : 0;
      const value = THREE.MathUtils.clamp(211 + broadStain + grain * 34 + fleck, 55, 255);
      const offset = (y * size + x) * 4;
      pixels[offset] = value;
      pixels[offset + 1] = value;
      pixels[offset + 2] = value;
      pixels[offset + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

const maskPaint = createMaskPaint();
const cloth = new THREE.MeshStandardMaterial({ color: '#191a1b', roughness: 0.96, roughnessMap: tacticalGrain, bumpMap: tacticalGrain, bumpScale: 0.018 });
const armor = new THREE.MeshStandardMaterial({ color: '#292a2a', roughness: 0.82, metalness: 0.12, roughnessMap: tacticalGrain, bumpMap: tacticalGrain, bumpScale: 0.01 });
const helmet = new THREE.MeshStandardMaterial({ color: '#292a28', roughness: 0.82, metalness: 0.1, roughnessMap: tacticalGrain, bumpMap: tacticalGrain, bumpScale: 0.01 });
const deepBlack = new THREE.MeshStandardMaterial({ color: '#0c0d0d', roughness: 0.68, metalness: 0.12 });
const webbing = new THREE.MeshStandardMaterial({ color: '#252622', roughness: 0.98, roughnessMap: tacticalGrain, bumpMap: tacticalGrain, bumpScale: 0.016 });
const wornSteel = new THREE.MeshStandardMaterial({ color: '#54534c', roughness: 0.64, metalness: 0.5 });
const bone = new THREE.MeshStandardMaterial({ color: '#e5e0d5', map: maskPaint, roughness: 0.96, roughnessMap: tacticalGrain, bumpMap: tacticalGrain, bumpScale: 0.016 });
const red = new THREE.MeshStandardMaterial({ color: '#620909', roughness: 0.72, emissive: '#100000' });
const lens = new THREE.MeshStandardMaterial({ color: '#101111', roughness: 0.28, metalness: 0.42, emissive: '#080202' });
const opticsTrim = new THREE.MeshStandardMaterial({ color: '#393a36', roughness: 0.72, metalness: 0.24 });
const gaze = new THREE.MeshStandardMaterial({ color: '#291d1b', roughness: 0.72, metalness: 0.1 });

function makeSkullMask() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.24, 0.3);
  shape.quadraticCurveTo(-0.34, 0.3, -0.34, 0.12);
  shape.lineTo(-0.31, -0.16);
  shape.quadraticCurveTo(-0.27, -0.35, -0.12, -0.41);
  shape.lineTo(0, -0.44);
  shape.lineTo(0.12, -0.41);
  shape.quadraticCurveTo(0.27, -0.35, 0.31, -0.16);
  shape.lineTo(0.34, 0.12);
  shape.quadraticCurveTo(0.34, 0.3, 0.24, 0.3);
  shape.quadraticCurveTo(0, 0.37, -0.24, 0.3);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.012,
    bevelThickness: 0.012,
  });
}

const skullMask = makeSkullMask();

function makeEyeSocket() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.082, 0.015);
  shape.lineTo(-0.064, 0.071);
  shape.lineTo(-0.018, 0.095);
  shape.lineTo(0.045, 0.078);
  shape.lineTo(0.081, 0.029);
  shape.lineTo(0.07, -0.039);
  shape.lineTo(0.026, -0.08);
  shape.lineTo(-0.038, -0.073);
  shape.lineTo(-0.077, -0.034);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: false, steps: 1 });
}

const eyeSocket = makeEyeSocket();

function makeTorsoShell() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.42, 0.67);
  shape.lineTo(-0.28, 0.82);
  shape.lineTo(0.28, 0.82);
  shape.lineTo(0.42, 0.67);
  shape.lineTo(0.68, 0.52);
  shape.lineTo(0.76, 0.25);
  shape.lineTo(0.65, -0.38);
  shape.lineTo(0.46, -0.65);
  shape.lineTo(-0.46, -0.65);
  shape.lineTo(-0.65, -0.38);
  shape.lineTo(-0.76, 0.25);
  shape.lineTo(-0.68, 0.52);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.5,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.06,
    bevelThickness: 0.06,
  });
}

function makeShoulderPlate() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.18, 0.09);
  shape.lineTo(-0.06, 0.19);
  shape.lineTo(0.13, 0.15);
  shape.lineTo(0.22, 0.02);
  shape.lineTo(0.18, -0.14);
  shape.lineTo(-0.08, -0.17);
  shape.lineTo(-0.21, -0.06);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.015,
    bevelThickness: 0.012,
  });
}

function makeVestPlate() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.3, 0.34);
  shape.lineTo(0.3, 0.34);
  shape.lineTo(0.39, 0.24);
  shape.lineTo(0.36, -0.24);
  shape.lineTo(0.25, -0.34);
  shape.lineTo(-0.25, -0.34);
  shape.lineTo(-0.36, -0.24);
  shape.lineTo(-0.39, 0.24);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.09,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.018,
    bevelThickness: 0.016,
  });
}

const vestPlate = makeVestPlate();
const torsoShell = makeTorsoShell();
const shoulderPlate = makeShoulderPlate();

function Cylinder({ args, position, rotation, material }: {
  args: [number, number, number, number?];
  position: [number, number, number];
  rotation?: [number, number, number];
  material: THREE.Material;
}) {
  return <mesh position={position} rotation={rotation} castShadow receiveShadow material={material}>
    <cylinderGeometry args={args} />
  </mesh>;
}

function FlagPatch() {
  return (
    <group position={[0.42, 0.29, 0.44]} rotation={[0, 0, -0.05]} scale={0.84}>
      <mesh castShadow><boxGeometry args={[0.33, 0.19, 0.035]} /><meshStandardMaterial color="#080808" roughness={1} /></mesh>
      <mesh position={[0, 0.055, 0.022]}><boxGeometry args={[0.27, 0.05, 0.012]} /><meshStandardMaterial color="#d78330" roughness={0.9} /></mesh>
      <mesh position={[0, 0, 0.023]}><boxGeometry args={[0.27, 0.05, 0.012]} /><meshStandardMaterial color="#e2ded0" roughness={0.9} /></mesh>
      <mesh position={[0, -0.055, 0.022]}><boxGeometry args={[0.27, 0.05, 0.012]} /><meshStandardMaterial color="#28633a" roughness={0.9} /></mesh>
      <mesh position={[0, 0, 0.033]}><ringGeometry args={[0.018, 0.024, 12]} /><meshBasicMaterial color="#263c64" /></mesh>
    </group>
  );
}

function HeadAssembly({ eyesRef }: { eyesRef: React.RefObject<THREE.Group> }) {
  return (
    <group>
      <group position={[0, 1.18, 0]}>
        <mesh position={[0, -0.04, 0.04]} castShadow><sphereGeometry args={[0.43, 18, 14]} /><primitive object={deepBlack} attach="material" /></mesh>
        <mesh position={[0, -0.08, 0.44]} castShadow receiveShadow material={bone} geometry={skullMask} />
        {[-0.145, 0.145].map((x) => (
          <mesh key={x} position={[x, 0.08, 0.56]} geometry={eyeSocket} material={deepBlack} />
        ))}
        <mesh position={[0, -0.14, 0.59]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.08, 0.13, 3]} /><primitive object={deepBlack} attach="material" /></mesh>
        <group ref={eyesRef} position={[0, 0.08, 0.58]}>
          {[-0.145, 0.145].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <mesh position={[0, 0, 0.022]}><sphereGeometry args={[0.026, 12, 8]} /><primitive object={gaze} attach="material" /></mesh>
            </group>
          ))}
        </group>
        {[-0.18, -0.108, -0.036, 0.036, 0.108, 0.18].map((x, index) => (
          <mesh key={x} position={[x, -0.32, 0.58]} castShadow>
            <boxGeometry args={[index === 2 || index === 3 ? 0.035 : 0.044, index === 2 || index === 3 ? 0.052 : 0.065, 0.025]} /><primitive object={bone} attach="material" />
          </mesh>
        ))}
        <mesh position={[0, 0.16, -0.02]} rotation={[0, 0, Math.PI]} castShadow>
          <sphereGeometry args={[0.52, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.57]} />
          <primitive object={helmet} attach="material" />
        </mesh>
        <mesh position={[0, 0.06, 0.35]} castShadow><boxGeometry args={[1.03, 0.11, 0.31]} /><primitive object={helmet} attach="material" /></mesh>
        <Cylinder args={[0.17, 0.17, 0.11, 12]} position={[-0.47, -0.04, 0.1]} rotation={[0, 0, Math.PI / 2]} material={helmet} />
        <Cylinder args={[0.17, 0.17, 0.11, 12]} position={[0.47, -0.04, 0.1]} rotation={[0, 0, Math.PI / 2]} material={helmet} />
        <mesh position={[0, 0.43, 0.26]} castShadow><boxGeometry args={[0.19, 0.12, 0.2]} /><primitive object={helmet} attach="material" /></mesh>
        <mesh position={[0, 0.47, 0.27]}><boxGeometry args={[0.42, 0.07, 0.07]} /><primitive object={deepBlack} attach="material" /></mesh>
        <Cylinder args={[0.065, 0.065, 0.16, 12]} position={[-0.49, -0.08, 0.05]} rotation={[0, 0, Math.PI / 2]} material={armor} />
        <Cylinder args={[0.065, 0.065, 0.16, 12]} position={[0.49, -0.08, 0.05]} rotation={[0, 0, Math.PI / 2]} material={armor} />
        {[-0.2, 0.2].map((x) => (
          <group key={x} position={[x, 0.61, 0.15]} rotation={[0.08, 0, x * -0.12]}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.155, 0.155, 0.36, 16]} /><primitive object={helmet} attach="material" /></mesh>
            <mesh position={[0, 0, 0.19]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.112, 0.112, 0.024, 20]} /><primitive object={lens} attach="material" /></mesh>
            <mesh position={[0, 0, 0.206]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.11, 0.012, 6, 20]} /><primitive object={opticsTrim} attach="material" /></mesh>
            <mesh position={[0, -0.2, -0.02]}><boxGeometry args={[0.075, 0.12, 0.12]} /><primitive object={deepBlack} attach="material" /></mesh>
          </group>
        ))}
        <mesh position={[0, 0.42, 0.15]}><boxGeometry args={[0.46, 0.055, 0.11]} /><primitive object={deepBlack} attach="material" /></mesh>
      </group>
    </group>
  );
}

export function Character({ focus, reducedMotion, compact }: CharacterProps) {
  const pointer = useThree((state) => state.pointer);
  const torsoRef = useRef<THREE.Group>(null);
  const neckRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const rootRef = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector2());

  useFrame((_, delta) => {
    const scale = reducedMotion ? 0.35 : 1;
    const blend = 1 - Math.exp(-Math.min(delta, 0.05) * (reducedMotion ? 4 : 6));
    target.current.set(
      THREE.MathUtils.clamp(focus?.[0] ?? pointer.x, -1, 1),
      THREE.MathUtils.clamp(focus?.[1] ?? pointer.y, -1, 1),
    );
    if (eyesRef.current) {
      eyesRef.current.position.x = THREE.MathUtils.damp(eyesRef.current.position.x, target.current.x * 0.045, 8, delta);
      eyesRef.current.position.y = THREE.MathUtils.damp(eyesRef.current.position.y, target.current.y * 0.035, 8, delta);
    }
    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, target.current.x * 0.2 * scale, 5, delta);
      headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, -target.current.y * 0.11 * scale, 5, delta);
    }
    if (neckRef.current) {
      neckRef.current.rotation.y = THREE.MathUtils.damp(neckRef.current.rotation.y, target.current.x * 0.095 * scale, 4, delta);
      neckRef.current.rotation.x = THREE.MathUtils.damp(neckRef.current.rotation.x, -target.current.y * 0.055 * scale, 4, delta);
    }
    if (torsoRef.current) {
      torsoRef.current.rotation.y = THREE.MathUtils.damp(torsoRef.current.rotation.y, target.current.x * 0.035 * scale, 3, delta);
      torsoRef.current.rotation.x = THREE.MathUtils.damp(torsoRef.current.rotation.x, -target.current.y * 0.018 * scale, 3, delta);
    }
    if (rootRef.current) {
      rootRef.current.position.y = -0.84 + (reducedMotion ? 0 : Math.sin(performance.now() * 0.0009) * 0.012);
      rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, target.current.x * 0.018 * scale, 2.5, delta);
    }
    if (neckRef.current && headRef.current) {
      neckRef.current.rotation.y += (headRef.current.rotation.y - neckRef.current.rotation.y) * blend * 0.1;
    }
  });

  return (
    <group ref={rootRef} position={[0, -0.84, 0]} scale={compact ? 1.04 : 1.28}>
      <group ref={torsoRef}>
          <mesh position={[0, 0.24, -0.18]} castShadow receiveShadow geometry={torsoShell} material={cloth} />
          <mesh position={[0, 0.55, 0.31]} castShadow receiveShadow geometry={vestPlate} material={armor} />
          <mesh position={[0, 0.79, 0.43]} castShadow><boxGeometry args={[0.62, 0.07, 0.06]} /><primitive object={deepBlack} attach="material" /></mesh>
          {[-0.23, 0.23].map((x) => (
            <group key={x} position={[x, 0.53, 0.43]}>
              <mesh><boxGeometry args={[0.055, 0.62, 0.035]} /><primitive object={webbing} attach="material" /></mesh>
              <mesh position={[0, 0.05, 0.025]}><boxGeometry args={[0.065, 0.08, 0.018]} /><primitive object={wornSteel} attach="material" /></mesh>
              <mesh position={[0, -0.2, 0.025]}><boxGeometry args={[0.065, 0.08, 0.018]} /><primitive object={wornSteel} attach="material" /></mesh>
          </group>
          ))}
          {[-0.31, 0.31].map((x) => (
            <group key={x} position={[x, 0.43, 0.48]}>
            <mesh castShadow><boxGeometry args={[0.18, 0.23, 0.13]} /><primitive object={deepBlack} attach="material" /></mesh>
            <mesh position={[0, -0.02, 0.076]}><boxGeometry args={[0.15, 0.04, 0.012]} /><primitive object={armor} attach="material" /></mesh>
            <mesh position={[0, -0.26, 0]} castShadow><boxGeometry args={[0.2, 0.23, 0.14]} /><primitive object={armor} attach="material" /></mesh>
            <mesh position={[0, -0.26, 0.078]}><boxGeometry args={[0.14, 0.035, 0.016]} /><primitive object={deepBlack} attach="material" /></mesh>
            <mesh position={[0, -0.26, 0.089]}><boxGeometry args={[0.035, 0.014, 0.01]} /><primitive object={red} attach="material" /></mesh>
          </group>
        ))}
        <FlagPatch />
        <mesh position={[-0.32, 0.72, 0.45]}><boxGeometry args={[0.095, 0.035, 0.025]} /><primitive object={red} attach="material" /></mesh>
        <mesh position={[0, 0.16, 0.43]}><boxGeometry args={[0.035, 0.24, 0.025]} /><meshStandardMaterial color="#373732" roughness={0.92} /></mesh>
      </group>
      <group ref={neckRef} position={[0, 0.82, 0]}>
        <Cylinder args={[0.2, 0.23, 0.62, 12]} position={[0, 0.16, 0]} material={deepBlack} />
        <Cylinder args={[0.25, 0.28, 0.15, 12]} position={[0, -0.03, 0.04]} material={armor} />
        <group ref={headRef} position={[0, 0.25, 0]}>
          <group position={[0, -0.45, 0]}>
            <HeadAssembly eyesRef={eyesRef} />
          </group>
        </group>
      </group>
      {[-0.25, 0.25].map((x) => (
        <group key={x} position={[x, -0.75, 0]}>
          <mesh position={[0, -0.19, 0]} castShadow><cylinderGeometry args={[0.18, 0.22, 0.66, 10]} /><primitive object={cloth} attach="material" /></mesh>
          <mesh position={[0, -0.53, 0.05]} castShadow><boxGeometry args={[0.34, 0.2, 0.46]} /><primitive object={deepBlack} attach="material" /></mesh>
          <mesh position={[0, 0.08, 0.18]}><boxGeometry args={[0.28, 0.15, 0.1]} /><primitive object={armor} attach="material" /></mesh>
          <mesh position={[0, -0.18, 0.19]}><boxGeometry args={[0.18, 0.06, 0.04]} /><meshStandardMaterial color="#3a3933" roughness={0.94} /></mesh>
        </group>
      ))}
      {[-0.66, 0.66].map((x) => (
        <group key={x} position={[x * 1.22, 0.18, 0.12]}>
          <mesh position={[0, 0.02, 0.16]} rotation={[0, 0, x * 0.18]} castShadow receiveShadow geometry={shoulderPlate} material={armor} />
          <mesh position={[0, -0.12, 0]} rotation={[0, 0, x * 0.16]} castShadow><cylinderGeometry args={[0.17, 0.14, 0.46, 10]} /><primitive object={cloth} attach="material" /></mesh>
          <mesh position={[0, -0.4, 0.01]} castShadow><sphereGeometry args={[0.17, 10, 8]} /><primitive object={armor} attach="material" /></mesh>
          <mesh position={[0, -0.58, 0.05]} rotation={[0, 0, x * 0.13]} castShadow><cylinderGeometry args={[0.13, 0.105, 0.35, 10]} /><primitive object={cloth} attach="material" /></mesh>
          <mesh position={[0, -0.78, 0.09]} castShadow><boxGeometry args={[0.23, 0.16, 0.2]} /><primitive object={deepBlack} attach="material" /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.84, -0.12]}><boxGeometry args={[0.62, 0.08, 0.12]} /><primitive object={deepBlack} attach="material" /></mesh>
    </group>
  );
}
