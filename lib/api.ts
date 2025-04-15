import { useEffect } from "react";
import useSWR, { SWRConfiguration, SWRResponse } from "swr";

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
            // If no newToken or retry failed, throw error as before
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
        const error = new Error("API request failed");
        const errorData = await response.json().catch(() => ({}));
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
        const error = new Error("API request failed");
        const errorData = await response.json().catch(() => ({}));
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
        const error = new Error("API request failed");
        const errorData = await response.json().catch(() => ({}));
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
        const error = new Error("API request failed");
        const errorData = await response.json().catch(() => ({}));
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
