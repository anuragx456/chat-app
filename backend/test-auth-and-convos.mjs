import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./src/lib/db.js";
import { expo } from "@better-auth/expo";
import fetch from "node-fetch";

const auth = betterAuth({
  plugins: [expo()],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  trustedOrigins: ["chatapp://"],
  debug: false,
  allowDangerousConnection: true,
});

async function test() {
  // Step 1: Sign in
  const signInRes = await auth.api.signInEmail({
    body: { email: "testuser@gmail.com", password: "anypassword" }
  });
  
  console.log("=== Sign-in Result ===\n");
  console.log("Status:", signInRes.status);
  console.log("Body:", signInRes.body ? JSON.stringify(signInRes.body, null, 2) : "No body");
  
  if (signInRes.status !== 200 || !signInRes.body?.session) {
    console.log("\nSession not found. Trying to create a user first...");
    const signUpRes = await auth.api.signUpEmail({
      body: { name: "Test User", email: "testuser@gmail.com", password: "password123" }
    });
    console.log("Sign-up status:", signUpRes.status);
    if (signUpRes.body?.user) {
      console.log("User created, now trying sign-in again...");
      const retrySignIn = await auth.api.signInEmail({
        body: { email: "testuser@gmail.com", password: "password123" }
      });
      console.log("Retry sign-in status:", retrySignIn.status);
      console.log("Retry sign-in body:", JSON.stringify(retrySignIn.body, null, 2));
    }
    return;
  }
  
  // Step 2: Get the session token and use it directly in fetch
  const token = signInRes.body.session.token;
  console.log("\n=== Testing Conversations API ===");
  
  const convRes = await fetch("http://localhost:3000/api/chat/conversations", {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  
  console.log("Conversations status:", convRes.status);
  const convData = await convRes.json();
  console.log("Conversations response:", JSON.stringify(convData, null, 2));
}

test().catch(console.error);
