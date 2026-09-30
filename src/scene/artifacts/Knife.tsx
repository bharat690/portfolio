import * as THREE from 'three';

const blade = new THREE.MeshStandardMaterial({ color: '#b6b3aa', metalness: 0.58, roughness: 0.38 });
const handle = new THREE.MeshStandardMaterial({ color: '#292a29', metalness: 0.12, roughness: 0.84 });

function bladeShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.56, 0.06);
  shape.lineTo(0.34, 0.06);
  shape.lineTo(0.62, 0);
  shape.lineTo(0.34, -0.06);
  shape.lineTo(-0.56, -0.06);
  shape.closePath();
  return shape;
}

export function Knife() {
  return (
    <group rotation={[0, 0, 0.08]}>
      <mesh castShadow receiveShadow position={[0.25, 0, 0]} material={blade}>
        <extrudeGeometry args={[bladeShape(), { depth: 0.035, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 }]} />
      </mesh>
      <mesh position={[-0.55, 0, 0.02]} castShadow><boxGeometry args={[0.36, 0.13, 0.1]} /><primitive object={handle} attach="material" /></mesh>
      <mesh position={[-0.4, 0, 0.03]}><boxGeometry args={[0.055, 0.18, 0.12]} /><meshStandardMaterial color="#615e55" metalness={0.65} roughness={0.42} /></mesh>
      {[-0.66, -0.55, -0.44].map((x) => (
        <mesh key={x} position={[x, 0, 0.078]} rotation={[0, 0, -0.7]}><boxGeometry args={[0.025, 0.12, 0.012]} /><meshStandardMaterial color="#57534b" roughness={0.8} /></mesh>
      ))}
      <mesh position={[-0.69, 0, 0.02]}><circleGeometry args={[0.035, 12]} /><meshStandardMaterial color="#a89f8e" metalness={0.8} roughness={0.3} /></mesh>
    </group>
  );
}
