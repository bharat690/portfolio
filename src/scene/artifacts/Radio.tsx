import * as THREE from 'three';

const shell = new THREE.MeshStandardMaterial({ color: '#202222', metalness: 0.28, roughness: 0.76 });
const rubber = new THREE.MeshStandardMaterial({ color: '#090a0a', roughness: 0.92 });
const screen = new THREE.MeshStandardMaterial({ color: '#32291d', emissive: '#291207', emissiveIntensity: 0.4, roughness: 0.52 });

export function Radio() {
  return (
    <group>
      <mesh castShadow receiveShadow><boxGeometry args={[0.43, 0.62, 0.24]} /><primitive object={shell} attach="material" /></mesh>
      <mesh position={[0, 0.1, 0.13]}><boxGeometry args={[0.27, 0.19, 0.02]} /><primitive object={screen} attach="material" /></mesh>
      <mesh position={[0, 0.11, 0.145]}><boxGeometry args={[0.19, 0.012, 0.005]} /><meshBasicMaterial color="#a76834" /></mesh>
      <mesh position={[-0.105, -0.12, 0.14]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.045, 0.045, 0.035, 16]} /><primitive object={rubber} attach="material" /></mesh>
      <mesh position={[0.105, -0.12, 0.14]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.045, 0.045, 0.035, 16]} /><primitive object={rubber} attach="material" /></mesh>
      <mesh position={[0.15, 0.3, 0]} rotation={[0, 0, -0.08]}><cylinderGeometry args={[0.018, 0.025, 0.48, 8]} /><primitive object={rubber} attach="material" /></mesh>
      <mesh position={[-0.12, -0.29, 0.14]}><boxGeometry args={[0.08, 0.035, 0.02]} /><meshStandardMaterial color="#8d1813" roughness={0.8} /></mesh>
      <mesh position={[0.01, -0.29, 0.14]}><boxGeometry args={[0.08, 0.035, 0.02]} /><primitive object={rubber} attach="material" /></mesh>
      <mesh position={[-0.16, 0.29, 0.02]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.055, 0.055, 0.1, 12]} /><primitive object={rubber} attach="material" /></mesh>
      <mesh position={[0.16, 0.29, 0.02]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.045, 0.045, 0.09, 12]} /><primitive object={shell} attach="material" /></mesh>
      <mesh position={[0, -0.34, 0]}><boxGeometry args={[0.28, 0.04, 0.19]} /><primitive object={rubber} attach="material" /></mesh>
    </group>
  );
}
