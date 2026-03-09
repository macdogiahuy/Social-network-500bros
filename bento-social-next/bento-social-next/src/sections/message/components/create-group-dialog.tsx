import { initiateConversation } from '@/apis/conversation';
import { getAllUsers } from '@/apis/user';
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
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { AddIcon } from '@/components/icons';
import { Input } from '@/components/input';
import { Typography } from '@/components/typography';
import { useUserProfile } from '@/context/user-context';
import { IUserProfile } from '@/interfaces/user';
import { useEffect, useState } from 'react';

interface CreateGroupDialogProps {
  onGroupCreated: (conversation: any) => void;
}

export default function CreateGroupDialog({
  onGroupCreated,
}: CreateGroupDialogProps) {
  const { userProfile } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<IUserProfile[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, searchQuery]);

  const fetchUsers = async () => {
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
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUserIds.length === 0) return;

    setIsLoading(true);
    try {
      const response: any = await initiateConversation({
        userIds: selectedUserIds,
        name: groupName,
        // image: ... (optional, can add file upload later)
      });

      const newConversation = response?.data || response;
      onGroupCreated(newConversation);
      setIsOpen(false);
      setGroupName('');
      setSelectedUserIds([]);
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button className="p-2" child={<AddIcon />} />
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle>Create Group Chat</AlertDialogTitle>
          <AlertDialogDescription>
            Name your group and add members.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-4 py-4 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <Typography level="base2m" className="text-primary">
              Group Name
            </Typography>
            <Input
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-neutral2-2 border border-neutral2-5 rounded-xl px-4 py-3 text-primary placeholder:text-tertiary focus:border-primary/50 focus:bg-neutral2-5 transition-all opacity-100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Typography level="base2m" className="text-primary">
              Add Members
            </Typography>
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral2-2 border border-neutral2-5 rounded-xl px-4 py-3 text-primary placeholder:text-tertiary focus:border-primary/50 focus:bg-neutral2-5 transition-all opacity-100"
            />

            <div className="flex flex-col gap-2 mt-2 max-h-[250px] overflow-y-auto pr-1">
              {users.length === 0 ? (
                <Typography
                  level="body2r"
                  className="text-tertiary text-center py-4"
                >
                  No users found
                </Typography>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => toggleUserSelection(user.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                      selectedUserIds.includes(user.id)
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-transparent border-transparent hover:bg-neutral2-5'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedUserIds.includes(user.id)
                          ? 'bg-primary border-primary'
                          : 'border-tertiary'
                      }`}
                    >
                      {selectedUserIds.includes(user.id) && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <Avatar
                      src={user.avatar || '/img/default-avatar.jpg'}
                      size={40}
                    />
                    <div className="flex flex-col">
                      <Typography level="base2m" className="text-primary">
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography level="captionr" className="text-tertiary">
                        @{user.username}
                      </Typography>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleCreateGroup}
            disabled={
              !groupName.trim() || selectedUserIds.length === 0 || isLoading
            }
            child={isLoading ? 'Creating...' : 'Create Group'}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
