'use client';

import { getConversations, getMessages } from '@/apis/conversation';
import { useQuery } from 'react-query';

export function useConversations(enabled = true) {
  return useQuery(
    ['conversations'],
    () => getConversations().then((r) => r.data),
    { enabled, refetchInterval: 30_000 }
  );
}

export function useMessages(roomId: string | null, enabled = true) {
  return useQuery(
    ['messages', roomId],
    () => getMessages(roomId!).then((r) => r.data),
    { enabled: enabled && !!roomId, refetchInterval: 5_000 }
  );
}
