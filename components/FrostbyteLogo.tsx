import React from 'react';

export type LogoVariant = 'nav' | 'hero' | 'scenery' | 'footer' | 'cta' | 'badge' | 'custom';

export interface FrostbyteLogoProps {
  variant?: LogoVariant;
  className?: string;
  glow?: boolean;
  hoverGlow?: boolean;
  alt?: string;
  ariaHidden?: boolean;
}

const variantSizes: Record<Exclude<LogoVariant, 'custom'>, string> = {
  nav: 'w-10 h-10 sm:w-12 sm:h-12',
  hero: 'w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32',
  scenery: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24',
  footer: 'w-12 h-12 sm:w-14 sm:h-14',
  cta: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28',
  badge: 'w-7 h-7 sm:w-8 sm:h-8',
};

/**
 * Reusable, pixel-crisp FROSTBYTE brand logo component.
 * Automatically handles responsive scaling, aspect ratio preservation (350:324),
 * pixel-art sharpness (`image-rendering: pixelated`), and subtle ambient glow effects.
 */
export default function FrostbyteLogo({
  variant = 'nav',
  className = '',
  glow = false,
  hoverGlow = false,
  alt = 'FROSTBYTE Logo',
  ariaHidden = false,
}: FrostbyteLogoProps) {
  const sizeClass = variant === 'custom' ? '' : variantSizes[variant];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 aspect-[350/324] ${sizeClass} ${
        glow ? 'drop-shadow-[0_0_20px_rgba(109,158,255,0.45)]' : ''
      } ${
        hoverGlow
          ? 'transition-all duration-200 hover:drop-shadow-[0_0_24px_rgba(109,158,255,0.7)] hover:scale-105'
          : ''
      } ${className}`}
      aria-hidden={ariaHidden}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo/frostbyte_p5.svg"
        alt={alt}
        className="w-full h-full object-contain [image-rendering:pixelated] select-none pointer-events-none"
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </div>
  );
}
