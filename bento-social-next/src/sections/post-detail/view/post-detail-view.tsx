'use client';

import React from 'react';

import { IPost } from '@/interfaces/post';

import { getPostDetail } from '@/apis/post';
import { usePost } from '@/context/post-context';

import { CommentList } from '@/components/comment';
import { Post } from '@/components/post';

import eventBus from '@/utils/event-emitter';

import Header from '../header';

import styles from '@/styles/post-detail.module.css';

//-------------------------------------------------------------------------

export default function PostDetailView({ id }: { id: string }) {
  const { posts } = usePost();
  const post = posts.find((post) => post.id === id);

  const [data, setData] = React.useState<IPost | null>(null);
  const [isViewFull, setIsViewFull] = React.useState(false);

  const handleViewFullPost = () => {
    const newIsViewFull = !isViewFull;
    setIsViewFull(newIsViewFull);

    eventBus.emit('toggleSidebarRight', newIsViewFull);
  };

  const handleUpdatePost = (updatedPost: IPost) => {
    setData(updatedPost);
  };

  React.useEffect(() => {
    getPostDetail(id)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error('Lỗi khi tải thông tin bài viết:', error);
      });
  }, [id]);

  return (
    <>
      {(data || post) && (
        <section className="relative min-h-screen max-h-fit bg-surface p-3 transition-all duration-[0.5s] no-scrollbar">
          <Header onViewFullPost={handleViewFullPost} />

          <div
            className={`${isViewFull ? `${styles.viewFull}` : ''} w-full h-[calc(100svh-155px)] overflow-y-scroll no-scrollbar [mask-image:linear-gradient(180deg,#000_85%,transparent)]`}
          >
            <Post
              data={(data as IPost) ?? post}
              className="bg-neutral2-5"
              onUpdatePost={handleUpdatePost}
            />

            <div className="w-full h-fit relative my-4">
              <CommentList postId={id} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
