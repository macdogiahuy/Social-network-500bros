'use client';

import { getPosts, getPostDetail } from '@/apis/post';
import { useQuery } from 'react-query';

interface PostFilter {
  str?: string;
  limit?: number;
  userId?: string;
  type?: string;
}

export function usePosts(filter: PostFilter = {}, enabled = true) {
  return useQuery(
    ['posts', filter],
    () => getPosts(filter).then((r) => r.data),
    { enabled }
  );
}

export function usePostDetail(id: string, enabled = true) {
  return useQuery(
    ['post', id],
    () => getPostDetail(id).then((r) => r.data),
    { enabled: enabled && !!id }
  );
}
