'use client';

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.error(`Network error connecting to ${API_URL}:`, error.message);
      return Promise.reject(
        new Error(
          `Unable to connect to the server at ${API_URL}. Please check if the server is running and accessible.`,
        ),
      );
    }

    // If the error status is 401 and there hasn't been a retry yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          sessionStorage.setItem('token', accessToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

export const VERSION_PREFIX = '/v1';

export type Endpoints = {
  auth: {
    login: string;
    register: string;
    refresh: string;
  };
  user: {
    get: string;
    create: string;
    update: string;
    profile: string;
    bookmark: (id: string) => string;
    followers: (id: string) => string;
    followings: (id: string) => string;
    follow: (id: string) => string;
    unfollow: (id: string) => string;
    profileById: (id: string) => string;
    hasFollowed: (id: string) => string;
  };
  conversation: {
    initiate: string;
    messages: (conversationId: string) => string;
    list: string;
  };
  post: {
    get: string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
    like: (id: string) => string;
    unlike: (id: string) => string;
    save: (id: string) => string;
    unsave: (id: string) => string;
  };
  media: {
    upload: string;
  };
  notification: {
    get: string;
    read: (id: string) => string;
    readAll: string;
  };
};

export const endpoints: Endpoints = {
  auth: {
    login: `${VERSION_PREFIX}/authenticate`,
    register: `${VERSION_PREFIX}/register`,
    refresh: `${VERSION_PREFIX}/auth/refresh`,
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
    like: (id: string) => `${VERSION_PREFIX}/posts/${id}/like`,
    unlike: (id: string) => `${VERSION_PREFIX}/posts/${id}/unlike`,
    save: (id: string) => `${VERSION_PREFIX}/posts/${id}/save`,
    unsave: (id: string) => `${VERSION_PREFIX}/posts/${id}/unsave`,
  },
  media: {
    upload: `${VERSION_PREFIX}/upload-file`,
  },
  notification: {
    get: `${VERSION_PREFIX}/notifications`,
    read: (id: string) => `${VERSION_PREFIX}/notifications/${id}/read`,
    readAll: `${VERSION_PREFIX}/notifications/read-all`,
  },
};

export default axiosInstance;
