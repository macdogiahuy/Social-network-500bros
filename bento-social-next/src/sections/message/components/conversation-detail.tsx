import { getConversationMessages } from '@/apis/conversation';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { CloseIcon, MoreIcon } from '@/components/icons';
import { Typography } from '@/components/typography';
import { useUserProfile } from '@/context/user-context';
import { IConversation, IMessage } from '@/interfaces/conversation';
import { useEffect, useState } from 'react';

import ChatInput from './chat-input';
import MessageItem from './message-item';

interface ConversationDetailProps {
  conversation: IConversation;
  onBack?: () => void;
}

export default function ConversationDetail({
  conversation,
  onBack,
}: ConversationDetailProps) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile } = useUserProfile();

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await getConversationMessages(conversation.id);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversation.id]);

  const otherUser =
    conversation.senderId === userProfile?.id
      ? conversation.receiver
      : conversation.sender;

  return (
    <section className="block md:hidden w-full h-full flex-col bg-surface lg:flex">
      <section
        id="conversation-header"
        className="w-full flex items-center gap-4 py-3 pr-6 pl-3"
      >
        <Avatar
          src={otherUser.avatar || '/img/default-avatar.jpg'}
          alt={`${otherUser.firstName} ${otherUser.lastName}`}
          size={40}
        />

        <Typography level="base2m" className="text-primary grow">
          {otherUser.firstName} {otherUser.lastName}
        </Typography>

        <Button className="p-2.5" child={<MoreIcon />} />

        {onBack && (
          <Button
            onClick={onBack}
            className="p-2.5 lg:hidden"
            child={<CloseIcon />}
          />
        )}
      </section>

      <section
        id="chat-container"
        className="flex flex-col gap-2 h-[calc(100vh-150px)] overflow-y-auto items-center justify-start p-3"
      >
        {isLoading ? (
          <Typography level="base2m" className="text-tertiary">
            Loading messages...
          </Typography>
        ) : messages.length === 0 ? (
          <Typography level="base2m" className="text-tertiary">
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === userProfile?.id}
            />
          ))
        )}
      </section>

      <ChatInput
        conversationId={conversation.id}
        onMessageSent={fetchMessages}
      />
    </section>
  );
}
