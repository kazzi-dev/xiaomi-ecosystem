/** Creator signature: a vertical tag on the left edge, mirroring the section dots on the right. */
export default function MadeBy() {
  return (
    <p
      className="pointer-events-none fixed left-4 top-1/2 z-[60] hidden origin-center -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-[11px] uppercase tracking-[0.3em] text-white/40 lg:block"
      style={{ transformOrigin: 'center' }}
    >
      Designed &amp; built by <span className="font-semibold text-mi">Kazzi</span> · © 2026
    </p>
  );
}
