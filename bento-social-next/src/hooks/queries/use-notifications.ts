'use client';

import { getNotifications } from '@/apis/notification';
import { useQuery } from 'react-query';

export function useNotifications() {
  return useQuery(
    ['notifications'],
    () => getNotifications().then((r) => r.data)
  );
}

export function useUnreadNotificationCount() {
  const { data: notifications } = useNotifications();
  return notifications?.filter((n) => !n.isRead).length ?? 0;
}
