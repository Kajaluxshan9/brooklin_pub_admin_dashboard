import axios from "axios";
import { API_BASE_URL } from '../config/env.config';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies (JWT)
  timeout: 30000, // 30 second timeout
});

// Re-export API_BASE_URL for backward compatibility
export { API_BASE_URL };

// Request interceptor for debugging in development
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        config.data,
      );
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Handle specific HTTP error codes
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.error('[API] Unauthorized - Token may be expired');
          break;
        case 403:
          console.error('[API] Forbidden - Insufficient permissions');
          break;
        case 404:
          console.error('[API] Not Found:', error.config?.url);
          break;
        case 500:
          console.error('[API] Server Error:', data?.message);
          break;
        default:
          console.error(
            `[API] Error ${status}:`,
            data?.message || error.message,
          );
      }
    } else if (error.request) {
      console.error(
        '[API] No response received - Server may be down',
        error.message,
      );
    } else {
      console.error('[API] Request setup error:', error.message);
    }

    const message =
      error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  },
);
