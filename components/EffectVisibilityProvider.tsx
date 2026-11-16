'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

interface EffectVisibility {
  heroVisible: boolean;
  tabVisible: boolean;
}

const EffectVisibilityContext = createContext<EffectVisibility | null>(null);

export function EffectVisibilityProvider({ children }: { children: ReactNode }) {
  const [visibility, setVisibility] = useState<EffectVisibility>({
    heroVisible: false,
    tabVisible: true,
  });

  useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero) {
      throw new Error('EffectVisibilityProvider requires the #hero section.');
    }

    let heroVisible = false;
    const updateVisibility = () => {
      const tabVisible = !document.hidden;
      document.documentElement.dataset.tabVisible = String(tabVisible);
      setVisibility({ heroVisible: heroVisible && tabVisible, tabVisible });
    };

    const observer = new IntersectionObserver((entries) => {
      heroVisible = entries.some(
        (entry) => entry.target === hero && entry.isIntersecting,
      );
      updateVisibility();
    });

    observer.observe(hero);
    document.addEventListener('visibilitychange', updateVisibility);
    updateVisibility();

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
      delete document.documentElement.dataset.tabVisible;
    };
  }, []);

  return (
    <EffectVisibilityContext.Provider value={visibility}>
      {children}
    </EffectVisibilityContext.Provider>
  );
}

export function useEffectVisibility() {
  const visibility = useContext(EffectVisibilityContext);
  if (!visibility) {
    throw new Error('useEffectVisibility must be used inside its provider.');
  }
  return visibility;
}
