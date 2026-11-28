import { useEffect, useState } from 'react';

export interface ViewportBudget {
  width: number;
  height: number;
  isShort: boolean;
  isNarrow: boolean;
  isCompact: boolean;
}

const readViewport = (): ViewportBudget => {
  if (typeof window === 'undefined') {
    return {
      width: 1280,
      height: 800,
      isShort: false,
      isNarrow: false,
      isCompact: false,
    };
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isShort = height < 620;
  const isNarrow = width < 640;
  return {
    width,
    height,
    isShort,
    isNarrow,
    isCompact: isShort || isNarrow,
  };
};

export const useCompactViewport = (): ViewportBudget => {
  const [budget, setBudget] = useState<ViewportBudget>(() => readViewport());

  useEffect(() => {
    const onResize = () => setBudget(readViewport());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return budget;
};
