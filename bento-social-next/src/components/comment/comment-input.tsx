'use client';

import { createComment, createReply } from '@/apis/comment';
import { useUserProfile } from '@/context/user-context';
import { IUserProfile } from '@/interfaces/user';
import React, { useState } from 'react';
import { Avatar } from '../avatar';
import { Button } from '../button';
import { Typography } from '../typography';

interface CommentInputProps {
  postId?: string;
  commentId?: string;
  parentComment?: { id: string; fullname: string } | null;
  onCommentSuccess?: () => void;
  onCancelReply?: () => void;
}

export default function CommentInput({
  postId,
  commentId,
  parentComment,
  onCommentSuccess,
  onCancelReply,
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userProfile } = useUserProfile();

  const isReplyMode = !!parentComment;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      setIsSubmitting(true);

      if (isReplyMode && commentId) {
        // Gửi reply
        await createReply(commentId, content);
      } else if (postId) {
        // Gửi comment mới
        await createComment(postId, content);
      }

      setContent('');
      onCommentSuccess?.();

      if (isReplyMode) {
        onCancelReply?.();
      }
    } catch (error) {
      console.error('Lỗi khi gửi comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex gap-2 items-start">
      <Avatar
        alt="avatar"
        src={(userProfile as IUserProfile)?.avatar || ''}
        size={40}
      />
      <div className="flex-1 flex flex-col gap-2">
        {isReplyMode && (
          <div className="flex items-center justify-between">
            <Typography level="captionsm" className="text-primary">
              Đang trả lời {parentComment.fullname}
            </Typography>
            <Button
              onClick={onCancelReply}
              className="p-0"
              child={
                <Typography level="captionsm" className="text-tertiary">
                  Hủy
                </Typography>
              }
            />
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isReplyMode ? 'Viết bình luận trả lời...' : 'Viết bình luận...'
            }
            className="flex-1 p-2 rounded-xl bg-neutral2-5 text-primary border-none outline-none"
          />
          <Button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="px-3 bg-primary text-white rounded-xl disabled:bg-neutral2-5 disabled:text-neutral2-10"
            child={
              <Typography level="captionsm">
                {isSubmitting ? 'Đang gửi...' : 'Gửi'}
              </Typography>
            }
          />
        </div>
      </div>
    </form>
  );
}
