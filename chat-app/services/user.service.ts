import { API_URL } from "@/utils";
import { authClient } from "../utils/auth-client";

async function getHeaders() {
    const cookie = authClient.getCookie?.() ?? "";
    return {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
    };
}

export interface UserInfo {
    id: string;
    name: string;
    email: string;
    image?: string;
}

export const userService = {
    getUserInfo: async (userId: string): Promise<UserInfo> => {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/user/${userId}`, {
            method: "GET",
            headers,
        });

        let data;
        const contentType = res.headers.get("content-type");
        if (contentType?.includes("application/json")) {
            data = await res.json();
        } else {
            const text = await res.text();
            throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
        }

        console.log("User info response:", data);
        if (!res.ok) throw new Error(data.message || "Failed to fetch user info");
        return data;
    },
    getNotificationCounts: async (): Promise<{ unreadMessages: number; pendingFriendRequests: number }> => {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/user/notifications/counts`, {
            method: "GET",
            headers,
        });
        const data = await res.clone().json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch notification counts");
        return data;
    },
};