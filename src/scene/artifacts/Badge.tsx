import * as THREE from 'three';

const steel = new THREE.MeshStandardMaterial({ color: '#aaa79e', metalness: 0.62, roughness: 0.48 });
const black = new THREE.MeshStandardMaterial({ color: '#252523', metalness: 0.35, roughness: 0.68 });

function shieldShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.25, 0.28);
  shape.lineTo(0.25, 0.28);
  shape.lineTo(0.22, -0.04);
  shape.quadraticCurveTo(0.17, -0.25, 0, -0.38);
  shape.quadraticCurveTo(-0.17, -0.25, -0.22, -0.04);
  shape.closePath();
  return shape;
}

export function Badge() {
  const shape = shieldShape();
  return (
    <group rotation={[0, 0, 0.02]}>
      <mesh castShadow receiveShadow material={steel}><extrudeGeometry args={[shape, { depth: 0.09, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.025, bevelThickness: 0.02 }]} /></mesh>
      <mesh position={[0, 0, 0.125]}><shapeGeometry args={[shape]} /><primitive object={black} attach="material" /></mesh>
      <mesh position={[0, 0.01, 0.14]}><circleGeometry args={[0.13, 6]} /><meshStandardMaterial color="#870d0d" metalness={0.3} roughness={0.68} /></mesh>
      <mesh position={[0, 0.01, 0.16]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.09, 0.16, 5]} /><meshStandardMaterial color="#c0bba9" metalness={0.45} roughness={0.58} /></mesh>
      <mesh position={[0, -0.25, 0.14]}><boxGeometry args={[0.13, 0.035, 0.02]} /><meshStandardMaterial color="#77746d" metalness={0.45} roughness={0.7} /></mesh>
    </group>
  );
}
