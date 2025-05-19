import { getConversations } from '@/apis/conversation';
import { Button } from '@/components/button';
import { AddIcon } from '@/components/icons';
import { Typography } from '@/components/typography';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useUserProfile } from '@/context/user-context';
import { IConversation } from '@/interfaces/conversation';
import { useEffect, useState } from 'react';

import ConversationItem from './conversation-item';

interface ConversationSidebarProps {
  onConversationClick: (conversation: IConversation) => void;
  selectedConversationId?: string;
}

export default function ConversationSidebar({
  onConversationClick,
  selectedConversationId,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
              This feature is coming soon!
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
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
                onClick={() => onConversationClick(conversation)}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
