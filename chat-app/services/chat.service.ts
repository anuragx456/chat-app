import { API_URL } from "@/utils";
import { authClient } from "@/utils/auth-client";

async function getHeaders(): Promise<Record<string, string>> {
  const cookie = authClient.getCookie?.() ?? "";
  return {
    "Content-Type": "application/json",
    ...(cookie ? { Cookie: cookie } : {}),
  };
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
}

export interface ChatUser {
  id: string;
  name: string;
  image?: string;
  lastMessage?: Message | null;
  unreadCount?: number;
}

export const chatService = {
    sendMessage: async (receiverId: string, content: string) => {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/chat/send`, {
            method: "POST",
            headers,
            body: JSON.stringify({receiverId, content})
        });

        const data = await safelyParseJson(res);

        if(!res.ok) throw new Error(data.message || "Failed to send Message");

        return data;
    },
    getMessages: async (otherUserId: string, limit?: number, cursor?: string) => {
        const headers = await getHeaders();

        const params = new URLSearchParams();

        if(limit) params.append("limit", limit.toString());
        if(cursor) params.append("cursor", cursor);

        const queryString = params.toString();

        const url = `${API_URL}/chat/messages/${otherUserId}${queryString ? `${queryString}` : ''}`;

        const res = await fetch(url, {
            method: 'GET',
            headers
        })

        const data = await safelyParseJson(res);

        if(!res.ok) throw new Error(data.message || "Failed to fetch Messages");

        return data;
    },
    getConversations: async () => {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/chat/conversations`, {
            method: 'GET',
            headers
        })

        const data = await safelyParseJson(res);

        if(!res.ok) throw new Error("Failed to fetch conversations");

        return data;
    },
    markRead: async (senderId: string) => {
        const headers = await getHeaders();
        const res = await fetch(`${API_URL}/chat/mark-read`, {
            method: 'POST',
            headers,
            body: JSON.stringify({senderId})
        })

        const data = await safelyParseJson(res);

        if(!res.ok) throw new Error("Failed to mark messages as read");

        return data;
    }
}

async function safelyParseJson(res: Response) {
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        return await res.json();
    }
    const text = await res.text();
    throw new Error(`Server returned non-JSON response (Content-Type: ${contentType || 'unknown'}): ${text.substring(0, 100)}`);
}