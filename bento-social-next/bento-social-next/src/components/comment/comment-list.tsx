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
        
        if (response.data && response.data.length > 0) {
          setComments(prevComments =>
            prevComments.map(c =>
              c.id === commentId ? { ...c, replies: response.data } : c
            )
          );
        }
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
                <div className="flex items-center ml-10 mt-2 gap-2">
                  <button
                    onClick={() => toggleReplies(comment.id)}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {openReplies[comment.id] ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 15l-6-6-6 6"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    )}
                    <Typography level="captionsm" className="text-blue-500 hover:text-blue-600">
                      {openReplies[comment.id]
                        ? `Ẩn trả lời`
                        : `Xem ${comment.replyCount} trả lời`}
                    </Typography>
                  </button>
                </div>
              )}

              {loadingReplies[comment.id] ? (
                <div className="ml-10 mt-2 flex items-center gap-2 text-gray-500 pl-4">
                  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="6"/>
                    <line x1="12" y1="18" x2="12" y2="22"/>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                    <line x1="2" y1="12" x2="6" y2="12"/>
                    <line x1="18" y1="12" x2="22" y2="12"/>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
                  </svg>
                  <Typography level="base2m" className="text-gray-500">
                    Đang tải trả lời...
                  </Typography>
                </div>
              ) : (
                openReplies[comment.id] && comment.replies && comment.replies.length > 0 && (
                  <div className="ml-10 pl-4 border-l border-gray-200 flex flex-col gap-3">
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
