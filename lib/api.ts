import { useEffect } from "react";
import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import { NDKEvent, NDKNip07Signer } from "@nostr-dev-kit/ndk";
import ndk from "./nostr/ndk";

/**
 * Base fetcher function that includes the JWT token in the Authorization header
 */
export const fetcher = async (url: string) => {
    let token = localStorage.getItem("auth_token");

    const makeRequest = async (tokenToUse?: string) => {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };
        if (tokenToUse) {
            headers["Authorization"] = `Bearer ${tokenToUse}`;
        }
        return fetch(url, { headers });
    };

    let response = await makeRequest(token ?? undefined);

    // Handle error responses
    if (!response.ok) {
        // Try to handle 401 with newToken
        if (response.status === 401) {
            const errorData = await response.json().catch(() => ({}));
            if (errorData && errorData.newToken) {
                // Store new token and retry once
                localStorage.setItem("auth_token", errorData.newToken);
                response = await makeRequest(errorData.newToken);
                if (response.ok) {
                    return response.json();
                }
                // If still not ok, fall through to error
            }
            // Check if this is a token expired error
            if (errorData && errorData.error === "Token expired") {
                try {
                    // Try to refresh the token
                    const newToken = await refreshAuthToken();
                    if (newToken) {
                        // Retry the request with the new token
                        response = await makeRequest(newToken);
                        if (response.ok) {
                            return response.json();
                        }
                    }
                } catch (refreshError) {
                    console.error("Failed to refresh token:", refreshError);
                    // Fall through to error handling
                }
            }
            
            // If token refresh failed or it's another type of error
            const error = new Error("API request failed");
            (error as any).status = response.status;
            (error as any).info = errorData;
            throw error;
        } else {
            const error = new Error("API request failed");
            const errorData = await response.json().catch(() => ({}));
            (error as any).status = response.status;
            (error as any).info = errorData;
            throw error;
        }
    }

    return response.json();
};

/**
 * Custom hook for authenticated API requests using SWR
 */
export function useApi<Data = any, Error = any>(
    url: string | null,
    config?: SWRConfiguration,
): SWRResponse<Data, Error> {
    const swr = useSWR<Data, Error>(url, fetcher, {
        revalidateOnFocus: true,
        ...config,
    });

    // Revalidate when auth token changes
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "auth_token" && url) {
                swr.mutate();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [url, swr]);

    return swr;
}
/**
 * Authenticated GET request (for non-SWR usage)
 */
export async function apiGet(url: string) {
    const token = localStorage.getItem("auth_token");
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        method: "GET",
        headers,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Check if this is a token expired error
        if (response.status === 401 && errorData && errorData.message === "Token expired") {
            alert('token expired')
            try {
                // Try to refresh the token
                const newToken = await refreshAuthToken();
                if (newToken) {
                    // Retry the request with the new token
                    const retryResponse = await fetch(url, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${newToken}`
                        }
                    });
                    
                    if (retryResponse.ok) {
                        return retryResponse.json();
                    }
                    
                    // If retry failed, fall through to error handling
                }
            } catch (refreshError) {
                console.error("Failed to refresh token:", refreshError);
                // Fall through to error handling
            }
        }
        
        // If token refresh failed or it's another type of error
        const error = new Error("API request failed");
        (error as any).status = response.status;
        (error as any).info = errorData;
        throw error;
    }
    return response.json();
}


/**
 * Authenticated POST request
 */
export async function apiPost(url: string, data: any) {
    const token = localStorage.getItem("auth_token");

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    // Add Authorization header if token exists
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    });

    // Handle error responses
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Check if this is a token expired error
        if (response.status === 401 && errorData && errorData.message === "Token expired") {
            try {
                // Try to refresh the token
                const newToken = await refreshAuthToken();
                if (newToken) {
                    // Retry the request with the new token
                    const retryResponse = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${newToken}`
                        },
                        body: JSON.stringify(data)
                    });
                    
                    if (retryResponse.ok) {
                        return retryResponse.json();
                    }
                    
                    // If retry failed, fall through to error handling
                }
            } catch (refreshError) {
                console.error("Failed to refresh token:", refreshError);
                // Fall through to error handling
            }
        }
        
        // If token refresh failed or it's another type of error
        const error = new Error("API request failed");
        (error as any).status = response.status;
        (error as any).info = errorData;
        throw error;
    }

    return response.json();
}

/**
 * Authenticated PUT request
 */
export async function apiPut(url: string, data: any) {
    const token = localStorage.getItem("auth_token");

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    // Add Authorization header if token exists
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
    });

    // Handle error responses
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Check if this is a token expired error
        if (response.status === 401 && errorData && errorData.message === "Token expired") {
            try {
                // Try to refresh the token
                const newToken = await refreshAuthToken();
                if (newToken) {
                    // Retry the request with the new token
                    const retryResponse = await fetch(url, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${newToken}`
                        },
                        body: JSON.stringify(data)
                    });
                    
                    if (retryResponse.ok) {
                        return retryResponse.json();
                    }
                    
                    // If retry failed, fall through to error handling
                }
            } catch (refreshError) {
                console.error("Failed to refresh token:", refreshError);
                // Fall through to error handling
            }
        }
        
        // If token refresh failed or it's another type of error
        const error = new Error("API request failed");
        (error as any).status = response.status;
        (error as any).info = errorData;
        throw error;
    }

    return response.json();
}

/**
 * Authenticated DELETE request
 */
export async function apiDelete(url: string) {
    const token = localStorage.getItem("auth_token");

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    // Add Authorization header if token exists
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method: "DELETE",
        headers,
    });

    // Handle error responses
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Check if this is a token expired error
        if (response.status === 401 && errorData && errorData.message === "Token expired") {
            try {
                // Try to refresh the token
                const newToken = await refreshAuthToken();
                if (newToken) {
                    // Retry the request with the new token
                    const retryResponse = await fetch(url, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${newToken}`
                        }
                    });
                    
                    if (retryResponse.ok) {
                        // If 204 No Content, return null (don't try to parse JSON)
                        if (retryResponse.status === 204) {
                            return null;
                        }
                        return retryResponse.json();
                    }
                    
                    // If retry failed, fall through to error handling
                }
            } catch (refreshError) {
                console.error("Failed to refresh token:", refreshError);
                // Fall through to error handling
            }
        }
        
        // If token refresh failed or it's another type of error
        const error = new Error("API request failed");
        (error as any).status = response.status;
        (error as any).info = errorData;
        throw error;
    }

    // If 204 No Content, return null (don't try to parse JSON)
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

/**
 * Creates a NIP-98 AUTH event for authentication
 */
async function createNIP98AuthEvent(url: string, method: string): Promise<NDKEvent | null> {
    try {
        // Check if window.nostr is available (NIP-07 extension)
        if (typeof window === 'undefined' || !window.nostr) {
            throw new Error("No Nostr extension found. Please install a Nostr browser extension.");
        }

        // Create a NIP-07 signer
        const signer = new NDKNip07Signer();
        
        // Create a new event
        const event = new NDKEvent(ndk);
        
        // Set event properties
        event.kind = 27235; // NIP-98 AUTH event kind
        event.content = ""; // Content can be empty for AUTH events
        event.tags = [
            ["u", url], // URL being accessed
            ["method", method], // HTTP method
        ];
        event.created_at = Math.floor(Date.now() / 1000); // Current timestamp
        
        // Sign the event
        await event.sign(signer);
        
        return event;
    } catch (error) {
        console.error("Error creating NIP-98 event:", error);
        throw error;
    }
}

/**
 * Refreshes the authentication token by creating a new NIP-98 event
 * and sending it to the server
 */
export async function refreshAuthToken(): Promise<string | null> {
    try {
        // Create a NIP-98 AUTH event
        const event = await createNIP98AuthEvent("/api/auth/login", "POST");
        
        if (!event) {
            throw new Error("Failed to create authentication event");
        }
        
        // Send the event to the backend
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                event: event.rawEvent(),
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Failed to refresh token: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.token) {
            throw new Error("No token received from server");
        }
        
        // Store the new JWT token in localStorage for API requests
        localStorage.setItem("auth_token", data.token);
        
        // Store the JWT token in a cookie for the middleware
        document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Strict`;
        
        // Dispatch a storage event so other tabs can pick up the change
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'auth_token',
            newValue: data.token,
        }));
        
        return data.token;
    } catch (error) {
        console.error("Failed to refresh auth token:", error);
        
        // Show an error to the user
        if (typeof window !== 'undefined') {
            alert("Your session has expired. Please sign in again.");
            
            // Redirect to login page
            window.location.href = "/login";
        }
        
        return null;
    }
}
