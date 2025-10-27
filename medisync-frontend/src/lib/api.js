// API configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://medisync-js.onrender.com' : 'http://localhost:5001');

// For Vercel deployment, use the Render backend URL
const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') 
  ? 'https://medisync-js.onrender.com'
  : API_BASE_URL;

export const apiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${BACKEND_URL}/${cleanEndpoint}`;
};

export default API_BASE_URL;