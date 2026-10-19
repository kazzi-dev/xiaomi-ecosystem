type Props = { text: string; className?: string; charClassName?: string };

/** Splits text into per-character spans (.char) for GSAP, while staying readable to screen readers. */
export default function SplitText({ text, className = '', charClassName = '' }: Props) {
  const words = text.split(' ');
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden whitespace-nowrap pb-[0.16em] align-bottom">
          {word.split('').map((ch, ci) => (
            <span key={ci} className={`char inline-block ${charClassName}`}>
              {ch}
            </span>
          ))}
          {wi < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
        </span>
      ))}
    </span>
  );
}
