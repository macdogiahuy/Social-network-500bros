/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getConversationMessages, getConversations } from '@/apis/conversation';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { CloseIcon, MoreIcon } from '@/components/icons';
import { Typography } from '@/components/typography';
import { useUserProfile } from '@/context/user-context';
import { IConversation, IMessage } from '@/interfaces/conversation';
import { ChatInput, MessageItem } from '../components';

//----------------------------------------------------------------------
interface ConversationDetailPageProps {
  id: string;
}

export default function ConversationDetailPage({
  id,
}: ConversationDetailPageProps) {
  const router = useRouter();
  const { userProfile } = useUserProfile();
  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getConversations();
        const foundConversation = response.data.find((c) => c.id === id);

        if (!foundConversation) {
          setError('Conversation not found');
          setConversation(null);
          return;
        }

        setConversation(foundConversation);

        const messagesResponse = await getConversationMessages(
          foundConversation.id
        );
        setMessages(messagesResponse.data);
      } catch (error) {
        console.error('Error fetching conversation:', error);
        setError('Error loading conversation');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchConversation();
    }
  }, [id]);

  const handleBack = () => {
    router.push('/messages');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Typography level="base2m">Loading conversation...</Typography>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <Typography level="base2m" className="text-error">
          {error || 'Conversation not found'}
        </Typography>
      </div>
    );
  }

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

        <Button
          onClick={handleBack}
          className="p-2.5 lg:hidden"
          child={<CloseIcon />}
        />
      </section>

      <section
        id="chat-container"
        className="flex flex-col gap-2 h-[calc(100vh-150px)] overflow-y-auto items-center justify-start p-3"
      >
        {messages.length === 0 ? (
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
        onMessageSent={() => {
          getConversationMessages(conversation.id).then((response) => {
            setMessages(response.data);
          });
        }}
      />
    </section>
  );
}
