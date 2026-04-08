'use client';

import { getPosts } from '@/apis/post';
import { IPost } from '@/interfaces/post';
import React, { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

//--------------------------------------------------------------------------------------------
interface PostContextType {
  posts: IPost[];
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  addPost: (newPost: IPost) => void;
  updatePostCtx: (updatedPost: IPost) => void;
  setPosts: (posts: IPost[]) => void;
  isLoading: boolean;
  error: Error | null;
  refreshPosts: () => Promise<void>;
}

interface FilterType {
  str?: string;
  limit?: number;
  userId?: string;
  type?: string;
}

const PostContext = React.createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilter] = useState<FilterType>({});
  const [localPosts, setLocalPosts] = useState<IPost[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery(
    ['posts', 'feed', filter],
    () => getPosts(filter).then((r) => r.data),
    {
      onSuccess: (data) => setLocalPosts(data),
    }
  );

  const addPost = useCallback((newPost: IPost) => {
    setLocalPosts((prev) => [newPost, ...prev]);
  }, []);

  const updatePostCtx = useCallback((updatedPost: IPost) => {
    setLocalPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  }, []);

  const refreshPosts = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <PostContext.Provider
      value={{
        posts: localPosts,
        filter,
        setFilter,
        addPost,
        updatePostCtx,
        setPosts: setLocalPosts,
        isLoading,
        error: error as Error | null,
        refreshPosts,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export function usePost() {
  const context = React.useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
}
