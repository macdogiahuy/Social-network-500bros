'use client';

import {
  deleteComment,
  likeComment,
  unlikeComment,
  updateComment,
} from '@/apis/comment';
import { useUserProfile } from '@/context/user-context';
import { IChilrenComment, ICommment } from '@/interfaces/comment';
import { IUserProfile } from '@/interfaces/user';
import { relativeTime } from '@/utils/relative-time';
import Link from 'next/link';
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../alert-dialog';
import { Avatar } from '../avatar';
import { Button } from '../button';
import { HeartIcon, MoreIcon } from '../icons';
import { MoreOptions } from '../post/components/more-options';
import { ReactItem } from '../post/react-item';
import { Typography } from '../typography';

interface CommentItemProps {
  data: ICommment | IChilrenComment;
  isReply?: boolean;
  onReply?: (comment: { id: string; fullname: string }) => void;
  onCommentUpdated?: () => void;
  onCommentDeleted?: () => void;
  openMoreOptionsId?: string | null;
  setOpenMoreOptionsId?: (id: string | null) => void;
}

export default function CommentItem({
  data,
  isReply = false,
  onReply,
  onCommentUpdated,
  onCommentDeleted,
  openMoreOptionsId,
  setOpenMoreOptionsId,
}: CommentItemProps) {
  const { userProfile } = useUserProfile();
  const [localData, setLocalData] = useState(data);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(data.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  const handleMoreOptions = () => {
    setOpenMoreOptionsId?.(openMoreOptionsId === data.id ? null : data.id);
  };

  const handleLikeClick = async () => {
    try {
      // Cập nhật UI trước
      const newLikedCount =
        localData.likedCount + (localData.hasLiked ? -1 : 1);
      const updatedData = {
        ...localData,
        hasLiked: !localData.hasLiked,
        likedCount: newLikedCount,
      };

      setLocalData(updatedData);

      // Gửi request đến server
      if (localData.hasLiked) {
        await unlikeComment(localData.id);
      } else {
        await likeComment(localData.id);
      }
    } catch (error) {
      console.error('Lỗi khi thả tim comment:', error);
      // Khôi phục lại trạng thái cũ nếu có lỗi
      setLocalData(localData);
    }
  };

  const handleReplyClick = () => {
    if (onReply) {
      onReply({
        id: data.id,
        fullname: `${data.author.firstName} ${data.author.lastName}`,
      });
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editContent.trim() || editContent === data.content) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await updateComment(data.id, editContent);

      const updatedData = {
        ...localData,
        content: editContent,
      };

      setLocalData(updatedData);
      setIsEditing(false);
      onCommentUpdated?.();
    } catch (error) {
      console.error('Lỗi khi cập nhật comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    try {
      await deleteComment(data.id);
      onCommentDeleted?.();
    } catch (error) {
      console.error('Lỗi khi xóa comment:', error);
    } finally {
      setIsConfirmDelete(false);
    }
  };

  return (
    <div className={`w-full flex gap-2 ${isReply ? 'pl-8' : ''}`}>
      <Link href={`/profile/${localData.author.id}`}>
        <Avatar alt="avatar" src={localData.author.avatar || ''} size={32} />
      </Link>

      <div className="flex-1">
        <div className="bg-neutral2-5 rounded-xl p-2 relative">
          <div className="flex items-center justify-between">
            <Link href={`/profile/${localData.author.id}`}>
              <Typography level="base2m" className="text-primary font-bold">
                {localData.author.firstName} {localData.author.lastName}
              </Typography>
            </Link>

            {localData.author.id === (userProfile as IUserProfile).id && (
              <MoreIcon onClick={handleMoreOptions} />
            )}

            {openMoreOptionsId === data.id && (
              <MoreOptions
                onEdit={() => setIsEditing(true)}
                onDelete={() => setIsConfirmDelete(true)}
              />
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmitEdit} className="mt-2">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 rounded-lg bg-neutral2-2 text-primary border-none outline-none"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  onClick={() => setIsEditing(false)}
                  className="px-3"
                  child={
                    <Typography level="captionsm" className="text-tertiary">
                      Hủy
                    </Typography>
                  }
                />
                <Button
                  type="submit"
                  disabled={
                    !editContent.trim() ||
                    editContent === data.content ||
                    isSubmitting
                  }
                  className="px-3 bg-primary text-white rounded-lg disabled:bg-neutral2-5 disabled:text-neutral2-10"
                  child={
                    <Typography level="captionsm">
                      {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                    </Typography>
                  }
                />
              </div>
            </form>
          ) : (
            <Typography level="body2r" className="text-secondary mt-1">
              {localData.content}
            </Typography>
          )}
        </div>

        <div className="flex items-center gap-4 mt-1 ml-2">
          <Typography level="captionr" className="text-tertiary opacity-70">
            {relativeTime(new Date(localData.createdAt))}
          </Typography>

          <ReactItem
            value={localData.likedCount}
            icon={<HeartIcon isActive={localData.hasLiked} />}
            onClick={handleLikeClick}
          />

          {!isReply && (
            <Button
              onClick={handleReplyClick}
              className="p-0"
              child={
                <Typography level="captionsm" className="text-tertiary">
                  Trả lời
                </Typography>
              }
            />
          )}
        </div>
      </div>

      <AlertDialog
        open={isConfirmDelete}
        onOpenChange={() => setIsConfirmDelete(false)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bình luận</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            <Typography level="base2sm" className="text-tertiary">
              Bạn có chắc chắn muốn xóa bình luận này?
            </Typography>
          </AlertDialogDescription>

          <AlertDialogFooter>
            <Button
              onClick={() => setIsConfirmDelete(false)}
              className="w-full sm:w-auto"
              child={
                <Typography level="base2sm" className="p-3 text-tertiary">
                  Hủy
                </Typography>
              }
            />

            <Button
              onClick={handleDeleteComment}
              className="w-full sm:w-auto"
              child={
                <Typography level="base2sm" className="p-3 text-tertiary">
                  Xác nhận
                </Typography>
              }
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
