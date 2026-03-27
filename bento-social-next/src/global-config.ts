export const HOST_API = process.env.NEXT_PUBLIC_API_URL 
  || process.env.NEXT_PUBLIC_NETWORK_API_DOMAIN 
  || process.env.NEXT_PUBLIC_API_DOMAIN 
  || 'http://localhost:3000';
