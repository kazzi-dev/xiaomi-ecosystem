'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { panelGeometry, slabGeometry } from './geometry';
import { getBackTexture, getScreenTexture, type ScreenKind } from './textures';

/** A mutable number shared between GSAP (writer) and useFrame (reader), so scroll never re-renders React. */
export type Signal = { current: number };

type GroupProps = JSX.IntrinsicElements['group'];

/* ------------------------------------------------------------------ */
/* Materials                                                           */
/* ------------------------------------------------------------------ */

function useDeviceMaterials(color: string, frame: string) {
  const mats = useMemo(
    () => ({
      frame: new THREE.MeshStandardMaterial({ color: frame, metalness: 0.95, roughness: 0.28 }),
      back: new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.15,
        roughness: 0.38,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        sheen: 0.4,
        sheenColor: new THREE.Color('#ffffff'),
      }),
      bezel: new THREE.MeshPhysicalMaterial({ color: '#020203', roughness: 0.08, metalness: 0.1, clearcoat: 1 }),
      lensGlass: new THREE.MeshPhysicalMaterial({
        color: '#05060c',
        metalness: 0.3,
        roughness: 0.03,
        clearcoat: 1,
        iridescence: 1,
        iridescenceIOR: 1.35,
        iridescenceThicknessRange: [200, 600],
      }),
      black: new THREE.MeshBasicMaterial({ color: '#000000' }),
    }),
    // Materials are created once; color changes are tweened in useFrame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const target = useMemo(() => ({ back: new THREE.Color(color), frame: new THREE.Color(frame) }), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    target.back.set(color);
    target.frame.set(frame);
  }, [color, frame, target]);

  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 5);
    mats.back.color.lerp(target.back, k);
    mats.frame.color.lerp(target.frame, k);
  });

  return mats;
}

function screenMaterial(map: THREE.Texture, transparent = false) {
  return new THREE.MeshBasicMaterial({ map, toneMapped: false, transparent, opacity: transparent ? 0 : 1 });
}

/* ------------------------------------------------------------------ */
/* Phone — Xiaomi 18 Pro / Pro Max                                     */
/* ------------------------------------------------------------------ */

export type Finish = 'clear' | 'matte';

export const PHONE = { w: 0.76, h: 1.6, d: 0.088, r: 0.14 };
const ISLAND = { w: 0.64, h: 0.37, r: 0.11 };
/** Camera island center in phone-local space (on the back). */
export const PHONE_ISLAND = new THREE.Vector3(0, PHONE.h / 2 - 0.065 - ISLAND.h / 2, -PHONE.d / 2 - 0.03);

// Island-local. Seen from the back, +x is the viewer's left: two stacked lenses there, the glowing chip window on the right.
const LENSES = [
  { x: 0.19, y: 0.086, r: 0.078 },
  { x: 0.19, y: -0.086, r: 0.078 },
];

type PhoneProps = GroupProps & {
  color?: string;
  frame?: string;
  finish?: Finish;
  screen?: ScreenKind;
  /** 0..1 screen brightness */
  screenOn?: Signal;
  /** 0..1 crossfade from the lock screen to the home screen */
  homeMix?: Signal;
  /** 0..1 lens stack explode */
  explode?: Signal;
  quality?: number;
};

export function Phone({ color = '#d2201c', frame = '#c8261f', finish = 'clear', screen = 'lock', screenOn, homeMix, explode, quality = 1, ...props }: PhoneProps) {
  const { w, h, d, r } = PHONE;
  const geo = useMemo(
    () => ({
      body: slabGeometry(w, h, d, r, quality),
      bezel: panelGeometry(w - 0.008, h - 0.008, r - 0.004, quality),
      screen: panelGeometry(w - 0.036, h - 0.036, r - 0.02, quality),
      back: panelGeometry(w - 0.01, h - 0.01, r - 0.005, quality),
      island: slabGeometry(ISLAND.w, ISLAND.h, 0.034, ISLAND.r, quality),
      window: panelGeometry(ISLAND.w - 0.05, ISLAND.h - 0.05, ISLAND.r - 0.025, quality),
      chip: panelGeometry(0.17, 0.15, 0.018, 0.5),
      pill: panelGeometry(0.11, 0.042, 0.021, 0.5),
      ring: new THREE.TorusGeometry(1, 0.13, 10, Math.round(40 * quality)),
      disc: new THREE.CylinderGeometry(1, 1, 1, Math.round(40 * quality)),
      sensor: new THREE.BoxGeometry(1, 1, 1),
    }),
    [w, h, d, r, quality],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const mats = useDeviceMaterials(color, frame);
  useEffect(() => {
    mats.back.map = getBackTexture(finish);
    mats.back.roughness = finish === 'clear' ? 0.28 : 0.55;
    mats.back.needsUpdate = true;
  }, [mats, finish]);

  const extra = useMemo(
    () => ({
      screen: screenMaterial(getScreenTexture(screen)),
      home: homeMix ? screenMaterial(getScreenTexture('home'), true) : null,
      elementA: new THREE.MeshPhysicalMaterial({ color: '#10203d', metalness: 0.4, roughness: 0.05, clearcoat: 1, iridescence: 0.8 }),
      elementB: new THREE.MeshPhysicalMaterial({ color: '#2a1440', metalness: 0.4, roughness: 0.05, clearcoat: 1, iridescence: 0.6 }),
      sensor: new THREE.MeshStandardMaterial({ color: '#ff6900', emissive: '#ff4d00', emissiveIntensity: 0.6, metalness: 0.5, roughness: 0.3 }),
      chip: new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.4 }),
      flash: new THREE.MeshStandardMaterial({ color: '#fff4e0', emissive: '#ffd9a0', emissiveIntensity: 0.4 }),
    }),
    [screen, homeMix],
  );
  useEffect(() => () => Object.values(extra).forEach((m) => m?.dispose()), [extra]);
  useEffect(() => {
    // The transparent edition shows its glowing internals through the island window.
    extra.chip.emissive.set(color);
    extra.chip.emissiveIntensity = finish === 'clear' ? 1.4 : 0.12;
  }, [extra, color, finish]);

  const homeMesh = useRef<THREE.Mesh>(null);
  const layers = useRef<{ obj: THREE.Object3D; base: number; k: number }[]>([]);

  useFrame(() => {
    const on = screenOn ? screenOn.current : 1;
    extra.screen.color.setScalar(0.02 + 0.98 * on);
    if (extra.home && homeMix && homeMesh.current) {
      const m = homeMix.current;
      extra.home.opacity = m * on;
      homeMesh.current.visible = m > 0.001;
      homeMesh.current.scale.setScalar(1.05 - 0.05 * m);
    }
    const e = explode ? explode.current : 0;
    for (const l of layers.current) if (l) l.obj.position.z = l.base - e * 0.075 * l.k;
  });

  const zs = PHONE_ISLAND.z + 0.003; // lens stack base
  const islandTop = -d / 2 - 0.012 - 0.017; // outer face of the island slab
  const back = -d / 2 - 0.0016;
  const belowIsland = PHONE_ISLAND.y - ISLAND.h / 2 - 0.055;
  const register = (i: number, base: number, k: number) => (obj: THREE.Object3D | null) => {
    if (obj) layers.current[i] = { obj, base, k };
  };

  return (
    <group {...props}>
      <mesh geometry={geo.body} material={mats.frame} />
      {/* Front */}
      <mesh geometry={geo.bezel} material={mats.bezel} position-z={d / 2 + 0.0006} />
      <mesh geometry={geo.screen} material={extra.screen} position-z={d / 2 + 0.0012} />
      {extra.home ? <mesh ref={homeMesh} geometry={geo.screen} material={extra.home} position-z={d / 2 + 0.0018} /> : null}
      <mesh position={[0, h / 2 - 0.06, d / 2 + 0.0024]} material={mats.black}>
        <circleGeometry args={[0.016, 24]} />
      </mesh>
      {/* Side buttons */}
      <mesh position={[w / 2 + 0.002, 0.3, 0]} material={mats.frame}>
        <boxGeometry args={[0.012, 0.16, 0.028]} />
      </mesh>
      <mesh position={[w / 2 + 0.002, 0.08, 0]} material={mats.frame}>
        <boxGeometry args={[0.012, 0.09, 0.028]} />
      </mesh>
      {/* Back: dotted / see-through panel with magnetic ring */}
      <mesh geometry={geo.back} material={mats.back} position-z={-d / 2 - 0.0006} rotation-y={Math.PI} />
      {/* Flash pill + sensor under the island */}
      <mesh geometry={geo.pill} material={mats.bezel} position={[0.2, belowIsland, back]} rotation-y={Math.PI} />
      <mesh geometry={geo.disc} material={extra.flash} position={[0.2, belowIsland, back - 0.001]} rotation-x={Math.PI / 2} scale={[0.014, 0.002, 0.014]} />
      <mesh geometry={geo.disc} material={mats.frame} position={[0.09, belowIsland, back - 0.002]} rotation-x={Math.PI / 2} scale={[0.02, 0.004, 0.02]} />
      {/* Camera island */}
      <group position={[PHONE_ISLAND.x, PHONE_ISLAND.y, 0]}>
        <mesh geometry={geo.island} material={mats.frame} position-z={-d / 2 - 0.012} />
        <mesh geometry={geo.window} material={mats.bezel} position-z={islandTop - 0.0006} rotation-y={Math.PI} />
        <mesh geometry={geo.chip} material={extra.chip} position={[-0.14, 0.02, islandTop - 0.0012]} rotation-y={Math.PI} />
        {LENSES.map((L, li) => (
          <group key={li} position={[L.x, L.y, 0]}>
            <mesh ref={register(li * 5, zs + 0.004, 0.6)} geometry={geo.sensor} material={extra.sensor} scale={[L.r * 1.25, L.r * 0.95, 0.004]} />
            <mesh ref={register(li * 5 + 1, zs - 0.001, 1.4)} geometry={geo.disc} material={extra.elementB} rotation-x={Math.PI / 2} scale={[L.r * 0.62, 0.004, L.r * 0.62]} />
            <mesh ref={register(li * 5 + 2, zs - 0.003, 2.2)} geometry={geo.disc} material={extra.elementA} rotation-x={Math.PI / 2} scale={[L.r * 0.8, 0.004, L.r * 0.8]} />
            <mesh ref={register(li * 5 + 3, zs - 0.006, 3)} geometry={geo.disc} material={mats.lensGlass} rotation-x={Math.PI / 2} scale={[L.r * 0.94, 0.006, L.r * 0.94]} />
            <mesh ref={register(li * 5 + 4, zs - 0.007, 3.1)} geometry={geo.ring} material={mats.frame} scale={[L.r, L.r, L.r * 0.6]} />
          </group>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Foldable — Xiaomi 18 Fold                                           */
/* ------------------------------------------------------------------ */

// Wide "passport" proportions: close to square when open.
export const FOLD = { w: 0.86, h: 1.14, t: 0.048, r: 0.11 };

type FoldProps = GroupProps & {
  color?: string;
  frame?: string;
  /** 0 = closed, 1 = fully open (180°) */
  open: Signal;
  quality?: number;
};

export function Foldable({ color = '#a3192b', frame = '#b02033', open, quality = 1, ...props }: FoldProps) {
  const { w, h, t, r } = FOLD;
  const s = 0.012;
  const geo = useMemo(
    () => ({
      left: slabGeometry(w, h, t, [r, s, s, r], quality),
      right: slabGeometry(w, h, t, [s, r, r, s], quality),
      innerL: panelGeometry(w - 0.02, h - 0.03, [r - 0.012, 0.002, 0.002, r - 0.012], quality),
      innerR: panelGeometry(w - 0.02, h - 0.03, [0.002, r - 0.012, r - 0.012, 0.002], quality),
      back: panelGeometry(w - 0.012, h - 0.012, [s, r, r, s], quality),
      backL: panelGeometry(w - 0.012, h - 0.012, [r, s, s, r], quality),
      cover: panelGeometry(w - 0.05, h - 0.05, r - 0.03, quality),
      pill: slabGeometry(0.66, 0.2, 0.03, 0.1, quality),
      pillGlass: panelGeometry(0.6, 0.145, 0.072, quality),
      hinge: new THREE.CylinderGeometry(t / 2, t / 2, h * 0.97, Math.round(28 * quality)),
      disc: new THREE.CylinderGeometry(1, 1, 1, 32),
      ring: new THREE.TorusGeometry(1, 0.13, 8, 32),
    }),
    [w, h, t, r, quality],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const mats = useDeviceMaterials(color, frame);
  const backMat = useMemo(() => {
    const m = mats.back.clone();
    m.map = getBackTexture('fold');
    m.roughness = 0.6;
    m.sheen = 0.2;
    return m;
  }, [mats]);
  useEffect(() => () => backMat.dispose(), [backMat]);
  const flash = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fff4e0', emissive: '#ffd9a0', emissiveIntensity: 0.4 }), []);
  useEffect(() => () => flash.dispose(), [flash]);
  const screens = useMemo(() => {
    const full = getScreenTexture('fold');
    const left = full.clone();
    left.repeat.set(0.5, 1);
    left.offset.set(0, 0);
    left.needsUpdate = true;
    const right = full.clone();
    right.repeat.set(0.5, 1);
    right.offset.set(0.5, 0);
    right.needsUpdate = true;
    return { left: screenMaterial(left), right: screenMaterial(right), cover: screenMaterial(getScreenTexture('cover')) };
  }, []);
  useEffect(
    () => () =>
      Object.values(screens).forEach((m) => {
        m.map?.dispose();
        m.dispose();
      }),
    [screens],
  );

  const root = useRef<THREE.Group>(null);
  const pivot = useRef<THREE.Group>(null);
  const hinge = useRef<THREE.Mesh>(null);

  useFrame(() => {
    backMat.color.copy(mats.back.color);
    const o = THREE.MathUtils.clamp(open.current, 0, 1);
    if (pivot.current) pivot.current.rotation.y = -(1 - o) * Math.PI;
    if (root.current) {
      root.current.position.x = (w / 2) * (1 - o);
      root.current.position.z = -(t / 2) * (1 - o);
    }
    if (hinge.current) {
      hinge.current.position.z = (t / 2) * (1 - o);
      const k = 1 + (1 - o);
      hinge.current.scale.set(k, 1, k);
    }
    const lit = 0.25 + 0.75 * THREE.MathUtils.smoothstep(o, 0.4, 0.9);
    screens.left.color.setScalar(lit);
    screens.right.color.setScalar(lit);
  });

  return (
    <group {...props}>
      <group ref={root}>
        {/* Left half (fixed): camera side */}
        <group position={[-w / 2, 0, 0]}>
          <mesh geometry={geo.left} material={mats.frame} />
          <mesh geometry={geo.innerL} material={screens.left} position-z={t / 2 + 0.001} />
          <mesh geometry={geo.backL} material={backMat} position-z={-t / 2 - 0.0008} rotation-y={Math.PI} />
          {/* Horizontal pill island: three lenses + flash (seen from the back, lenses on the left) */}
          <group position={[-0.04, h / 2 - 0.17, -t / 2 - 0.012]}>
            <mesh geometry={geo.pill} material={mats.frame} />
            <mesh geometry={geo.pillGlass} material={mats.bezel} position-z={-0.0155} rotation-y={Math.PI} />
            {[0.2, 0.065, -0.07].map((x) => (
              <group key={x} position={[x, 0, -0.018]}>
                <mesh geometry={geo.disc} material={mats.lensGlass} rotation-x={Math.PI / 2} scale={[0.048, 0.005, 0.048]} />
                <mesh geometry={geo.ring} material={mats.frame} scale={[0.052, 0.052, 0.03]} />
              </group>
            ))}
            <mesh geometry={geo.disc} material={flash} position={[-0.2, 0, -0.017]} rotation-x={Math.PI / 2} scale={[0.02, 0.003, 0.02]} />
          </group>
        </group>
        {/* Right half on the hinge pivot: cover screen side */}
        <group ref={pivot} position={[0, 0, t / 2]}>
          <group position={[w / 2, 0, -t / 2]}>
            <mesh geometry={geo.right} material={mats.frame} />
            <mesh geometry={geo.innerR} material={screens.right} position-z={t / 2 + 0.001} />
            <mesh geometry={geo.back} material={mats.bezel} position-z={-t / 2 - 0.0008} rotation-y={Math.PI} />
            <mesh geometry={geo.cover} material={screens.cover} position-z={-t / 2 - 0.0016} rotation-y={Math.PI} />
          </group>
        </group>
        <mesh ref={hinge} geometry={geo.hinge} material={mats.frame} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Tablet — Xiaomi Pad 9 / Pro Max                                     */
/* ------------------------------------------------------------------ */

export const TABLET = { w: 1.6, h: 1.06, d: 0.038, r: 0.07 };

export function Tablet({ color = '#2a2b2f', frame = '#45474d', quality = 1, ...props }: GroupProps & { color?: string; frame?: string; quality?: number }) {
  const { w, h, d, r } = TABLET;
  const geo = useMemo(
    () => ({
      body: slabGeometry(w, h, d, r, quality),
      bezel: panelGeometry(w - 0.008, h - 0.008, r - 0.004, quality),
      screen: panelGeometry(w - 0.06, h - 0.06, r - 0.03, quality),
      back: panelGeometry(w - 0.01, h - 0.01, r - 0.005, quality),
    }),
    [w, h, d, r, quality],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);
  const mats = useDeviceMaterials(color, frame);
  const screen = useMemo(() => screenMaterial(getScreenTexture('tablet')), []);
  useEffect(() => () => screen.dispose(), [screen]);

  return (
    <group {...props}>
      <mesh geometry={geo.body} material={mats.frame} />
      <mesh geometry={geo.bezel} material={mats.bezel} position-z={d / 2 + 0.0006} />
      <mesh geometry={geo.screen} material={screen} position-z={d / 2 + 0.0012} />
      <mesh geometry={geo.back} material={mats.back} position-z={-d / 2 - 0.0006} rotation-y={Math.PI} />
      <group position={[w / 2 - 0.14, h / 2 - 0.14, -d / 2 - 0.008]}>
        <mesh material={mats.frame} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.07, 0.07, 0.016, 32]} />
        </mesh>
        <mesh material={mats.lensGlass} position-z={-0.009} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.04, 0.04, 0.004, 32]} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Accessories                                                         */
/* ------------------------------------------------------------------ */

export function Watch({ frame = '#3a3a40', ...props }: GroupProps & { frame?: string }) {
  const mats = useDeviceMaterials('#111114', frame);
  const face = useMemo(() => screenMaterial(getScreenTexture('watch')), []);
  const strap = useMemo(() => slabGeometry(0.26, 0.42, 0.035, 0.06, 0.6), []);
  useEffect(
    () => () => {
      face.dispose();
      strap.dispose();
    },
    [face, strap],
  );
  return (
    <group {...props}>
      <mesh material={mats.frame} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.24, 0.24, 0.08, 48]} />
      </mesh>
      <mesh material={mats.bezel} position-z={0.0405}>
        <circleGeometry args={[0.215, 48]} />
      </mesh>
      <mesh material={face} position-z={0.0415}>
        <circleGeometry args={[0.19, 48]} />
      </mesh>
      <mesh material={mats.frame} position={[0.25, 0.04, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.025, 0.025, 0.04, 16]} />
      </mesh>
      <mesh geometry={strap} material={mats.back} position={[0, 0.4, -0.01]} />
      <mesh geometry={strap} material={mats.back} position={[0, -0.4, -0.01]} />
    </group>
  );
}

export function Buds(props: GroupProps) {
  const geo = useMemo(() => slabGeometry(0.34, 0.27, 0.14, 0.1, 0.8), []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#f2f2f0', roughness: 0.3, clearcoat: 0.6 }), []);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  return (
    <group {...props}>
      <mesh geometry={geo} material={mat} />
      <mesh position={[0, 0.03, 0.071]}>
        <planeGeometry args={[0.3, 0.004]} />
        <meshBasicMaterial color="#b9b9b6" />
      </mesh>
      <mesh position={[0, -0.06, 0.071]}>
        <circleGeometry args={[0.008, 16]} />
        <meshBasicMaterial color="#ff6900" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Pen(props: GroupProps) {
  return (
    <group {...props}>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 1, 24]} />
        <meshPhysicalMaterial color="#e9e9ec" roughness={0.25} clearcoat={0.8} />
      </mesh>
      <mesh position-y={-0.54}>
        <coneGeometry args={[0.02, 0.08, 24]} />
        <meshStandardMaterial color="#2a2a2e" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position-y={0.35}>
        <cylinderGeometry args={[0.0205, 0.0205, 0.04, 24]} />
        <meshStandardMaterial color="#ff6900" />
      </mesh>
    </group>
  );
}

export function Keyboard(props: GroupProps) {
  const body = useMemo(() => slabGeometry(TABLET.w, 0.62, 0.03, 0.05, 0.8), []);
  const keys = useRef<THREE.InstancedMesh>(null);
  const cols = 13;
  const rows = 4;
  useEffect(() => {
    const m = new THREE.Matrix4();
    let i = 0;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        m.makeTranslation(-0.66 + c * 0.11, 0.2 - r * 0.11, 0.018);
        keys.current?.setMatrixAt(i++, m);
      }
    if (keys.current) keys.current.instanceMatrix.needsUpdate = true;
  }, []);
  useEffect(() => () => body.dispose(), [body]);
  return (
    <group {...props}>
      <mesh geometry={body}>
        <meshStandardMaterial color="#1c1c20" roughness={0.8} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, cols * rows]}>
        <boxGeometry args={[0.09, 0.09, 0.008]} />
        <meshStandardMaterial color="#2c2c31" roughness={0.6} />
      </instancedMesh>
    </group>
  );
}
