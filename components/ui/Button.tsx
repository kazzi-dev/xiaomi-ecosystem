'use client';

import Magnetic from './Magnetic';

type Props = {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
};

export default function Button({ children, variant = 'primary', onClick, type = 'button', className = '' }: Props) {
  const base =
    'focus-ring group relative inline-flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-300';
  const look =
    variant === 'primary'
      ? 'bg-mi text-ink hover:bg-white'
      : 'border border-white/15 text-white hover:border-white/40 hover:bg-white/5';
  return (
    <Magnetic>
      <button type={type} onClick={onClick} className={`${base} ${look} ${className}`}>
        <span className="relative">{children}</span>
        <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" className="relative transition-transform duration-300 group-hover:translate-x-1">
          <path d="M1 7h11M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      </button>
    </Magnetic>
  );
}
