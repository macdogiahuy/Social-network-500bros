export const HOST_API = process.env.NEXT_PUBLIC_API_URL 
  || process.env.NEXT_PUBLIC_NETWORK_API_DOMAIN 
  || process.env.NEXT_PUBLIC_API_DOMAIN 
  || 'http://localhost:3000';

export const MEDIA_HOST_API =
  process.env.NEXT_PUBLIC_MEDIA_URL ||
  process.env.NEXT_PUBLIC_CDN_URL ||
  HOST_API;

export const SOCKET_HOST_API =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_WS_URL ||
  HOST_API;
