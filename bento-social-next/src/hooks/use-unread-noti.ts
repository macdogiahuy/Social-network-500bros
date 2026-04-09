import { useUnreadNotificationCount } from '@/hooks/queries/use-notifications';

//--------------------------------------------------------------------------------------------

export default function useUnreadNoti() {
  return useUnreadNotificationCount();
}
