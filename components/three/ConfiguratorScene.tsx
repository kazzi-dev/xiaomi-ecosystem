'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SceneCanvas from './SceneCanvas';
import Studio from './Studio';
import { Buds, Foldable, Keyboard, Pen, Phone, Tablet, Watch, type Signal } from './models';
import { pointer } from '@/lib/pointer';
import { useIsMobile } from '@/lib/hooks';
import { products, type ProductId } from '@/data/products';

export type Setup = {
  phone: 'xiaomi-18-pro' | 'xiaomi-18-pro-max' | 'xiaomi-fold';
  tablet: 'none' | 'pad-9' | 'pad-9-pro-max';
  extras: { watch: boolean; buds: boolean; pen: boolean; keyboard: boolean };
};

/** Scales its children toward `show ? scale : 0` with a springy damp so items pop in and out. */
function Pop({ show, scale = 1, children, ...props }: JSX.IntrinsicElements['group'] & { show: boolean; scale?: number }) {
  const g = useRef<THREE.Group>(null);
  const s = useRef(0);
  const v = useRef(0);
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const target = show ? scale : 0;
    v.current += (180 * (target - s.current) - 16 * v.current) * dt;
    s.current += v.current * dt;
    if (g.current) {
      const k = Math.max(s.current, 0.0001);
      g.current.scale.setScalar(k);
      g.current.visible = s.current > 0.002 || show;
    }
  });
  return (
    <group ref={g} {...props}>
      {children}
    </group>
  );
}

function Rig({ setup, mobile }: { setup: Setup; mobile: boolean }) {
  const root = useRef<THREE.Group>(null);
  const foldOpen = useMemo<Signal>(() => ({ current: 0.82 }), []);
  const q = mobile ? 0.5 : 0.8;
  const color = (id: ProductId) => products[id].colors[0];
  const hasTablet = setup.tablet !== 'none';

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (!root.current) return;
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, Math.sin(t * 0.25) * 0.25 + pointer.x * 0.2, 3, dt);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, 0.12 - pointer.y * 0.06, 3, dt);
  });

  const isPhone = setup.phone !== 'xiaomi-fold';
  const phoneColor = color(setup.phone);
  const padScale = setup.tablet === 'pad-9' ? 0.86 : 1;
  const tabletColor = color(setup.tablet === 'none' ? 'pad-9-pro-max' : setup.tablet);

  return (
    <group ref={root} position={[0, -0.05, 0]} scale={mobile ? 0.82 : 1}>
      <Pop show={hasTablet} scale={padScale} position={[0.45, 0.42, -0.6]} rotation={[-0.12, -0.18, 0]}>
        <Tablet color={tabletColor.hex} frame={tabletColor.frame} quality={q} />
      </Pop>
      <Pop show={hasTablet && setup.extras.keyboard} scale={padScale} position={[0.45, -0.32, -0.15]} rotation={[-1.3, -0.18, 0]}>
        <Keyboard />
      </Pop>
      <Pop show={isPhone} scale={setup.phone === 'xiaomi-18-pro-max' ? 1.06 : 1} position={[-1.05, -0.08, 0.45]} rotation={[0, 0.4, 0]}>
        <Phone color={phoneColor.hex} frame={phoneColor.frame} finish={phoneColor.finish} screen="lock" quality={q} />
      </Pop>
      <Pop show={!isPhone} scale={0.9} position={[-1.1, -0.05, 0.3]} rotation={[0, 0.55, 0]}>
        <Foldable open={foldOpen} color={color('xiaomi-fold').hex} frame={color('xiaomi-fold').frame} quality={q} />
      </Pop>
      <Pop show={setup.extras.watch} scale={0.85} position={[1.4, -0.35, 0.65]} rotation={[0.1, -0.5, 0]}>
        <Watch />
      </Pop>
      <Pop show={setup.extras.buds} position={[-0.15, -0.72, 0.95]} rotation={[0.4, 0.2, 0]}>
        <Buds />
      </Pop>
      <Pop show={hasTablet && setup.extras.pen} position={[1.5, 0.3, -0.25]} rotation={[0, 0, 0.22]}>
        <Pen />
      </Pop>
    </group>
  );
}

export default function ConfiguratorScene({ setup }: { setup: Setup }) {
  const mobile = useIsMobile();
  return (
    <SceneCanvas className="absolute inset-0" z={mobile ? 6 : 5.4} label="Your selected Xiaomi devices arranged together in 3D">
      <Studio lite={mobile} />
      <Rig setup={setup} mobile={mobile} />
    </SceneCanvas>
  );
}
