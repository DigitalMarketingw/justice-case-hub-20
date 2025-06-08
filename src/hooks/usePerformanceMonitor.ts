
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
}

export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>();
  const mountTime = useRef<number>();

  useEffect(() => {
    mountTime.current = performance.now();
    
    return () => {
      if (mountTime.current) {
        const unmountTime = performance.now();
        const totalLifetime = unmountTime - mountTime.current;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`${componentName} total lifetime: ${totalLifetime.toFixed(2)}ms`);
        }
      }
    };
  }, [componentName]);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    if (renderStartTime.current) {
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime.current;
      
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms`);
      }
    }
  });

  return {
    markRenderStart: () => {
      renderStartTime.current = performance.now();
    },
    markRenderEnd: () => {
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current;
        return renderTime;
      }
      return 0;
    }
  };
}
