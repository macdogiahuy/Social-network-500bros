'use client';

import axios, { AxiosRequestConfig } from 'axios';

import { HOST_API } from '../global-config';

//----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: HOST_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set default Authorization header if token exists
if (typeof window !== 'undefined') {
  const token = sessionStorage.getItem('token');
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if we've already tried once or if it's the introspect endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/rpc/introspect')
    ) {
      originalRequest._retry = true;

      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        // Try to validate the token
        const response = await axios.post(
          `${HOST_API}${endpoints.auth.refresh}`,
          { token }
        );

        // Check if token is still valid
        if (response.data?.data?.sub && response.data.data?.role) {
          // Token is still valid, retry the original request
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        } else {
          console.error(
            'Token validation failed - invalid response format:',
            response.data
          );
          // Token is invalid, clear it and redirect to login
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('refreshToken');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Token validation failed - invalid response format');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Clear tokens and redirect to login for all 401s
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

const VERSION_PREFIX = '/v1';

export const endpoints = {
  auth: {
    login: `${VERSION_PREFIX}/authenticate`,
    register: `${VERSION_PREFIX}/register`,
    refresh: `${VERSION_PREFIX}/rpc/introspect`,
  },

  user: {
    get: `${VERSION_PREFIX}/users`,
    create: `${VERSION_PREFIX}/users`,
    update: `${VERSION_PREFIX}/profile`,
    profile: `${VERSION_PREFIX}/profile`,
    bookmark: (id: string) => `${VERSION_PREFIX}/users/${id}/saved-posts`,
    followers: (id: string) => `${VERSION_PREFIX}/users/${id}/followers`,
    followings: (id: string) => `${VERSION_PREFIX}/users/${id}/followings`,
    follow: (id: string) => `${VERSION_PREFIX}/users/${id}/follow`,
    unfollow: (id: string) => `${VERSION_PREFIX}/users/${id}/unfollow`,
    profileById: (id: string) => `${VERSION_PREFIX}/users/${id}`,
    hasFollowed: (id: string) => `${VERSION_PREFIX}/users/${id}/has-followed`,
  },

  conversation: {
    initiate: `${VERSION_PREFIX}/conversations/initiate`,
    messages: (conversationId: string) =>
      `${VERSION_PREFIX}/conversations/${conversationId}/messages`,
    list: `${VERSION_PREFIX}/conversations`,
  },

  post: {
    get: `${VERSION_PREFIX}/posts`,
    create: `${VERSION_PREFIX}/posts`,
    update: (id: string) => `${VERSION_PREFIX}/posts/${id}`,
    delete: (id: string) => `${VERSION_PREFIX}/posts/${id}`,
    detail: `${VERSION_PREFIX}/posts/:id`,
    like: (id: string) => `${VERSION_PREFIX}/posts/${id}/like`,
    unlike: (id: string) => `${VERSION_PREFIX}/posts/${id}/unlike`,
    save: (id: string) => `${VERSION_PREFIX}/posts/${id}/save`,
    unsave: (id: string) => `${VERSION_PREFIX}/posts/${id}/unsave`,
  },
  media: {
    upload: `${VERSION_PREFIX}/upload-file`,
  },

  topic: {
    get: `${VERSION_PREFIX}/topics`,
    detail: `${VERSION_PREFIX}/topics/:id`,
    create: `${VERSION_PREFIX}/topics`,
  },

  notification: {
    get: `${VERSION_PREFIX}/notifications`,
    read: (id: string) => `${VERSION_PREFIX}/notifications/${id}/read`,
    readAll: `${VERSION_PREFIX}/notifications/read-all`,
  },

  comment: {
    getComments: (postId: string) =>
      `${VERSION_PREFIX}/posts/${postId}/comments`,
    getReplies: (commentId: string) =>
      `${VERSION_PREFIX}/comments/${commentId}/replies`,
    create: (postId: string) => `${VERSION_PREFIX}/posts/${postId}/comments`,
    reply: (commentId: string) =>
      `${VERSION_PREFIX}/comments/${commentId}/replies`,
    update: (commentId: string) => `${VERSION_PREFIX}/comments/${commentId}`,
    delete: (commentId: string) => `${VERSION_PREFIX}/comments/${commentId}`,
    like: (commentId: string) => `${VERSION_PREFIX}/comments/${commentId}/like`,
    unlike: (commentId: string) =>
      `${VERSION_PREFIX}/comments/${commentId}/unlike`,
  },
};
