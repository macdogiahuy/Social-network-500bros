'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { usePosts } from '@/hooks/queries/use-posts';
import { useTopics } from '@/hooks/queries/use-topics';

import { IPost } from '@/interfaces/post';

import { SplashScreen } from '@/components/loading-screen';
import { Button } from '@/components/button';
import { ArrowBackIcon } from '@/components/icons';
import SearchInput from '@/components/search-input/search-input';
import { EmptyContent } from '@/components/empty-content';
import { Typography } from '@/components/typography';

import FilterBar from '../filter-bar';
import ExploreCard from '../explore-card';

//-----------------------------------------------------------------------------------------------

export default function ExploreView() {
  const router = useRouter();
  const [searchStr, setSearchStr] = React.useState<string>('');
  const [selectedTag, setSelectedTag] = React.useState<string>('All');

  const { data: posts = [], isLoading, error } = usePosts({ str: searchStr, type: 'media' });
  const { data: topicsData } = useTopics();
  const topics = ['All', ...(topicsData?.map((t) => t.name) ?? [])];

  const filteredPosts = selectedTag === 'All'
    ? posts
    : posts.filter((post) => post.topic.name === selectedTag);

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
  };

  return (
    <section className="w-full min-h-screen max-h-fit flex flex-col p-3 gap-3 bg-surface">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => router.back()}
          className="size-[44px]"
          child={<ArrowBackIcon />}
        />
        <SearchInput
          placeholder="Search posts..."
          search={searchStr}
          setSearch={setSearchStr}
        />
      </div>
      <FilterBar tagNames={topics} onTagSelect={handleTagSelect} />
      {isLoading ? (
        <SplashScreen />
      ) : error ? (
        <p>Error: {(error as Error).message}</p>
      ) : filteredPosts.length === 0 || posts.length === 0 ? (
        <EmptyContent
          content={
            <Typography level="base2sm" className="text-secondary">
              No post
            </Typography>
          }
        />
      ) : (
        <div
          style={{ alignItems: 'start' }}
          className="w-full max-h-fit pb-[5rem] overflow-y-scroll flex flex-col gap-2 md:pb-0 md:grid md:grid-cols-2 2xl:grid-cols-2 no-scrollbar scroll-smooth"
        >
          {filteredPosts.map((post: IPost) => (
            <ExploreCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
