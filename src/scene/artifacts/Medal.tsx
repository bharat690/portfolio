import * as THREE from 'three';

const brass = new THREE.MeshStandardMaterial({ color: '#a58d61', metalness: 0.54, roughness: 0.58 });
const dark = new THREE.MeshStandardMaterial({ color: '#101111', metalness: 0.3, roughness: 0.82 });

export function Medal() {
  return (
    <group>
      <mesh position={[0, 0.23, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.22, 0.48, 4]} /><meshStandardMaterial color="#2e0808" roughness={0.92} /></mesh>
      <mesh position={[0, 0.23, 0.04]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.12, 0.42, 4]} /><meshStandardMaterial color="#571010" roughness={0.92} /></mesh>
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} material={brass}><cylinderGeometry args={[0.25, 0.25, 0.09, 32]} /></mesh>
      <mesh position={[0, 0, 0.052]}><ringGeometry args={[0.18, 0.22, 32]} /><meshBasicMaterial color="#8c7650" /></mesh>
      <mesh position={[0, 0, 0.058]}><circleGeometry args={[0.17, 32]} /><meshStandardMaterial color="#3b1110" roughness={0.92} /></mesh>
      <mesh position={[0, 0, 0.08]} rotation={[0, 0, Math.PI]}><shapeGeometry args={[starShape()]} /><primitive object={brass} attach="material" /></mesh>
      <mesh position={[0, 0, 0.09]}><sphereGeometry args={[0.035, 12, 8]} /><primitive object={dark} attach="material" /></mesh>
    </group>
  );
}

function starShape() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? 0.12 : 0.055;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}
