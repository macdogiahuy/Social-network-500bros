'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { useMessages } from '@/hooks/queries/use-conversations';
import { useSocket } from '@/providers/socket-provider';
import { IChatMessage } from '@/apis/conversation';

import { Avatar } from '@/components/avatar';
import { CloseIcon, MoreIcon } from '@/components/icons';
import { Typography } from '@/components/typography';
import { Button } from '@/components/button';
import { SplashScreen } from '@/components/loading-screen';
import { ChatInput, MessageItem } from '../components';

//----------------------------------------------------------------------
interface ConversationDetailPageProps {
  id: string;
}

export default function ConversationDetailPage({
  id,
}: ConversationDetailPageProps) {
  const router = useRouter();
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

  const handleBack = () => {
    router.push('/messages');
  };

  if (isLoading) return <SplashScreen />;

  return (
    <section className="block md:hidden w-full h-full flex-col bg-surface lg:flex">
      <section
        id="conversation-header"
        className="w-full flex items-center gap-4 py-3 pr-6 pl-3"
      >
        <Avatar src={null} alt="avatar" />
        <Typography level="base2m" className="text-primary grow">
          Conversation
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
    </section>
  );
}
