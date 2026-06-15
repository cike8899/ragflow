import { useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useInfiniteScroll<
  TContainer extends HTMLElement = HTMLDivElement,
>(options: UseInfiniteScrollOptions) {
  const { hasNextPage, isFetchingNextPage, onLoadMore, rootMargin, threshold } =
    options;

  const containerRef = useRef<TContainer>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { root: container, rootMargin, threshold },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore, rootMargin, threshold]);

  return { containerRef, sentinelRef };
}
