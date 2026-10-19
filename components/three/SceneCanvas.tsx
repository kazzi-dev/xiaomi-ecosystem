'use client';

import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useInView, useIsMobile } from '@/lib/hooks';

type Props = {
  children: React.ReactNode;
  className?: string;
  fov?: number;
  z?: number;
  label: string;
};

/**
 * Canvas wrapper shared by every 3D section: transparent background, capped
 * pixel ratio, and rendering paused whenever the canvas is off-screen.
 */
export default function SceneCanvas({ children, className = '', fov = 35, z = 4.2, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, '150px');
  const mobile = useIsMobile();

  return (
    <div ref={ref} className={className} role="img" aria-label={label}>
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, mobile ? 1.5 : 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, z], fov, near: 0.1, far: 50 }}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
