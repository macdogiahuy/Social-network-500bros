'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

<<<<<<< HEAD
import { _conversations as fakeConversation } from '@/_mocks/_conversation';
=======
import { useMessages } from '@/hooks/queries/use-conversations';
import { useSocket } from '@/providers/socket-provider';
import { IChatMessage } from '@/apis/conversation';
>>>>>>> origin/refactor-post

import { Avatar } from '@/components/avatar';
import { CloseIcon, MoreIcon } from '@/components/icons';
import { Typography } from '@/components/typography';
import { Button } from '@/components/button';
<<<<<<< HEAD
=======
import { SplashScreen } from '@/components/loading-screen';
>>>>>>> origin/refactor-post
import { ChatInput, MessageItem } from '../components';

//----------------------------------------------------------------------
interface ConversationDetailPageProps {
  id: string;
}

export default function ConversationDetailPage({
  id,
}: ConversationDetailPageProps) {
  const router = useRouter();
<<<<<<< HEAD

  // Chuyển đổi `id` sang kiểu số và tìm kiếm cuộc trò chuyện
  const conversationId = Number(id);
  const conversation = fakeConversation.find(
    (item: any) => item.id === conversationId
  );

  if (!conversation) return <p>Conversation not found</p>;
=======
  const { data: messages, isLoading } = useMessages(id);
  const { socket } = useSocket();
  const [realtimeMessages, setRealtimeMessages] = React.useState<IChatMessage[]>([]);

  React.useEffect(() => {
    setRealtimeMessages([]);
  }, [id]);

  React.useEffect(() => {
    if (!socket) return;
    const handler = (message: IChatMessage) => {
      if (message.roomId === id) {
        setRealtimeMessages((prev) => [...prev, message]);
      }
    };
    socket.on('new_message', handler);
    return () => { socket.off('new_message', handler); };
  }, [socket, id]);

  const allMessages = [...(messages ?? []), ...realtimeMessages];
>>>>>>> origin/refactor-post

  const handleBack = () => {
    router.push('/messages');
  };

<<<<<<< HEAD
=======
  if (isLoading) return <SplashScreen />;

>>>>>>> origin/refactor-post
  return (
    <section className="block md:hidden w-full h-full flex-col bg-surface lg:flex">
      <section
        id="conversation-header"
        className="w-full flex items-center gap-4 py-3 pr-6 pl-3"
      >
<<<<<<< HEAD
        <Avatar src={conversation.user.avatarUrl} alt="avatar" />

        <Typography level="base2m" className="text-primary grow">
          {conversation.user.name}
        </Typography>

        <Button className="p-2.5" child={<MoreIcon />} />

=======
        <Avatar src={undefined} alt="avatar" />
        <Typography level="base2m" className="text-primary grow">
          Conversation
        </Typography>
        <Button className="p-2.5" child={<MoreIcon />} />
>>>>>>> origin/refactor-post
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
<<<<<<< HEAD
        {conversation.messages?.map((message, index) => (
          <MessageItem key={index} message={message} />
        ))}
      </section>

      <ChatInput />
=======
        {allMessages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={{
              user: {
                avatarUrl: msg.sender?.avatar || '',
                name: msg.sender
                  ? `${msg.sender.firstName} ${msg.sender.lastName}`
                  : 'Unknown',
              },
              content: msg.content || '',
              imageUrl: msg.fileUrl || undefined,
              time: new Date(msg.createdAt).toLocaleTimeString(),
            }}
          />
        ))}
      </section>

      <ChatInput roomId={id} onMessageSent={(msg) => setRealtimeMessages((prev) => [...prev, msg])} />
>>>>>>> origin/refactor-post
    </section>
  );
}
