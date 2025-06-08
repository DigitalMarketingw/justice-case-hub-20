
import { useState, useEffect, useCallback } from 'react';

interface UseVirtualizationProps {
  itemHeight: number;
  containerHeight: number;
  items: any[];
  overscan?: number;
}

export function useVirtualization({
  itemHeight,
  containerHeight,
  items,
  overscan = 5
}: UseVirtualizationProps) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    handleScroll
  };
}
