'use client';

import { IChatRoom } from '@/apis/conversation';
import { useConversations } from '@/hooks/queries/use-conversations';
import { useUserProfile } from '@/context/user-context';

import { AddIcon } from '@/components/icons';
import { Button } from '@/components/button';
import { SplashScreen } from '@/components/loading-screen';

import ConversationItem from './conversation-item';
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

//----------------------------------------------------------------------
interface ConversationSidebarProps {
  onConversationClick: (id: string) => void;
}

function getConversationDisplay(room: IChatRoom, currentUserId: string) {
  if (room.type === 'group') {
    return {
      name: room.name || 'Group Chat',
      avatar: room.image || null,
    };
  }
  const otherParticipant = room.participants?.find(
    (p) => p.usersId !== currentUserId
  );
  if (otherParticipant?.users) {
    const u = otherParticipant.users;
    return {
      name: `${u.firstName} ${u.lastName}`,
      avatar: u.avatar,
    };
  }
  return { name: 'Unknown', avatar: null };
}

export default function ConversationSidebar({
  onConversationClick,
}: ConversationSidebarProps) {
  const { data: conversations, isLoading } = useConversations();
  const { userProfile } = useUserProfile();

  if (isLoading) return <SplashScreen />;

  return (
    <section className="relative w-full min-h-screen lg:min-h-full bg-surface-2 flex flex-col gap-3 p-3 lg:max-w-[20rem] lg:min-w-[20rem] xl:max-w-[25rem] xl:min-w-[25rem]">
      <div className="w-full flex justify-start items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="p-2.5" child={<AddIcon />} />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>New Conversation</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              This feature is coming soon
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="w-full max-h-full flex flex-col gap-2 overflow-y-auto">
        {conversations?.map((room) => {
          const display = getConversationDisplay(room, userProfile?.id ?? '');
          const lastMsg = room.messages?.[0];
          return (
            <ConversationItem
              key={room.id}
              isReaded={true}
              conversation={{
                user: { avatarUrl: display.avatar || '', name: display.name },
                content: lastMsg?.content || (lastMsg?.fileUrl ? 'Sent a file' : 'No messages yet'),
              }}
              onClick={() => onConversationClick(room.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
