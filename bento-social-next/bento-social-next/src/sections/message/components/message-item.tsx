import { Avatar } from '@/components/avatar';
import { FolderIcon } from '@/components/icons';
import { Typography } from '@/components/typography';
import { HOST_API } from '@/global-config';
import { IMessage } from '@/interfaces/conversation';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

//----------------------------------------------------------------------

interface IMessageItemProps {
  message: IMessage;
  isOwnMessage: boolean;
}

export default function MessageItem({
  message,
  isOwnMessage,
}: IMessageItemProps) {
  const [imageError, setImageError] = useState(false);
  const formattedTime = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
  });

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
      className={`w-full flex items-end gap-2 ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isOwnMessage && (
        <Avatar
          src={message.sender?.avatar || '/img/default-avatar.jpg'}
          size={32}
          className="mb-1 shrink-0"
        />
      )}
      <div
        className={`max-w-[70%] flex flex-col gap-1 rounded-[1.25rem] p-3 ${
          isOwnMessage
            ? 'bg-primary/10 rounded-br-none'
            : 'bg-neutral2-2 rounded-bl-none'
        }`}
      >
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
      </div>
    </div>
  );
}
