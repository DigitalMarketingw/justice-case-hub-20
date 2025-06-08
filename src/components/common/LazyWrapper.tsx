
import { Suspense, ComponentType, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "./ErrorBoundary";

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  const defaultFallback = (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Helper function to create lazy components with error boundaries
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn);
  
  return function WrappedComponent(props: React.ComponentProps<T>) {
    return (
      <LazyWrapper>
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  };
}
