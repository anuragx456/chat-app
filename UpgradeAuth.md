# Email Verification Setup Guide for Better-Auth

## Overview

This guide explains how to add email verification functionality to your chat app built with Better-Auth v1.5.5. The project already has the necessary database schema in place.

## Current State

### ✅ Already Implemented

- Better-Auth v1.5.5 with email/password authentication
- Prisma schema with `emailVerified` field in User model (default: false)
- Verification model for storing verification tokens
- React Native frontend with AuthContext
- PostgreSQL database setup

### ❌ Missing Components

- Email provider configuration (SMTP/transactional email service)
- Email verification triggers on signup
- Verification endpoint to confirm email
- Frontend UI for verification status and resend
- Optional: middleware to restrict unverified users

---

## Step-by-Step Setup

### 1. Choose an Email Service Provider

Select one of these options:

#### Option A: Resend (Recommended for production)
```bash
npm install resend
```
- Create account at https://resend.com
- Get API key from dashboard

#### Option B: SendGrid
```bash
npm install @sendgrid/mail
```
- Create account at https://sendgrid.com
- Generate API key

#### Option C: Nodemailer (Gmail/any SMTP)
```bash
npm install nodemailer
```
- Uses any SMTP server (Gmail, Outlook, custom)
- Good for development with ethereal.email

#### Option D: AWS SES
```bash
npm install @aws-sdk/client-ses
```
- Best for high-volume sending
- Requires AWS account

### 2. Backend Configuration

#### Update `backend/src/lib/auth.js`

Add the email provider plugin:

**For Resend:**
```javascript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { email } from "better-auth/plugins/email";
import { resend } from "better-auth/plugins/resend";
import { prisma } from "./db.js";
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
  plugins: [
    expo(),
    email({
      provider: resend({
        apiKey: process.env.RESEND_API_KEY,
        from: "Your App <noreply@yourdomain.com>",
      }),
    }),
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    verification: {
      enabled: true,  // This enables email verification
      expireIn: 24 * 60 * 60 * 1000, // 24 hours (optional)
    },
  },
  trustedOrigins: [
    "chatapp://",
    ...(process.env.NODE_ENV !== "production"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
  ],
  debug: process.env.NODE_ENV !== "production",
  allowDangerousConnection: process.env.NODE_ENV !== "production",
});
```

**For SendGrid:**
```javascript
import { sendGrid } from "better-auth/plugins/sendgrid";

plugins: [
  expo(),
  email({
    provider: sendGrid({
      apiKey: process.env.SENDGRID_API_KEY,
      from: "Your App <noreply@yourdomain.com>",
    }),
  }),
],
```

**For Nodemailer:**
```javascript
import { email } from "better-auth/plugins/email";
import { nodemailer } from "better-auth/plugins/nodemailer";

plugins: [
  expo(),
  email({
    provider: nodemailer({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
  }),
],
```

### 3. Environment Variables

Create or update `backend/.env` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"

# Email Provider (choose one)
# Resend
RESEND_API_KEY=re_your_api_key_here

# OR SendGrid
# SENDGRID_API_KEY=SG.your_api_key

# OR Nodemailer
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# App URL (used in verification emails)
APP_URL=http://localhost:3000
# For production:
# APP_URL=https://yourapp.com
```

### 4. Database Migration

Since the schema already has `emailVerified` field and `Verification` model, you just need to ensure the database is up-to-date:

```bash
cd backend
npx prisma generate
npx prisma db push  # or 'npx prisma migrate dev --name add_email_verification'
```

### 5. Backend Routes (Already Handled by Better-Auth)

Better-Auth automatically registers these routes when `email.verification.enabled` is true:

- `POST /api/auth/email/verify` - Verify email with token
- `POST /api/auth/email/resend-verification` - Resend verification email

The email verification flow:
1. User signs up → Better-Auth creates user with `emailVerified: false`
2. Verification token is automatically created in `Verification` table
3. Email with verification link is sent
4. User clicks link → frontend calls verify endpoint
5. User's `emailVerified` is set to `true`

### 6. Frontend Implementation

#### Update `chat-app/utils/auth-client.ts`

No changes needed if using Better-Auth's default email verification. The plugin handles the verification routes automatically.

#### Create Verification UI Component

Create `chat-app/components/EmailVerificationBanner.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { authClient } from '@/utils/auth-client';

export const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);

  if (!user || user.emailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsSending(true);
    try {
      await authClient.resendVerificationEmail({ email: user.email });
      Alert.alert('Success', 'Verification email sent!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send verification email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.banner}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.message}>
        Please verify your email address to access all features.
        Check your inbox for the verification link.
      </Text>
      <Button
        title={isSending ? 'Sending...' : 'Resend Verification Email'}
        onPress={handleResendVerification}
        disabled={isSending}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
  },
});
```

#### Integrate Banner into Your App

Update `chat-app/app/(tabs)/_layout.tsx` or main layout:

```typescript
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';

// Inside your component:
<EmailVerificationBanner />
```

Alternatively, wrap your main navigation with the banner in your root layout.

#### Update Login Screen to Check Verification

In your sign-in component (`chat-app/components/SignInScreen.tsx` or similar):

```typescript
const handleSignIn = async () => {
  const error = await signIn(email, password);

  if (error) {
    // Handle error
    return;
  }

  // After successful sign-in, check if email is verified
  // The user object in context will have emailVerified property
  // If not verified, show banner
};
```

### 7. Protect Verified-Only Routes (Optional)

Add middleware to your backend to restrict routes to verified users only.

Create `backend/src/middleware/require-verified.js`:

```javascript
export function requireVerified(req, res, next) {
  const user = req.auth?.user; // Better-Auth attaches user to req.auth

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!user.emailVerified) {
    return res.status(403).json({
      error: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  next();
}
```

Use it in your routes:

```javascript
import { requireVerified } from './middleware/require-verified.js';

// Example: protect friend routes
app.use("/api/friend", requireVerified, friendRouter);

// Or protect specific routes
router.post('/create-chat', requireVerified, createChatHandler);
```

### 8. Update TypeScript Types (Frontend)

Update `chat-app/contexts/auth-context.tsx` to include emailVerified:

```typescript
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    emailVerified?: boolean;  // Add this line
}
```

### 9. Customize Email Template (Optional)

Better-Auth allows customizing the verification email template.

Create `backend/src/lib/email-templates.ts`:

```typescript
export const verificationEmailTemplate = (verificationUrl: string) => ({
  subject: 'Verify your email address',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Chat App!</h2>
      <p>Please click the button below to verify your email address.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}"
           style="background-color: #4F46E5; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        This link will expire in 24 hours.
      </p>
    </div>
  `,
  text: `Verify your email: ${verificationUrl}`,
});
```

Update auth config to use custom template:

```javascript
import { email } from "better-auth/plugins/email";
import { verificationEmailTemplate } from "./lib/email-templates";

plugins: [
  expo(),
  email({
    provider: resend({ /* config */ }),
    templates: {
      verifyEmail: verificationEmailTemplate,
    },
  }),
],
```

---

## Complete Example: Using Resend

Here's a complete working example:

### 1. Install dependencies:

```bash
cd backend
npm install resend
```

### 2. Update auth.js:

```javascript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { email } from "better-auth/plugins/email";
import { resend } from "better-auth/plugins/resend";
import { prisma } from "./db.js";
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
  plugins: [
    expo(),
    email({
      provider: resend({
        apiKey: process.env.RESEND_API_KEY,
        from: "Chat App <noreply@yourdomain.com>",
      }),
    }),
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    verification: {
      enabled: true,
      expireIn: 24 * 60 * 60 * 1000,
    },
  },
  trustedOrigins: [
    "chatapp://",
    ...(process.env.NODE_ENV !== "production"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
  ],
  debug: process.env.NODE_ENV !== "production",
  allowDangerousConnection: process.env.NODE_ENV !== "production",
});
```

### 3. Set up .env:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/chat_app"
RESEND_API_KEY=re_xxxxxxxxxxxxx
APP_URL=http://localhost:3000
```

### 4. Update frontend:

Add the `EmailVerificationBanner` component and integrate it into your app layout.

---

## Testing

### Development Testing

1. **Use Ethereal.email for free test emails** (Nodemailer only):

Update Nodemailer config:
```javascript
noreply: {
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "your-ethereal-username",
    pass: "your-ethereal-password",
  },
}
```

Get test credentials at https://ethereal.email

2. **Check verification flow**:
   - Sign up a new user
   - Check console logs or email inbox
   - Click verification link
   - Verify `emailVerified` is `true` in database
   - Verify user can access protected routes

### Production Testing

1. **Configure domain authentication** (Resend/SendGrid):
   - Add and verify your sending domain
   - Set up SPF, DKIM, DMARC records

2. **Test with real email**:
   - Sign up with real email
   - Check spam folder if email not received
   - Verify link expires after 24h
   - Test resend functionality

---

## Important Notes

### Database Schema

The schema already includes:
- `User.emailVerified` - Boolean flag
- `Verification` model for tokens

No schema changes needed.

### Security Considerations

1. **Token Expiry**: Default 24 hours, configure via `expireIn`
2. **Rate Limiting**: Resend endpoint is rate-limited by Better-Auth
3. **Brute Force Protection**: Better-Auth has built-in protections
4. **Email Enumeration**: Be aware that signup reveals if email exists
   - Consider adding generic responses if privacy is concern

### User Experience

1. **Initial Sign-up**: Allow user to proceed even if unverified
2. **Banner/Notice**: Show persistent banner prompting verification
3. **Feature Gating**: Optionally restrict sensitive features until verified
4. **Resend**: Allow resend with cooldown (Better-Auth handles this)
5. **Change Email**: If user updates email, verification should restart
   - Better-Auth handles this automatically

### Production Checklist

- ✅ Configure email provider with authenticated domain
- ✅ Set up proper error handling for email failures
- ✅ Add email verification banner to UI
- ✅ Test full verification flow end-to-end
- ✅ Set up monitoring/logging for verification events
- ✅ Configure APP_URL for production domain
- ✅ Update custom email template with branding
- ✅ Test resend limits and error states
- ✅ Add analytics tracking for verification completion

---

## Troubleshooting

### Emails Not Sending

**Check**: Email provider configuration and API keys
**Logs**: Check backend console for errors
**Resend**: Enable debug mode in auth config

### Verification Link Not Working

**Check**: APP_URL environment variable is set correctly
**Check**: Frontend is calling `/api/auth/email/verify` correctly
**Check**: Token hasn't expired

### emailVerified Remains false

**Check**: Verify endpoint returns success
**Check**: Database transaction completed
**Check**: No middleware clearing the session

### Token Errors

**Check**: Token expired (default 24h)
**Check**: Token was already used (single use)
**Check**: Identifier (email) matches

---

## Additional Resources

- [Better-Auth Email Plugin Docs](https://www.better-auth.com/docs/plugins/email)
- [Better-Auth Email Verification](https://www.better-auth.com/docs/guides/email-verification)
- [Resend Documentation](https://resend.com/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/concepts/components/prisma-schema)

---

## Summary of Changes Required

| Step | File | Change |
|------|------|--------|
| 1 | `backend/src/lib/auth.js` | Add email plugin with provider config |
| 2 | `backend/.env` | Add email provider API key and APP_URL |
| 3 | `chat-app/contexts/auth-context.tsx` | Add `emailVerified` to AuthUser interface |
| 4 | `chat-app/components/` | Create EmailVerificationBanner component |
| 5 | App layout | Integrate banner in appropriate screen |
| 6 | Optional: `backend/src/middleware/require-verified.js` | Create middleware for protected routes |
| 7 | Optional: routes | Apply middleware where needed |

Total estimated time: 30-60 minutes (depending on email provider setup)
