const getProductionBackendUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://ai-startup-builders-saas-1.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

let apiUrl = import.meta.env.VITE_API_URL || getProductionBackendUrl();

if (apiUrl && !apiUrl.endsWith('/api') && !apiUrl.includes('/api/')) {
  apiUrl = `${apiUrl.replace(/\/$/, '')}/api`;
}

export const API_URL = apiUrl;
