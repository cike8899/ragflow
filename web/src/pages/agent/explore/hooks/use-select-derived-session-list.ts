import { useFetchSessionsByCanvasId } from '@/hooks/use-agent-request';
import { IAgentLogResponse } from '@/interfaces/database/agent';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useExploreUrlParams } from './use-explore-url-params';

export const useSelectDerivedSessionList = (keywords?: string) => {
  const [temporarySession, setTemporarySession] = useState<
    (IAgentLogResponse & { is_new?: boolean }) | null
  >(null);

  const {
    data: sessions = [],
    loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    pageCount,
  } = useFetchSessionsByCanvasId({ keywords });

  const { sessionId, setSessionId } = useExploreUrlParams();

  // Remove the local temporary session once a real session is selected,
  // so the newly created session from the server replaces the placeholder.
  useEffect(() => {
    if (temporarySession && sessionId) {
      setTemporarySession(null);
    }
  }, [temporarySession, sessionId]);

  const addTemporarySession = useCallback(() => {
    const now = Date.now() / 1000;

    const tempSession: IAgentLogResponse & { is_new?: boolean } = {
      id: '',
      message: [],
      create_date: '',
      create_time: now,
      update_date: '',
      update_time: now,
      round: 0,
      thumb_up: 0,
      errors: '',
      source: '',
      user_id: '',
      dsl: '',
      reference: {} as import('@/interfaces/database/chat').IReference,
      name: '',
      version_title: '',
      is_new: true,
    };

    setTemporarySession(tempSession);
    setSessionId('', true);
  }, [setSessionId]);

  const removeTemporarySession = useCallback((sessionId: string) => {
    setTemporarySession((prev) => (prev?.id === sessionId ? null : prev));
  }, []);

  const derivedSessions = useMemo(() => {
    return temporarySession ? [temporarySession, ...sessions] : sessions;
  }, [temporarySession, sessions]);

  return {
    sessions: derivedSessions,
    loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    pageCount,
    addTemporarySession,
    removeTemporarySession,
  };
};
