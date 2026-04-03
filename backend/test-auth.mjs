import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./src/lib/db.js";
import { expo } from "@better-auth/expo";

console.log("Initializing auth...");
try {
  const auth = betterAuth({
    plugins: [expo()],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled:true
    },
    trustedOrigins: [
        "chatapp://", 
      "(process.env.NODE_ENV !== 'production' ? ['exp://', 'exp://**', 'exp://192.168.*.*:*/**'] : [])"
    ],
    debug: true,
    allowDangerousConnection: true,
  });
  
  console.log("Auth created:", auth);
  console.log("Auth keys:", Object.keys(auth || {}));
} catch (err) {
  console.error("Error creating auth:", err);
}
