'use client';
import React from 'react';

import { getPosts } from '@/apis/post';
import { useUserProfile } from '@/context/user-context';
import { IPost } from '@/interfaces/post';
import { SplashScreen } from '@/components/loading-screen';

import ToggleGroup from '@/components/toggle-group/toggle-group';
import ActivityFeed from '@/components/user-activity-feed/user-activity-feed';

import ProfileHead from '../profile-components/header';
import UserInfo from '../profile-components/user-info';

//--------------------------------------------------------------------------------------------------------

export default function ProfileView() {
  const { userProfile, loading: isProfileLoading, error: profileError } = useUserProfile();
  const [posts, setPosts] = React.useState<IPost[]>([]);
  const [postMedia, setPostMedia] = React.useState<IPost[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [params, setParams] = React.useState<Record<string, string | boolean>>({
    userId: '',
  });
  const [contentType, setContentType] = React.useState<'post' | 'media'>(
    'post'
  );
  const [isDeleted, setIsDeleted] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!userProfile?.id) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getPosts({ ...params, userId: userProfile.id });
        setPosts(data.data);
        setPostMedia(data.data.filter((post) => post.type === 'media'));
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed load posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [params, userProfile, isDeleted]);

  if (isProfileLoading) return <SplashScreen />;

  if (!userProfile || profileError) {
    return (
      <section className="relative w-full h-fit min-h-svh overflow-hidden p-6 text-tertiary">
        Failed to load profile.
      </section>
    );
  }

  const handleToggle = (key: string) => {
    switch (key) {
      case 'posts':
        setParams({});
        setContentType('post');
        break;
      case 'featured':
        setParams({ isFeatured: true });
        setContentType('post');
        break;
      case 'media':
        setParams({ type: 'media' });
        setContentType('media');
        break;
      default:
        console.warn(`Unexpected key: ${key}`);
    }
  };

  return (
    <section className="relative w-full h-fit min-h-svh overflow-hidden">
      <ProfileHead />
      <UserInfo user={userProfile} />
      <ToggleGroup
        items={[
          { key: 'posts', label: 'Posts' },
          { key: 'featured', label: 'Featured' },
          { key: 'media', label: 'Media' },
        ]}
        className="z-[2] mb-3 relative"
        onChange={handleToggle}
      />
      <div className="px-3 gap-5 h-fit no-scrollbar">
        <ActivityFeed
          contentType={contentType}
          data={
            contentType === 'media'
              ? (postMedia as IPost[])
              : (posts as IPost[])
          }
          loading={loading}
          err={error}
          onDeleted={setIsDeleted}
        />
      </div>
    </section>
  );
}
