const isLocalhost = () => {
  if (typeof window === 'undefined') return true;
  return window.location.hostname === 'localhost';
};

export const HOST_API = isLocalhost()
  ? process.env.NEXT_PUBLIC_API_DOMAIN
  : process.env.NEXT_PUBLIC_NETWORK_API_DOMAIN;
