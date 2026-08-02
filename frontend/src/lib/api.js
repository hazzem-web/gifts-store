const DEFAULT_API_URL = 'http://localhost:5000';

const rawApiBaseUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

export const apiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const imageUrl = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return apiUrl(path);
};
