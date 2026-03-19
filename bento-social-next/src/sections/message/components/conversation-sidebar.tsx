/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  deleteConversation,
  getConversations,
  initiateConversation,
} from '@/apis/conversation';
import { getAllUsers } from '@/apis/user';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Typography } from '@/components/typography';
import { useUserProfile } from '@/context/user-context';
import { IConversation } from '@/interfaces/conversation';
import { IUserProfile } from '@/interfaces/user';
import { formatDistanceToNow } from 'date-fns';
import { TrashIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import CreateGroupDialog from './create-group-dialog';

//----------------------------------------------------------------------
interface ConversationSidebarProps {
  onConversationClick: (id: string) => void;
  selectedConversationId?: string;
}

export default function ConversationSidebar({
  onConversationClick,
  selectedConversationId,
}: ConversationSidebarProps) {
  const { userProfile } = useUserProfile();
  const [users, setUsers] = useState<IUserProfile[]>([]);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch users
      try {
        const params = searchQuery ? { search: searchQuery } : undefined;
        const usersRes: any = await getAllUsers(params);

        let usersList: IUserProfile[] = [];
        if (Array.isArray(usersRes)) {
          usersList = usersRes;
        } else if (Array.isArray(usersRes?.data)) {
          usersList = usersRes.data;
        } else if (Array.isArray(usersRes?.data?.data)) {
          usersList = usersRes.data.data;
        }

        if (userProfile) {
          setUsers(usersList.filter((u) => u.id !== userProfile.id));
        } else {
          setUsers(usersList);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }

      // Fetch conversations
      try {
        const conversationsRes: any = await getConversations();

        let conversationsList: IConversation[] = [];
        if (Array.isArray(conversationsRes)) {
          conversationsList = conversationsRes;
        } else if (Array.isArray(conversationsRes?.data)) {
          conversationsList = conversationsRes.data;
        } else if (Array.isArray(conversationsRes?.data?.data)) {
          conversationsList = conversationsRes.data.data;
        }

        setConversations(conversationsList);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [searchQuery, userProfile]);

  const handleUserClick = async (userId: string) => {
    try {
      // Check if conversation exists locally first
      const existingConv = conversations.find(
        (c) =>
          (c.senderId === userProfile?.id && c.receiverId === userId) ||
          (c.receiverId === userProfile?.id && c.senderId === userId)
      );

      if (existingConv) {
        onConversationClick(existingConv.id);
      } else {
        const response: any = await initiateConversation({
          receiverId: userId,
        });
        const newConversation = response?.data || response;
        setConversations((prev) => [...prev, newConversation]);
        onConversationClick(newConversation.id);
      }
    } catch (error) {
      console.error('Error handling user click:', error);
    }
  };

  const handleDeleteConversation = async (
    e: React.MouseEvent,
    conversationId: string
  ) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation(conversationId);
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        if (selectedConversationId === conversationId) {
          // If the deleted conversation was selected, we might want to deselect it or redirect
          // For now, let's just let the parent handle it or reload
          window.location.href = '/messages';
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  return (
    <section className="relative w-full min-h-screen lg:min-h-full bg-surface-2 flex flex-col gap-3 p-3 lg:max-w-[20rem] lg:min-w-[20rem] xl:max-w-[25rem] xl:min-w-[25rem]">
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Typography level="h5" className="font-bold text-primary">
            Messages
          </Typography>
          <CreateGroupDialog
            onGroupCreated={(newConv) => {
              setConversations((prev) => [newConv, ...prev]);
              onConversationClick(newConv.id);
            }}
          />
        </div>
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="w-full max-h-full flex flex-col gap-2 overflow-y-auto">
        {isLoading ? (
          <Typography level="base2m" className="text-tertiary text-center p-4">
            Loading...
          </Typography>
        ) : searchQuery ? (
          users.length === 0 ? (
            <Typography
              level="base2m"
              className="text-tertiary text-center p-4"
            >
              No users found
            </Typography>
          ) : (
            users.map((user) => {
              // Find conversation for this user to get last message
              const conversation = conversations.find(
                (c) =>
                  (c.senderId === userProfile?.id &&
                    c.receiverId === user.id) ||
                  (c.receiverId === userProfile?.id && c.senderId === user.id)
              );

              const isSelected = conversation?.id === selectedConversationId;
              const lastMessageTime = conversation?.updatedAt
                ? formatDistanceToNow(new Date(conversation.updatedAt), {
                    addSuffix: true,
                  })
                : '';

              return (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-[1.25rem] cursor-pointer transition-colors duration-200 ${
                    isSelected
                      ? 'bg-primary/10'
                      : 'bg-neutral2-2 hover:bg-neutral2-5'
                  }`}
                >
                  <Avatar
                    src={user.avatar || '/img/default-avatar.jpg'}
                    alt={user.username}
                    size={40}
                  />
                  <div className="grow flex flex-col gap-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <Typography
                        level="base2m"
                        className="text-primary truncate"
                      >
                        {user.firstName} {user.lastName}
                      </Typography>
                      {lastMessageTime && (
                        <Typography
                          level="captionr"
                          className="text-tertiary opacity-50 whitespace-nowrap ml-2"
                        >
                          {lastMessageTime}
                        </Typography>
                      )}
                    </div>
                    <Typography
                      level="body2r"
                      className="text-tertiary opacity-80 line-clamp-1"
                    >
                      {conversation?.messages?.[0]?.content ||
                        'Start a conversation'}
                    </Typography>
                  </div>
                </div>
              );
            })
          )
        ) : conversations.length === 0 ? (
          <Typography level="base2m" className="text-tertiary text-center p-4">
            No conversations yet
          </Typography>
        ) : (
          conversations.map((conversation) => {
            const isGroup = conversation.type === 'GROUP';
            let title = '';
            let avatar = '';

            if (isGroup) {
              title = conversation.name || 'Group Chat';
              avatar = conversation.image || '/img/default-avatar.jpg';
            } else {
              const otherUser =
                conversation.senderId === userProfile?.id
                  ? conversation.receiver
                  : conversation.sender;

              if (!otherUser) return null;

              title = `${otherUser.firstName} ${otherUser.lastName}`;
              avatar = otherUser.avatar || '/img/default-avatar.jpg';
            }

            const isSelected = conversation.id === selectedConversationId;
            const lastMessageTime = conversation.updatedAt
              ? formatDistanceToNow(new Date(conversation.updatedAt), {
                  addSuffix: true,
                })
              : '';

            return (
              <div
                key={conversation.id}
                onClick={() => onConversationClick(conversation.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-[1.25rem] cursor-pointer transition-colors duration-200 group relative ${
                  isSelected
                    ? 'bg-primary/10'
                    : 'bg-neutral2-2 hover:bg-neutral2-5'
                }`}
              >
                <Avatar src={avatar} alt={title} size={40} />
                <div className="grow flex flex-col gap-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <Typography
                      level="base2m"
                      className="text-primary truncate"
                    >
                      {title}
                    </Typography>
                    {lastMessageTime && (
                      <Typography
                        level="captionr"
                        className="text-tertiary opacity-50 whitespace-nowrap ml-2"
                      >
                        {lastMessageTime}
                      </Typography>
                    )}
                  </div>
                  <Typography
                    level="body2r"
                    className="text-tertiary opacity-80 line-clamp-1"
                  >
                    {conversation.messages?.[0]?.content ||
                      (conversation.messages?.[0]?.fileUrl
                        ? 'Sent a file'
                        : isGroup
                          ? 'Group created'
                          : 'Start a conversation')}
                  </Typography>
                </div>

                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    className="p-2 hover:bg-error/10 text-tertiary hover:text-error rounded-full"
                    onClick={(e) =>
                      handleDeleteConversation(e, conversation.id)
                    }
                    child={<TrashIcon width={16} height={16} />}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
