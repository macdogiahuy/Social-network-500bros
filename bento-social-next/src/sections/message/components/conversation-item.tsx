import { Avatar } from '@/components/avatar';
import { Typography } from '@/components/typography';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItemProps {
  conversation: {
    id: string;
    user: {
      avatarUrl: string;
      name: string;
    };
    lastMessage: string;
    lastMessageTime: string;
  };
  isSelected?: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const formattedTime = formatDistanceToNow(
    new Date(conversation.lastMessageTime),
    { addSuffix: true },
  );

  return (
    <div
      className={`w-full flex items-start gap-3 p-3 rounded-[1.25rem] cursor-pointer transition-colors duration-200 ${
        isSelected ? 'bg-primary/10' : 'bg-neutral2-2 hover:bg-neutral2-5'
      }`}
      onClick={onClick}
    >
      <Avatar
        src={conversation.user.avatarUrl}
        alt={`Avatar of ${conversation.user.name}`}
        size={40}
      />

      <div className="grow flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Typography level="base2m" className="text-primary">
            {conversation.user.name}
          </Typography>
          <Typography level="captionr" className="text-tertiary opacity-50">
            {formattedTime}
          </Typography>
        </div>

        <Typography
          level="body2r"
          className="text-tertiary opacity-80 line-clamp-1"
        >
          {conversation.lastMessage}
        </Typography>
      </div>
    </div>
  );
}
