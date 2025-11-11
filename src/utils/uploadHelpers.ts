// Helper function for uploading images to the backend
export const uploadImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await fetch("http://localhost:5000/upload/images", {
    method: "POST",
    credentials: "include",
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
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "An unknown error occurred";
};

// Helper function to parse backend error response
export const parseBackendError = async (
  response: Response
): Promise<string> => {
  try {
    const data = await response.json();
    if (data.message) {
      return Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message;
    }
    return data.error || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};
