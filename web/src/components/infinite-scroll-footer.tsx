import { Loader2 } from 'lucide-react';

interface InfiniteScrollFooterProps {
  sentinelRef: React.RefObject<HTMLDivElement>;
  isFetchingNextPage?: boolean;
}

export function InfiniteScrollFooter({
  sentinelRef,
  isFetchingNextPage,
}: InfiniteScrollFooterProps) {
  return (
    <>
      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-text-secondary" />
        </div>
      )}
    </>
  );
}
