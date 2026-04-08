'use client';

import { getTopics } from '@/apis/topic';
import { useQuery } from 'react-query';

export function useTopics() {
  return useQuery(
    ['topics'],
    () => getTopics().then((r) => r.data),
    { staleTime: 5 * 60 * 1000 }
  );
}
