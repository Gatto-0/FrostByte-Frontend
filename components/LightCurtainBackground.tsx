'use client';

import { useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    return initLightCurtain(container);
  }, []);

  return (
    <div
      ref={containerRef}
      className={className ?? "absolute -top-[18%] inset-x-0 bottom-0 z-[2] pointer-events-none"}
      style={{ top: '-18%', ...style }}
      aria-hidden="true"
    />
  );
}
