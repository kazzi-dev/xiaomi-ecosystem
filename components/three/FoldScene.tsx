'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import SceneCanvas from './SceneCanvas';
import Studio from './Studio';
import { Foldable, type Signal } from './models';
import { pointer } from '@/lib/pointer';
import { lerp, range } from '@/lib/math';
import { useIsMobile } from '@/lib/hooks';

/** Shared between the DOM drag handler and the scene. `manual` overrides scroll until the user scrolls again. */
export type FoldControl = { manual: number | null; releasedAt: number };

type Props = { progress: Signal; control: FoldControl; color: string; frame: string };

/**
 * p = 0..1 over the pinned section:
 *   0.00–0.10  fade in, closed, three-quarter view of the cover screen
 *   0.15–0.55  hinge opens 0° → 180° and the device turns to face you
 *   0.55–0.75  open: split-screen UI, drag to fold
 *   0.75–0.90  half-folds into a V and slides right for the hinge close-up
 */
function Rig({ progress, control, color, frame, mobile }: Props & { mobile: boolean }) {
  const g = useRef<THREE.Group>(null);
  const open = useMemo<Signal>(() => ({ current: 0 }), []);
  const spring = useMemo(() => ({ x: 0, v: 0, ry: -0.6, rx: 0.2 }), []);
  const { size } = useThree();

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const hingePhase = range(p, 0.75, 0.88);
    const scrollOpen = range(p, 0.15, 0.55) * (1 - 0.5 * hingePhase);

    // Scrolling away from where the user let go hands control back to the scroll.
    if (control.manual !== null && Math.abs(p - control.releasedAt) > 0.04) control.manual = null;
    const target = control.manual ?? scrollOpen;

    // Damped spring (slightly under-damped so the hinge "settles").
    const k = 140;
    const c = 15;
    spring.v += (k * (target - spring.x) - c * spring.v) * dt;
    spring.x += spring.v * dt;
    open.current = THREE.MathUtils.clamp(spring.x, -0.02, 1.02);

    const node = g.current;
    if (!node) return;
    // On md+ the copy sits on the left, so park the device right of centre and fit it to the space.
    const wide = size.width >= 768;
    const halfW = Math.tan(THREE.MathUtils.degToRad(35 / 2)) * state.camera.position.z * (size.width / size.height);
    const fitWide = THREE.MathUtils.clamp(halfW * 0.37, 0.62, 0.92);
    const face = range(p, 0.1, 0.5);
    spring.ry = THREE.MathUtils.damp(spring.ry, lerp(-0.7, 0, face) + hingePhase * -0.5 + pointer.x * 0.15, 5, dt);
    spring.rx = THREE.MathUtils.damp(spring.rx, lerp(0.2, 0.04, face) + hingePhase * 0.45 - pointer.y * 0.08, 5, dt);
    node.rotation.set(spring.rx, spring.ry, 0);
    node.position.x = wide ? lerp(halfW * 0.38, halfW * 0.3, face) + hingePhase * halfW * 0.15 : 0;
    node.position.y = Math.sin(t * 0.9) * 0.03 + (wide ? 0 : -0.45) + hingePhase * (wide ? 0 : 0.3);
    const fit = wide ? fitWide : 0.72;
    node.scale.setScalar(fit * lerp(1, 0.85, hingePhase) * (0.85 + 0.15 * range(p, 0, 0.1)));
  });

  return (
    <group ref={g}>
      <Foldable open={open} color={color} frame={frame} quality={mobile ? 0.6 : 1} />
    </group>
  );
}

export default function FoldScene(props: Props) {
  const mobile = useIsMobile();
  return (
    <SceneCanvas className="absolute inset-0" z={mobile ? 5.2 : 4.2} label="Xiaomi 18 Fold in 3D, unfolding from closed to fully open as you scroll">
      <Studio lite={mobile} />
      <Rig {...props} mobile={mobile} />
    </SceneCanvas>
  );
}
