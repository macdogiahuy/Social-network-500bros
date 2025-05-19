import { Typography } from '@/components/typography';
import { IMessage } from '@/interfaces/conversation';
import { formatDistanceToNow } from 'date-fns';

//----------------------------------------------------------------------

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
      className={`w-full flex items-start gap-4 ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[70%] flex flex-col gap-2 rounded-[1.25rem] p-3 ${
          isOwnMessage ? 'bg-primary/10' : 'bg-neutral2-2'
        }`}
      >
        <Typography level="body2r" className="text-secondary opacity-80">
          {message.content}
        </Typography>
        <Typography level="captionr" className="text-tertiary opacity-50">
          {formattedTime}
        </Typography>
      </div>
    </div>
  );
}
