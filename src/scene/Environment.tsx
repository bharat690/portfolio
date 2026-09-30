import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function createDust(count: number) {
  const positions = new Float32Array(count * 3);
  let seed = 431;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (random() - 0.5) * 9;
    positions[i * 3 + 1] = (random() - 0.5) * 6;
    positions[i * 3 + 2] = -1.5 - random() * 5;
  }
  return positions;
}

function createRedHaze() {
  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x / (size - 1)) * 2 - 1;
      const dy = (y / (size - 1)) * 2 - 1;
      const falloff = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
      const offset = (y * size + x) * 4;
      pixels[offset] = 126;
      pixels[offset + 1] = 7;
      pixels[offset + 2] = 10;
      pixels[offset + 3] = Math.round(falloff * falloff * 72);
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const redHaze = createRedHaze();

export function Environment({ reducedMotion, compact }: { reducedMotion: boolean; compact: boolean }) {
  const dust = useMemo(() => createDust(reducedMotion || compact ? 90 : 180), [reducedMotion, compact]);
  const dustRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    const points = dustRef.current;
    if (!points || reducedMotion) return;
    points.position.y = THREE.MathUtils.damp(
      points.position.y,
      Math.sin(state.clock.elapsedTime * 0.12) * 0.045,
      0.8,
      delta,
    );
    points.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.012;
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 7, 16]} />
      <mesh position={[0, -2.4, -2.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color="#090909" roughness={0.98} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, -3.4]}>
        <planeGeometry args={[12, 8]} />
        <meshBasicMaterial color="#100808" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 0.15, -3.2]} scale={[8.5, 6.2, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={redHaze} transparent depthWrite={false} toneMapped={false} fog={false} />
      </mesh>
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#c7c1b7" size={0.018} sizeAttenuation transparent opacity={0.48} depthWrite={false} />
      </points>
      <ambientLight intensity={0.38} />
      <hemisphereLight args={['#aaa79f', '#060606', 0.58]} />
      <directionalLight position={[-3.5, 5, 5]} intensity={3.6} color="#e7e0d3" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[0, 0.8, 4.5]} intensity={1.5} color="#d8d2c6" distance={9} />
      <pointLight position={[3.2, 1.8, -1.1]} intensity={0.82} color="#8e1111" distance={8} />
      <pointLight position={[-4, -1, 2]} intensity={0.52} color="#777d84" distance={7} />
      <spotLight position={[0, 4.5, 1.8]} angle={0.62} penumbra={0.8} intensity={0.85} color="#faf7ee" />
    </>
  );
}
