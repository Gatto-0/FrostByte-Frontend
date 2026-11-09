'use client';

import { useEffect, useRef } from 'react';
import { initLightCurtain } from '@/lib/lightCurtain';

interface LightCurtainBackgroundProps {
  className: string;
  pointerTargetId?: string;
}

/**
 * Client-only sky layer for the WebGL light curtain. Pointer movement is
 * tracked against the complete hero while the canvas remains decorative.
 */
export default function LightCurtainBackground({
  className,
  pointerTargetId,
}: LightCurtainBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pointerTarget = pointerTargetId
      ? document.getElementById(pointerTargetId)
      : null;

    return initLightCurtain(container, {
      pointerTarget: pointerTarget ?? undefined,
    });
  }, [pointerTargetId]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
    />
  );
}
