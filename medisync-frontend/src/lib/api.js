// Use localhost for development, render for production
const BACKEND_URL = 'https://medisync-backend-xyz.onrender.com';

export const apiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${BACKEND_URL}/${cleanEndpoint}`;
};

export default BACKEND_URL;