'use client';

import { useEffect } from 'react';
import { initSiteLoader } from '@/lib/siteLoader';

const HERO_IMAGES_DESKTOP = [
  '/scenery/farsky-clean.png',
  '/scenery/farforest-clean.png',
  '/scenery/campsite-clean.png',
  '/scenery/foreground-clean.png',
  '/scenery/campfire-sprite.png',
];

const HERO_IMAGES_MOBILE = [
  '/scenery/farsky-clean.png',
  '/scenery/farforest-clean.png',
  '/scenery/campsite-mobile-clean.png',
  '/scenery/campfire-sprite.png',
];

export default function SiteLoader() {
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    initSiteLoader({
      extraImages: isMobile ? HERO_IMAGES_MOBILE : HERO_IMAGES_DESKTOP,
    });
  }, []);

  return null;
}
