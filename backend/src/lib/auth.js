import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db.js"
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
  plugins: [expo()],
  database: prismaAdapter(prisma, {
      provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
      enabled:true
  },
  trustedOrigins: [
      "chatapp://", 
    ...(process.env.NODE_ENV !== "production" ?
      ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),    
  ],
  debug: process.env.NODE_ENV !== "production",
  allowDangerousConnection:process.env.NODE_ENV !== "production",
});