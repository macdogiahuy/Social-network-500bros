import { reactToMessage } from '@/apis/conversation';
import { Avatar } from '@/components/avatar';
import { FolderIcon, HeartIcon } from '@/components/icons';
import { Typography } from '@/components/typography';
import { useUserProfile } from '@/context/user-context';
import { HOST_API } from '@/global-config';
import { IMessage } from '@/interfaces/conversation';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

//----------------------------------------------------------------------

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface IMessageItemProps {
  message: IMessage;
  isOwnMessage: boolean;
}

export default function MessageItem({
  message,
  isOwnMessage,
}: IMessageItemProps) {
  const { userProfile } = useUserProfile();
  const [imageError, setImageError] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const formattedTime = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
  });

  const handleReact = async (emoji: string) => {
    try {
      await reactToMessage(message.conversationId, message.id, emoji);
      setShowReactions(false);
    } catch (error) {
      console.error('Error reacting:', error);
    }
  };

  const reactions = message.reactions || [];
  const groupedReactions = reactions.reduce(
    (acc, curr) => {
      acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const myReaction = reactions.find((r) => r.userId === userProfile?.id);

  const getFileUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = HOST_API?.endsWith('/')
      ? HOST_API.slice(0, -1)
      : HOST_API || '';
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const fileUrl = getFileUrl(message.fileUrl || '');

  const renderFileContent = () => {
    if (!message.fileUrl) return null;

    const isImage =
      message.fileType?.startsWith('image/') ||
      /\.(jpg|jpeg|png|gif|webp)$/i.test(message.fileName || '');
    const isVideo =
      message.fileType?.startsWith('video/') ||
      /\.(mp4|webm|ogg)$/i.test(message.fileName || '');
    const isAudio =
      message.fileType?.startsWith('audio/') ||
      /\.(mp3|wav|ogg)$/i.test(message.fileName || '');

    if (isImage && !imageError) {
      return (
        <img
          src={fileUrl}
          alt={message.fileName || 'Image'}
          className="rounded-lg max-w-full max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity mt-2 block"
          onClick={() => window.open(fileUrl, '_blank')}
          onError={(e) => {
            console.error('Error loading image:', fileUrl, e);
            setImageError(true);
          }}
        />
      );
    }

    if (isVideo) {
      return (
        <video
          src={fileUrl}
          controls
          className="rounded-lg max-w-full max-h-[300px] mt-2 bg-black"
        />
      );
    }

    if (isAudio) {
      return (
        <audio src={fileUrl} controls className="w-full mt-2 min-w-[240px]" />
      );
    }

    return (
      <a
        href={fileUrl}
        download={message.fileName}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 p-3 mt-2 bg-white/50 rounded-lg hover:bg-white/80 transition-colors group/file text-left max-w-full overflow-hidden"
      >
        <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0">
          <FolderIcon />
        </div>
        <div className="flex flex-col overflow-hidden min-w-0">
          <Typography
            level="body2r"
            className="font-medium text-primary truncate"
          >
            {message.fileName || 'Attached File'}
          </Typography>
          {message.fileSize && (
            <Typography level="captionr" className="text-secondary text-xs">
              {(message.fileSize / 1024).toFixed(1)} KB
            </Typography>
          )}
        </div>
      </a>
    );
  };

  return (
    <div
      className={`w-full flex items-end gap-2 group relative mb-4 ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      }`}
      onMouseLeave={() => setShowReactions(false)}
    >
      {!isOwnMessage && (
        <Avatar
          src={message.sender?.avatar || '/img/default-avatar.jpg'}
          size={32}
          className="mb-1 shrink-0"
        />
      )}

      <div
        className={`max-w-[70%] flex flex-col gap-1 rounded-[1.25rem] p-3 relative ${
          isOwnMessage
            ? 'bg-primary/10 rounded-br-none'
            : 'bg-neutral2-2 rounded-bl-none'
        }`}
      >
        {/* Reaction Picker & Trigger */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 z-10 flex items-center ${
            isOwnMessage
              ? 'left-auto right-[calc(100%+8px)] flex-row-reverse'
              : 'left-[calc(100%+8px)] right-auto flex-row'
          }`}
        >
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`p-1.5 rounded-full hover:bg-neutral4-5 transition-all text-tertiary opacity-0 group-hover:opacity-100 ${
              showReactions ? 'opacity-100 bg-neutral4-5' : ''
            }`}
          >
            <HeartIcon />
          </button>

          {showReactions && (
            <div
              className={`absolute bottom-full mb-2 bg-white dark:bg-neutral-800 shadow-lg rounded-full p-1 flex items-center gap-1 border border-neutral-200 dark:border-neutral-700 animate-in fade-in zoom-in duration-200 ${
                isOwnMessage
                  ? 'right-0 origin-bottom-right'
                  : 'left-0 origin-bottom-left'
              }`}
            >
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className={`p-2 hover:bg-neutral4-5 rounded-full text-xl transition-transform hover:scale-125 select-none ${
                    emoji === myReaction?.emoji ? 'bg-primary/10' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {!isOwnMessage && message.sender && (
          <Typography level="captionr" className="text-primary font-semibold">
            {message.sender.firstName} {message.sender.lastName}
          </Typography>
        )}
        {message.content && (
          <Typography
            level="body2r"
            className="text-secondary opacity-80 whitespace-pre-wrap break-words"
          >
            {message.content}
          </Typography>
        )}

        {renderFileContent()}

        <Typography
          level="captionr"
          className="text-tertiary opacity-50 text-[10px]"
        >
          {formattedTime}
        </Typography>

        {/* Reactions Display */}
        {Object.keys(groupedReactions).length > 0 && (
          <div
            className="absolute -bottom-3 right-0 translate-y-1/2 bg-white dark:bg-neutral-800 shadow-sm rounded-full px-1.5 py-0.5 flex items-center gap-1 border border-neutral-200 dark:border-neutral-700 select-none cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            onClick={() => setShowReactions(!showReactions)}
          >
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <div
                key={emoji}
                className="flex items-center text-xs leading-none py-0.5"
              >
                <span className="text-sm">{emoji}</span>
                {count > 1 && (
                  <span className="ml-0.5 text-secondary font-medium text-[10px]">
                    {count}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
