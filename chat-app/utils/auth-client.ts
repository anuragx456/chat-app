import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { API_URL } from ".";

console.log("Auth client initializing with baseURL:", API_URL);

export const authClient = createAuthClient({
    baseURL: `${API_URL}/auth`, // Points to /api/auth
    plugins: [
        expoClient({
            scheme: "chatapp",
            storagePrefix: "chatapp",
            storage: SecureStore,
        })
    ]
});

console.log("Auth client created successfully");