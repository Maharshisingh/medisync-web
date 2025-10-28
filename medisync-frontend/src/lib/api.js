// Use localhost for development, render for production
const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5001' : 'https://medisync-js.onrender.com';

export const apiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${BACKEND_URL}/${cleanEndpoint}`;
};

export default BACKEND_URL;