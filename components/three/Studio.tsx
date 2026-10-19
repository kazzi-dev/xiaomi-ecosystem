'use client';

import { Environment, Lightformer } from '@react-three/drei';

/**
 * Soft studio lighting: key + orange/blue rim lights, plus a procedural
 * environment map built from Lightformers (no HDR download needed).
 */
export default function Studio({ lite = false }: { lite?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.8} />
      <spotLight position={[-4, 2.5, -3]} intensity={45} angle={0.7} penumbra={1} color="#ff6900" />
      {!lite && <spotLight position={[4, -1.5, -3]} intensity={30} angle={0.7} penumbra={1} color="#6f7dff" />}
      {!lite && <pointLight position={[0, -3, 3]} intensity={4} color="#ffd2b0" />}
      <Environment resolution={lite ? 64 : 256} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 4, 4]} scale={[8, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-5, 0.5, 2]} rotation-y={Math.PI / 2} scale={[5, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ff6900" position={[5, 0, -1]} rotation-y={-Math.PI / 2} scale={[3, 6, 1]} />
        <Lightformer form="ring" intensity={1.2} position={[0, 0, -6]} scale={4} />
        <Lightformer form="rect" intensity={0.5} position={[0, -4, 2]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>
    </>
  );
}
