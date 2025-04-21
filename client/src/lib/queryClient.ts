import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

/**
 * Make an API request to the backend
 */
export async function apiRequest(
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
  endpoint: string,
  data?: any
): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: "same-origin",
  };

  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, config);

  if (!response.ok) {
    // Get the error message from the server
    const errorData = await response.json().catch(() => ({
      message: "An unknown error occurred",
    }));

    // Create a custom error with the status and message
    const error = new Error(
      errorData.message || `API request failed with status ${response.status}`
    ) as Error & { status?: number };
    
    error.status = response.status;
    throw error;
  }

  return response;
}