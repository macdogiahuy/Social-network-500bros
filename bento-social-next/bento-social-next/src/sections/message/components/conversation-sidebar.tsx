/* eslint-disable @typescript-eslint/no-explicit-any */
import { getConversations, initiateConversation } from '@/apis/conversation';
import { Button } from '@/components/button';
import { AddIcon } from '@/components/icons';
import { Input } from '@/components/input';
import { Typography } from '@/components/typography';
import { useUserProfile } from '@/context/user-context';
import { IConversation } from '@/interfaces/conversation';
import { useEffect, useState } from 'react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/alert-dialog';
import ConversationItem from './conversation-item';

//----------------------------------------------------------------------
interface ConversationSidebarProps {
  onConversationClick: (id: string) => void;
  selectedConversationId?: string;
}

export default function ConversationSidebar({
  onConversationClick,
  selectedConversationId,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [receiverId, setReceiverId] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const { userProfile } = useUserProfile();

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleStartConversation = async () => {
    if (!receiverId.trim() || isStarting) return;

    try {
      setIsStarting(true);
      const response = await initiateConversation(receiverId.trim());
      const newConversation = response.data;
      setConversations((prev) => [newConversation, ...prev]);
      onConversationClick(newConversation.id);
      setReceiverId('');
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <section className="relative w-full min-h-screen lg:min-h-full bg-surface-2 flex flex-col gap-3 p-3 lg:max-w-[20rem] lg:min-w-[20rem] xl:max-w-[25rem] xl:min-w-[25rem]">
      <div className="w-full flex justify-start items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="p-2.5" child={<AddIcon />} />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>New Message</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              <div className="flex flex-col gap-4 mt-4">
                <Input
                  type="text"
                  placeholder="Enter user ID to chat with"
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                />
                <Button
                  onClick={handleStartConversation}
                  disabled={!receiverId.trim() || isStarting}
                  className="w-full"
                  child={isStarting ? 'Starting...' : 'Start Chat'}
                />
              </div>
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="w-full max-h-full flex flex-col gap-2 overflow-y-auto">
        {isLoading ? (
          <Typography level="base2m" className="text-tertiary text-center p-4">
            Loading conversations...
          </Typography>
        ) : conversations.length === 0 ? (
          <Typography level="base2m" className="text-tertiary text-center p-4">
            No conversations yet. Start chatting with someone!
          </Typography>
        ) : (
          conversations.map((conversation) => {
            const otherUser =
              conversation.senderId === userProfile?.id
                ? conversation.receiver
                : conversation.sender;

            return (
              <ConversationItem
                key={conversation.id}
                isSelected={conversation.id === selectedConversationId}
                conversation={{
                  id: conversation.id,
                  user: {
                    avatarUrl: otherUser.avatar || '/img/default-avatar.jpg',
                    name: `${otherUser.firstName} ${otherUser.lastName}`,
                  },
                  lastMessage:
                    conversation.messages?.[0]?.content || 'No messages yet',
                  lastMessageTime:
                    conversation.messages?.[0]?.createdAt ||
                    conversation.createdAt,
                }}
                onClick={() => onConversationClick(conversation.id)}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
