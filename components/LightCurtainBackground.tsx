'use client';

import { useEffect, useState } from 'react';
import { initLightCurtain } from '@/lib/lightCurtain';

interface LightCurtainBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Client-only wrapper for the WebGL light curtain. The canvas remains
 * decorative so foreground controls stay readable and interactive.
 */
export default function LightCurtainBackground({
  className,
  style,
}: LightCurtainBackgroundProps = {}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const updateMobile = () => setIsMobile(mobileQuery.matches);
    updateMobile();
    mobileQuery.addEventListener('change', updateMobile);
    return () => {
      mobileQuery.removeEventListener('change', updateMobile);
    };
  }, []);

  return (
    <div
      ref={setContainer}
      className={className ?? "absolute -top-[18%] inset-x-0 bottom-0 z-[2] pointer-events-none"}
      style={{ top: '-2%', touchAction: 'pan-y', ...style }}
      aria-hidden="true"
    >
      {isMobile === false && container && (
        <LightCurtainEffect container={container} />
      )}
    </div>
  );
}

function LightCurtainEffect({ container }: { container: HTMLDivElement }) {
  useEffect(() => {
    const stop = initLightCurtain(container);
    const canvas = container.querySelector('canvas');
    if (canvas) {
      canvas.style.pointerEvents = 'none';
      canvas.style.touchAction = 'pan-y';
    }
    return stop;
  }, [container]);

  return null;
}
