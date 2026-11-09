'use client';

import { useEffect } from 'react';
import { initSiteLoader } from '@/lib/siteLoader';

const HERO_IMAGES = [
  '/scenery/farsky-clean.png',
  '/scenery/farforest-clean.png',
  '/scenery/campsite-clean.png',
  '/scenery/foreground-clean.png',
  '/scenes/Pixel-Art_Campfire_Flicker_Animation.gif',
];

export default function SiteLoader() {
  useEffect(() => {
    initSiteLoader({
      extraImages: HERO_IMAGES,
    });
  }, []);

  return null;
}
