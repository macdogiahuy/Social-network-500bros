'use client';

import { getComments, getReplies } from '@/apis/comment';
import { ICommment } from '@/interfaces/comment';
import { useEffect, useState } from 'react';
import { Typography } from '../typography';
import CommentInput from './comment-input';
import CommentItem from './comment-item';

interface CommentListProps {
  postId: string;
}

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<ICommment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parentComment, setParentComment] = useState<{
    id: string;
    fullname: string;
  } | null>(null);
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const [openMoreOptionsId, setOpenMoreOptionsId] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getComments(postId);
      const commentsWithReplies = (response.data || []).map(comment => ({
        ...comment,
        replies: comment.replies || []
      }));
      setComments(commentsWithReplies);
    } catch (err) {
      console.error('Lỗi khi tải bình luận:', err);
      setError('Không thể tải bình luận. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const toggleReplies = async (commentId: string) => {
    if (!openReplies[commentId]) {
      try {
        const response = await getReplies(commentId);
        console.log('Replies response:', response); // Debug log

        setComments((prevComments) =>
          prevComments.map((c) =>
            c.id === commentId ? { ...c, replies: response.data || [] } : c
          )
        );
      } catch (err) {
        console.error('Lỗi khi tải trả lời:', err);
      }
    }

    setOpenReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleCommentSuccess = () => {
    fetchComments();
  };

  const handleReplyAdded = (commentId: string) => {
    setOpenReplies((prev) => ({
      ...prev,
      [commentId]: true,
    }));
    fetchComments();
  };

  const handleCommentUpdated = () => {
    fetchComments();
  };

  const handleCommentDeleted = () => {
    fetchComments();
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return (
    <div className="w-full mt-4">
      <div className="mb-4">
        <CommentInput
          postId={postId}
          commentId={parentComment?.id}
          parentComment={parentComment}
          onCommentSuccess={handleCommentSuccess}
          onCancelReply={() => setParentComment(null)}
        />
      </div>

      {loading && !comments.length ? (
        <Typography level="base2m" className="text-center text-tertiary my-4">
          Đang tải bình luận...
        </Typography>
      ) : error ? (
        <Typography level="base2m" className="text-center text-red-500 my-4">
          {error}
        </Typography>
      ) : comments.length === 0 ? (
        <Typography level="base2m" className="text-center text-tertiary my-4">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </Typography>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex flex-col gap-3">
              <CommentItem
                data={comment}
                onReply={setParentComment}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
                openMoreOptionsId={openMoreOptionsId}
                setOpenMoreOptionsId={setOpenMoreOptionsId}
              />

              {comment.replyCount > 0 && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="self-start ml-10 text-tertiary hover:underline"
                >
                  <Typography level="captionsm">
                    {openReplies[comment.id]
                      ? `Ẩn ${comment.replyCount} trả lời`
                      : `Xem ${comment.replyCount} trả lời`}
                  </Typography>
                </button>
              )}

              {openReplies[comment.id] && comment.replies && comment.replies.length > 0 && (
                <div className="ml-10 flex flex-col gap-3">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      data={reply}
                      isReply
                      onCommentUpdated={handleCommentUpdated}
                      onCommentDeleted={handleCommentDeleted}
                      openMoreOptionsId={openMoreOptionsId}
                      setOpenMoreOptionsId={setOpenMoreOptionsId}
                    />
                  ))}
                </div>
              )}

              {parentComment?.id === comment.id && (
                <div className="ml-10">
                  <CommentInput
                    commentId={comment.id}
                    parentComment={parentComment}
                    onCommentSuccess={() => handleReplyAdded(comment.id)}
                    onCancelReply={() => setParentComment(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
