import { InfiniteScrollFooter } from '@/components/infinite-scroll-footer';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/input';
import { useInfiniteScroll } from '@/hooks/logic-hooks/use-infinite-scroll';
import { useDebounce } from 'ahooks';
import { Plus } from 'lucide-react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectDerivedSessionList } from '../hooks/use-select-derived-session-list';
import { SessionCard } from './session-card';

interface SessionListProps {
  selectedSessionId?: string;
  selectedIsNew?: boolean;
  onSelectSession: (sessionId: string, isNew?: boolean) => void;
}

export function SessionList({
  selectedSessionId = '',
  selectedIsNew = false,
  onSelectSession,
}: SessionListProps) {
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState('');
  const searchKeyword = useDebounce(searchInput, { wait: 300 });

  const {
    sessions,
    loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    pageCount,
    addTemporarySession,
    removeTemporarySession,
  } = useSelectDerivedSessionList(searchKeyword);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
    },
    [],
  );

  const { containerRef: listContainerRef, sentinelRef } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
  });

  const previousSelectedSessionIdRef = useRef(selectedSessionId);
  const previousSelectedIsNewRef = useRef(selectedIsNew);
  const previousPageCountRef = useRef(pageCount);

  // Scroll to the top of the list when the cached session data is reset to the
  // first page (e.g. right after creating a new session while scrolled deep into
  // the list). This must happen in a layout effect so the container is already
  // at the top before the infinite-scroll IntersectionObserver is set up,
  // otherwise the sentinel at the bottom would trigger an immediate fetch of
  // the next page.
  useLayoutEffect(() => {
    const previousPageCount = previousPageCountRef.current;
    previousPageCountRef.current = pageCount;

    if (previousPageCount > 1 && pageCount === 1) {
      listContainerRef.current?.scrollTo({ top: 0 });
    }
  }, [listContainerRef, pageCount]);

  // Scroll to the top of the list after a temporary session is replaced by a
  // real one (i.e. right after creating an agent session while scrolled deep
  // into the list). Using useLayoutEffect ensures the scroll happens before the
  // infinite-scroll IntersectionObserver is set up, so the sentinel at the
  // bottom does not trigger an immediate fetch of the next page.
  useLayoutEffect(() => {
    const previousSelectedIsNew = previousSelectedIsNewRef.current;
    previousSelectedSessionIdRef.current = selectedSessionId;
    previousSelectedIsNewRef.current = selectedIsNew;

    if (previousSelectedIsNew && !selectedIsNew && selectedSessionId) {
      listContainerRef.current?.scrollTo({ top: 0 });
    }
  }, [listContainerRef, selectedSessionId, selectedIsNew]);

  return (
    <section className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold">{t('explore.sessions')}</h2>
          <span className="text-xs text-text-secondary">{sessions.length}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={addTemporarySession}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="mb-4">
        <SearchInput
          placeholder={t('explore.searchSessions')}
          onChange={handleSearchChange}
          value={searchInput}
        />
      </div>
      <div ref={listContainerRef} className="flex-1 overflow-auto space-y-3">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            selected={session.id === selectedSessionId}
            onClick={() => onSelectSession(session.id, session.is_new)}
            removeTemporarySession={removeTemporarySession}
          />
        ))}
        <InfiniteScrollFooter
          sentinelRef={sentinelRef}
          isFetchingNextPage={isFetchingNextPage}
        />
        {!loading && sessions.length === 0 && (
          <div className="text-center text-text-secondary py-8">
            {searchKeyword
              ? t('explore.noSessionsFound')
              : t('explore.noSessionsFound')}
          </div>
        )}
      </div>
    </section>
  );
}
