'use client';

import {
  getUserProfile,
  getUserProfileById,
  getUserBookmarks,
  getUserFollower,
  getUserFollowing,
  hasFollowed,
} from '@/apis/user';
import { useQuery } from 'react-query';

export function useUserProfile(enabled = true) {
  return useQuery(
    ['userProfile'],
    () => getUserProfile().then((r) => r.data),
    { enabled }
  );
}

export function useUserProfileById(userId: string, enabled = true) {
  return useQuery(
    ['userProfile', userId],
    () => getUserProfileById(userId).then((r) => r.data),
    { enabled: enabled && !!userId }
  );
}

export function useUserBookmarks(userId: string | undefined) {
  return useQuery(
    ['bookmarks', userId],
    () => getUserBookmarks(userId!).then((r) => r.data),
    { enabled: !!userId }
  );
}

export function useUserFollowers(userId: string, enabled = true) {
  return useQuery(
    ['followers', userId],
    () => getUserFollower(userId).then((r) => r.data),
    { enabled: enabled && !!userId }
  );
}

export function useUserFollowings(userId: string, enabled = true) {
  return useQuery(
    ['followings', userId],
    () => getUserFollowing(userId).then((r) => r.data),
    { enabled: enabled && !!userId }
  );
}

export function useHasFollowed(userId: string, enabled = true) {
  return useQuery(
    ['hasFollowed', userId],
    () => hasFollowed(userId),
    { enabled: enabled && !!userId }
  );
}
