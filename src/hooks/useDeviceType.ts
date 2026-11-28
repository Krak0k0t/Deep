import { useEffect, useState } from 'react';

function detectMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 1024 || 'ontouchstart' in window;
}

export function useDeviceType(): { isMobile: boolean } {
  const [isMobile, setIsMobile] = useState<boolean>(() => detectMobileViewport());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(detectMobileViewport());
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile };
}
