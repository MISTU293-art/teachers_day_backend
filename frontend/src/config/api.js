// Centralized API configuration
// Reads from Vite environment variable with safe fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3000' : '');

export const API_ENDPOINTS = {
  PROGRAMS: `${API_BASE_URL}/api/programs`,
  FEATURED_PROGRAM: `${API_BASE_URL}/api/programs/featured`,
  GALLERY: `${API_BASE_URL}/api/gallery`,
  PARTICIPATE: `${API_BASE_URL}/api/participate`,
  EVENT_INFO: `${API_BASE_URL}/api/event-info`,
  ADMIN_LOGIN: `${API_BASE_URL}/auth/login`,
  ADMIN_GALLERY_UPLOAD: `${API_BASE_URL}/gallery/upload`,
  ADMIN_PROGRAM_CREATE: `${API_BASE_URL}/programs/create`
};

export default API_BASE_URL;
