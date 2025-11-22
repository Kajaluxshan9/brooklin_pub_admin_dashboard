import axios from "axios";
import { API_BASE_URL } from '../config/env.config';
import logger from './logger';

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
        // keep request debug logs for development only
        logger.debug(
          `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
          config.data,
        );
      }
    return config;
  },
  (error) => {
    logger.error('[API Request Error]', error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      logger.debug(`[API Response] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Handle specific HTTP error codes
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
              logger.error('[API] Unauthorized - Token may be expired');
          break;
        case 403:
          logger.error('[API] Forbidden - Insufficient permissions');
          break;
        case 404:
          logger.error('[API] Not Found:', error.config?.url);
          break;
        case 500:
          logger.error('[API] Server Error:', data?.message);
          break;
        default:
          logger.error(
            `[API] Error ${status}:`,
            data?.message || error.message,
          );
      }
    } else if (error.request) {
      logger.error(
        '[API] No response received - Server may be down',
        error.message,
      );
    } else {
      logger.error('[API] Request setup error:', error.message);
    }

    // Handle validation errors (array of messages) or regular error messages
    let message = 'Request failed';
    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message;
      // If it's an array of validation errors, join them
      if (Array.isArray(errorMessage)) {
        message = errorMessage.join('. ');
      } else {
        message = errorMessage;
      }
    } else if (error.message) {
      message = error.message;
    }

    const err: any = new Error(message);
    err.errorId = error.response?.data?.errorId || undefined;
    err.status = error.response?.status || undefined;
    return Promise.reject(err);
  },
);
