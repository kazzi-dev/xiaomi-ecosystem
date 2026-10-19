'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import SceneCanvas from './SceneCanvas';
import Studio from './Studio';
import { Phone, PHONE_ISLAND, type Signal } from './models';
import { pointer } from '@/lib/pointer';
import { lerp, range } from '@/lib/math';
import { useIsMobile } from '@/lib/hooks';

type Props = { progress: Signal; color: string; frame: string; finish?: 'clear' | 'matte'; isMax: boolean };

/**
 * Scroll choreography (p = 0..1 over the pinned section):
 *   0.03–0.18  rotate to show the back
 *   0.20–0.40  push in until the camera island fills the frame
 *   0.42–0.60  tilt to three-quarter view and explode the lens stack
 *   0.64–0.80  collapse, pull back out
 *   0.74–0.88  turn to face front
 *   0.84–0.99  screen lights up, lock screen crossfades into home screen
 */
function Rig({ progress, color, frame, finish, isMax, mobile }: Props & { mobile: boolean }) {
  const outer = useRef<THREE.Group>(null);
  const morph = useRef<THREE.Group>(null);
  const signals = useMemo(() => ({ explode: { current: 0 }, screenOn: { current: 0 }, home: { current: 0 } }), []);
  const v = useMemo(() => ({ island: new THREE.Vector3(), euler: new THREE.Euler(), rx: 0, ry: 0, s: 1 }), []);
  const { size } = useThree();

  useFrame((state, dt) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const g = outer.current;
    const m = morph.current;
    if (!g || !m) return;

    const toBack = range(p, 0.03, 0.18);
    const zoom = range(p, 0.2, 0.4) * (1 - range(p, 0.64, 0.8));
    const tilt = range(p, 0.42, 0.52) * (1 - range(p, 0.62, 0.72));
    const toFront = range(p, 0.74, 0.88);

    signals.explode.current = range(p, 0.45, 0.6) * (1 - range(p, 0.62, 0.7));
    signals.screenOn.current = range(p, 0.84, 0.93);
    signals.home.current = range(p, 0.92, 0.99);

    const idle = (1 - zoom) * 0.06;
    const ry = (toBack + toFront) * Math.PI - tilt * 0.6 + pointer.x * 0.18 * (1 - zoom) + Math.sin(t * 0.5) * idle;
    const rx = tilt * 0.32 - pointer.y * 0.1 * (1 - zoom);
    v.ry = THREE.MathUtils.damp(v.ry, ry, 6, dt);
    v.rx = THREE.MathUtils.damp(v.rx, rx, 6, dt);
    g.rotation.set(v.rx, v.ry, 0);

    const maxZoom = mobile ? 2.3 : 3.1;
    const s = lerp(1, maxZoom, zoom);
    g.scale.setScalar(s);

    // Keep the camera island centred while zoomed: rotate its local position, then offset the group.
    v.euler.set(v.rx, v.ry, 0);
    v.island.set(PHONE_ISLAND.x, PHONE_ISLAND.y, PHONE_ISLAND.z).multiply(m.scale).applyEuler(v.euler).multiplyScalar(s);
    const aspectShift = size.width >= 768 ? 0.55 : 0; // leave room for copy on the left on desktop
    g.position.x = lerp(aspectShift, -v.island.x, zoom);
    const below = size.width < 768 ? -0.35 : 0; // clear the headline on phones
    g.position.y = lerp(Math.sin(t * 0.9) * 0.03 + below, -v.island.y, zoom);

    const tx = isMax ? 1.045 : 1;
    const ty = isMax ? 1.085 : 1;
    m.scale.x = THREE.MathUtils.damp(m.scale.x, tx, 5, dt);
    m.scale.y = THREE.MathUtils.damp(m.scale.y, ty, 5, dt);
  });

  return (
    <group ref={outer}>
      <group ref={morph}>
        <Phone
          color={color}
          frame={frame}
          finish={finish}
          screenOn={signals.screenOn}
          homeMix={signals.home}
          explode={signals.explode}
          quality={mobile ? 0.6 : 1}
        />
      </group>
    </group>
  );
}

export default function ProScene(props: Props) {
  const mobile = useIsMobile();
  return (
    <SceneCanvas className="absolute inset-0" z={mobile ? 5.4 : 4.2} label="Xiaomi 18 Pro in 3D, rotating to reveal its camera and lens stack as you scroll">
      <Studio lite={mobile} />
      <Rig {...props} mobile={mobile} />
    </SceneCanvas>
  );
}
