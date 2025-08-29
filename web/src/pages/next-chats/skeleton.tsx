import { SkeletonCard } from '@/components/skeleton-card';
import { PropsWithChildren, Suspense } from 'react';

export function SuspenseSkeleton({ children }: PropsWithChildren) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <SkeletonCard />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
