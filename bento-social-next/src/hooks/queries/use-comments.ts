'use client';

import { getCommennts } from '@/apis/comment';
import { useQuery } from 'react-query';

export function useComments(postId: string, enabled = true) {
  return useQuery(
    ['comments', postId],
    () => getCommennts(postId).then((r) => r.data),
    { enabled: enabled && !!postId }
  );
}
