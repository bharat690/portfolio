import * as THREE from 'three';

const cover = new THREE.MeshStandardMaterial({ color: '#443a32', roughness: 0.86 });
const paper = new THREE.MeshStandardMaterial({ color: '#c0b6a2', roughness: 1 });
const ink = new THREE.MeshStandardMaterial({ color: '#b11a15', roughness: 0.92 });

export function Magazine() {
  return (
    <group>
      <mesh castShadow receiveShadow><boxGeometry args={[0.48, 0.68, 0.12]} /><primitive object={cover} attach="material" /></mesh>
      <mesh position={[0, 0, 0.068]}><boxGeometry args={[0.42, 0.62, 0.012]} /><primitive object={paper} attach="material" /></mesh>
      <mesh position={[0, 0.16, 0.078]}><boxGeometry args={[0.35, 0.18, 0.01]} /><meshStandardMaterial color="#272624" roughness={0.95} /></mesh>
      <mesh position={[0, 0.16, 0.087]}><boxGeometry args={[0.29, 0.045, 0.008]} /><primitive object={ink} attach="material" /></mesh>
      <mesh position={[-0.03, -0.08, 0.085]} rotation={[0, 0, -0.28]}><boxGeometry args={[0.27, 0.04, 0.008]} /><meshStandardMaterial color="#31312d" roughness={0.9} /></mesh>
      {[-0.22, -0.16, -0.1, -0.04, 0.02].map((y) => (
        <mesh key={y} position={[0, y, 0.079]}><boxGeometry args={[0.3 - Math.abs(y) * 0.2, 0.012, 0.005]} /><meshStandardMaterial color="#60594f" roughness={1} /></mesh>
      ))}
      <mesh position={[-0.215, 0, 0.072]}><boxGeometry args={[0.018, 0.62, 0.008]} /><primitive object={ink} attach="material" /></mesh>
      <mesh position={[0.19, -0.27, 0.075]} rotation={[0, 0, -0.4]}><planeGeometry args={[0.11, 0.1]} /><meshStandardMaterial color="#716a5c" roughness={1} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}
