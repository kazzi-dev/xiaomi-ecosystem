'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import SceneCanvas from './SceneCanvas';
import Studio from './Studio';
import { Foldable, Phone, Tablet, Watch, type Signal } from './models';
import { pointer } from '@/lib/pointer';
import { easeOutCubic, lerp, range } from '@/lib/math';
import { useIsMobile } from '@/lib/hooks';
import { products } from '@/data/products';

type Props = { progress: Signal; intro: Signal };

const ORBITERS = [
  { key: 'fold', scale: 0.72, from: [-7, 3.5, -4], phase: 0 },
  { key: 'pad', scale: 0.62, from: [7, -3.5, -5], phase: (Math.PI * 2) / 3 },
  { key: 'watch', scale: 1.05, from: [5, 4.5, -3], phase: (Math.PI * 4) / 3 },
] as const;

function Rig({ progress, intro, mobile }: Props & { mobile: boolean }) {
  const phone = useRef<THREE.Group>(null);
  const orbiters = useRef<(THREE.Group | null)[]>([]);
  const angle = useRef(0);
  const foldOpen = useMemo<Signal>(() => ({ current: 0.5 }), []);
  const { camera, size } = useThree();
  const baseZ = mobile ? 5.8 : 4.4;
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const color = products['xiaomi-18-pro-max'].colors[0];

  useFrame((state, dt) => {
    const p = progress.current;
    const i = intro.current;
    const t = state.clock.elapsedTime;

    camera.position.z = THREE.MathUtils.damp(camera.position.z, baseZ + range(p, 0, 0.8) * 3.2, 4, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, range(p, 0, 0.8) * 0.6, 4, dt);
    camera.lookAt(0, 0, 0);

    const g = phone.current;
    if (g) {
      g.position.y = lerp(-3, 0, easeOutCubic(i)) + Math.sin(t * 1.1) * 0.04;
      const ry = pointer.x * 0.45 + (1 - i) * -1.6 + p * 0.8 + Math.sin(t * 0.5) * 0.08;
      const rx = -pointer.y * 0.22 + (1 - i) * 0.5;
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ry, 4, dt);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rx, 4, dt);
      g.rotation.z = Math.sin(t * 0.7) * 0.02;
    }

    angle.current += dt * 0.25 * (0.4 + p);
    foldOpen.current = 0.45 + 0.3 * Math.sin(t * 0.8);
    // Orbit radius follows the visible width so nothing clips on narrow screens.
    const halfW = Math.tan(THREE.MathUtils.degToRad(35 / 2)) * camera.position.z * (size.width / size.height);
    const rx = Math.min(2.3, halfW * 0.62);
    ORBITERS.forEach((o, idx) => {
      const node = orbiters.current[idx];
      if (!node) return;
      const f = range(p, 0.1 + idx * 0.08, 0.55 + idx * 0.08);
      node.visible = f > 0.001;
      const a = angle.current + o.phase;
      tmp.set(Math.cos(a) * rx, Math.sin(a * 1.3) * 0.35 + (idx === 1 ? -0.1 : 0.1), Math.sin(a) * 1.3);
      node.position.set(lerp(o.from[0], tmp.x, f), lerp(o.from[1], tmp.y, f), lerp(o.from[2], tmp.z, f));
      node.scale.setScalar(o.scale * Math.max(f, 0.0001) * (mobile ? 0.8 : 1));
      node.rotation.y += dt * 0.5;
      node.rotation.x = Math.sin(t * 0.6 + idx) * 0.25;
    });
  });

  return (
    <>
      <group ref={phone}>
        <Phone color={color.hex} frame={color.frame} finish={color.finish} quality={mobile ? 0.5 : 1} />
      </group>
      <group ref={(n) => { orbiters.current[0] = n; }}>
        <Foldable open={foldOpen} color="#e6dfd2" frame="#d6ccbb" quality={mobile ? 0.5 : 0.8} />
      </group>
      <group ref={(n) => { orbiters.current[1] = n; }}>
        <Tablet color="#2a2b2f" frame="#5a5c63" quality={mobile ? 0.5 : 0.8} />
      </group>
      <group ref={(n) => { orbiters.current[2] = n; }}>
        <Watch />
      </group>
    </>
  );
}

export default function HeroScene(props: Props) {
  const mobile = useIsMobile();
  return (
    <SceneCanvas
      className="absolute inset-0"
      z={mobile ? 5.8 : 4.4}
      label="Xiaomi 18 Pro Max in 3D, joined by Xiaomi 18 Fold, Pad 9 Pro Max and Xiaomi Watch as you scroll"
    >
      <Studio lite={mobile} />
      <Rig {...props} mobile={mobile} />
    </SceneCanvas>
  );
}
