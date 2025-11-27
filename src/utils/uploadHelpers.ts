import { API_BASE_URL } from '../config/env.config';

/**
 * Helper function to get the full URL for an image.
 * Handles both relative paths (from local storage) and absolute URLs (legacy S3).
 * @param url - The image URL (can be relative like /uploads/... or absolute https://...)
 * @returns The full URL to access the image
 */
export const getImageUrl = (url: string | undefined | null): string => {
  if (!url) return '';

  // If it's already an absolute URL (http:// or https://), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a data URL (base64 preview), return as-is
  if (url.startsWith('data:')) {
    return url;
  }

  // If it's a relative path starting with /, prepend the API base URL
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }

  // Otherwise, assume it's a relative path and prepend API base URL with /
  return `${API_BASE_URL}/${url}`;
};

// Helper function for uploading images to the backend with folder organization
export const uploadImages = async (
  files: File[],
  folder: string = 'general'
): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  formData.append('folder', folder);

  const response = await fetch(`${API_BASE_URL}/upload/images`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.message || `Upload failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.urls || [];
};

// Helper function to extract error message from various error types
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
};

// Helper function to parse backend error response
export const parseBackendError = async (
  response: Response,
): Promise<string> => {
  try {
    const data = await response.json();
    if (data.message) {
      return Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message;
    }
    return data.error || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};
