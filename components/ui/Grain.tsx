export default function Grain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden opacity-[0.07] mix-blend-overlay">
      <div className="grain absolute -inset-[20%]" />
    </div>
  );
}
