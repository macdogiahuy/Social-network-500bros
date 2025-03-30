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
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
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
        setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
        const response = await getReplies(commentId);
        const replies = response.data || [];
        setComments(prevComments =>
          prevComments.map(c =>
            c.id === commentId 
              ? { ...c, replies, replyCount: replies.length } 
              : c
          )
        );
        setOpenReplies(prev => ({ ...prev, [commentId]: true }));
      } catch (err) {
        console.error('Lỗi khi tải trả lời:', err);
      } finally {
        setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
      }
    } else {
      setOpenReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleCommentSuccess = () => {
    fetchComments();
  };

  const handleReplyAdded = (commentId: string) => {
    setOpenReplies(prev => ({
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
            <div key={comment.id} className="flex flex-col">
              <div className="mb-1">
                <CommentItem
                  data={comment}
                  onReply={setParentComment}
                  onCommentUpdated={handleCommentUpdated}
                  onCommentDeleted={handleCommentDeleted}
                  openMoreOptionsId={openMoreOptionsId}
                  setOpenMoreOptionsId={setOpenMoreOptionsId}
                />
              </div>

              {comment.replyCount > 0 && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="ml-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                  {openReplies[comment.id] ? 'Ẩn phản hồi' : `${comment.replyCount} phản hồi`}
                </button>
              )}

              {openReplies[comment.id] && (
                <div className="ml-8 mt-2">
                  {loadingReplies[comment.id] ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      <span className="text-sm">Đang tải phản hồi...</span>
                    </div>
                  ) : (
                    comment.replies && comment.replies.length > 0 && (
                      <div className="pl-4 border-l border-gray-200 flex flex-col gap-2">
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
                    )
                  )}
                </div>
              )}

              {parentComment?.id === comment.id && (
                <div className="ml-8 mt-2">
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
