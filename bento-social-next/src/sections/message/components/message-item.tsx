import { Avatar } from '@/components/avatar';
import { Typography } from '@/components/typography';
import { IMessage } from '@/interfaces/conversation';
import { formatDistanceToNow } from 'date-fns';

interface IMessageItemProps {
  message: IMessage;
  isOwnMessage: boolean;
}

export default function MessageItem({
  message,
  isOwnMessage,
}: IMessageItemProps) {
  const formattedTime = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className={`w-full flex items-start gap-4 rounded-[1.25rem] p-3 ${
        isOwnMessage ? 'bg-primary/10 flex-row-reverse' : 'bg-neutral2-2'
      }`}
    >
      <Avatar
        src={message.sender?.avatar || '/img/default-avatar.jpg'}
        alt="avatar-user"
        size={40}
      />

      <div
        className={`grow flex flex-col gap-2 ${
          isOwnMessage ? 'items-end' : 'items-start'
        }`}
      >
        <div className="flex items-center gap-2">
          <Typography level="base2m" className="text-primary opacity-80">
            {message.sender?.firstName} {message.sender?.lastName}
          </Typography>
          <Typography level="captionr" className="text-tertiary opacity-50">
            {formattedTime}
          </Typography>
        </div>
        <Typography level="body2r" className="text-secondary opacity-80">
          {message.content}
        </Typography>
      </div>
    </div>
  );
}
