# Xiaomi Ecosystem 2026 — concept site

An immersive, scroll-driven showcase for Xiaomi 18 Pro / Pro Max, Xiaomi 18 Fold, Xiaomi Pad 9 / Pad 9 Pro Max and the HyperOS ecosystem.

Designed & built by **Kazzi** · [GitHub](https://github.com/kazzi-dev) · [Instagram](https://www.instagram.com/kazzx_kun) · [TikTok](https://www.tiktok.com/@kazzzutoo)

## Why I built this

I've been a Xiaomi fan for years and use Xiaomi devices every day. I love how their phones, tablets, wearables and smart home gear all work together, so I wanted to build the kind of launch page I'd want to see for them myself.

This project is also a showcase of my front-end skills:

- **3D in the browser:** every device (18 Pro Max, 18 Fold, Pad 9, Watch, Buds) is modelled in code with React Three Fiber, using no downloaded model files.
- **Scroll-driven storytelling:** pinned GSAP ScrollTrigger timelines drive camera moves, an exploded lens view, a hinge that unfolds as you scroll, and a tablet that becomes the page.
- **Interaction design:** a drag-to-fold spring hinge, a pressure-style drawing canvas, phone-to-Pad drag-and-drop with particle trails, a night-mode before/after slider and a live 3D configurator.
- **Craft and performance:** smooth scrolling with Lenis, lazy-loaded 3D scenes that pause off-screen, responsive layouts from phone to desktop, keyboard access and reduced-motion support.

> Fan-made concept. Not affiliated with or endorsed by Xiaomi. Every spec and price lives in `data/products.ts` and is a placeholder until official figures are confirmed.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 (Next picks the next free port if 3000 is busy)
npm run build && npm start
```

Requires Node 18.17+.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · GSAP + ScrollTrigger · Lenis · React Three Fiber + Drei · Framer Motion (UI micro-interactions such as the ecosystem detail card).

## Project structure

```
app/
  layout.tsx            fonts (Inter Tight + Inter), metadata
  page.tsx              section order
  globals.css           tokens, glass, grain, glow, reduced-motion rules
data/
  products.ts           ALL product names, specs, colours, prices, callouts, ecosystem nodes
lib/
  gsap.ts               registers ScrollTrigger once
  hooks.ts              media queries, in-view, preloader event, scrollToId
  math.ts               range()/lerp() helpers used by the 3D choreography
  pointer.ts            window-level pointer for 3D parallax
components/
  ui/                   Preloader, Navbar (+progress bar), SectionDots, Cursor, Magnetic, Button,
                        SplitText, CountUp, LazyMount, SmoothScroll (Lenis), Grain
  three/
    models.tsx          parametric Phone, Foldable, Tablet, Watch, Buds, Pen, Keyboard
    textures.ts         procedural screen content drawn on <canvas>
    geometry.ts         rounded slab/panel geometry
    Studio.tsx          lights + procedural environment map (no HDR download)
    SceneCanvas.tsx     shared <Canvas>: transparent, dpr cap, pauses off-screen
    HeroScene / ProScene / FoldScene / ConfiguratorScene
  sections/             Hero, Pro (+CameraDemo), Fold, Pad (+DrawingCanvas), PadDetails,
                        Ecosystem (+TransferDemo), Compare, Configurator, Footer
```

## How the scroll animation works

Every pinned section follows the same pattern:

1. A GSAP timeline with `scrollTrigger: { pin: true, scrub }` animates the DOM copy.
2. Its `onUpdate` writes the timeline progress (0–1) into a plain `{ current }` object (a `Signal`).
3. The 3D scene reads that signal inside `useFrame` and maps sub-ranges to motion with `range(p, start, end)`, then damps toward the target. Scroll never triggers a React re-render.

To retime a beat, change the numbers in `range(...)` in the scene file and the matching position argument in the section's timeline. Each scene has a comment block listing its beats.

| Section | Pin length | Where to tweak |
|---|---|---|
| Hero | `+=130%` | `components/sections/Hero.tsx`, `three/HeroScene.tsx` (`ORBITERS`) |
| 18 Pro | `+=300%` | `sections/Pro.tsx`, `three/ProScene.tsx` |
| Fold | `+=280%` | `sections/Fold.tsx`, `three/FoldScene.tsx` (spring `k`/`c`) |
| Pad | `+=220%` | `sections/Pad.tsx` (CSS 3D, no WebGL) |
| Pad use cases | width of track | `sections/PadDetails.tsx` |

Pinned sections must be created in page order. Keep each pinned component a sibling in `app/page.tsx`. Don't nest one inside another, because React runs child effects first.

## Swapping in real 3D models

The site ships with parametric models so it works with zero assets. To use real ones:

1. Put `.glb` files in `public/models/` (for example `xiaomi-18-pro.glb`).
2. In the scene file, replace `<Phone … />` with a loader component:

```tsx
import { useGLTF } from '@react-three/drei';

function Xiaomi18Pro(props: JSX.IntrinsicElements['group']) {
  const { scene } = useGLTF('/models/xiaomi-18-pro.glb');
  return <primitive object={scene} {...props} />;
}
useGLTF.preload('/models/xiaomi-18-pro.glb');
```

`SceneCanvas` already wraps children in `<Suspense>`. To fall back to the parametric model while loading or if the file is missing, wrap the loader in an error boundary and render `<Phone />` as its fallback. Scale the model so its height is about 1.56 units (the parametric phone's size) and the choreography lines up unchanged. The camera-centring maths in `ProScene` uses `PHONE_ISLAND`. Update it to your model's camera position.

## Swapping in real screen images

Screens are drawn procedurally in `components/three/textures.ts`. To use a screenshot instead:

```ts
const tex = new THREE.TextureLoader().load('/screens/lock.png');
tex.colorSpace = THREE.SRGBColorSpace;
```

and pass it as the `map` of the screen material in `models.tsx`.

## Accessibility and performance

- `prefers-reduced-motion`: pins and scrubbing are skipped, 3D scenes show their final state, the cursor/grain/glow animations are off.
- Every interactive demo has a keyboard path (zoom dial is a `role="slider"`, photos send on Enter, fold has a button).
- 3D scenes are code-split (`next/dynamic`), mounted only near the viewport (`LazyMount`), render only while visible, and cap DPR at 2 (1.5 on touch devices). Mobile uses lower-poly geometry and fewer lights.
- On touch screens, drawing on the Pad needs the **Draw** toggle so the canvas never traps page scrolling.

## License

Copyright (c) 2026 Kazzi. All rights reserved. See [LICENSE](LICENSE). The code may not be copied or reused without Kazzi's written permission.
