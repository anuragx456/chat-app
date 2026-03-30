# Database Schema Documentation

## Overview
This document describes the database schema for the chat application, detailing all models, their fields, relationships, and constraints.

## Models

### Test
A simple test model for development purposes.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| id | String | @default(cuid()) @id | Unique identifier |
| name | String | | Name field |
| description | String | | Description field |

### User
Core user model representing application users.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| id | String | @id | Unique identifier |
| name | String | | User's display name |
| email | String | @@unique | User's email address (unique) |
| emailVerified | Boolean | @default(false) | Email verification status |
| image | String? | | Profile image URL (optional) |
| createdAt | DateTime | @default(now()) | Account creation timestamp |
| updatedAt | DateTime | @updatedAt | Last update timestamp |
| sessions | Session[] | | User's sessions (one-to-many) |
| accounts | Account[] | | User's connected accounts (one-to-many) |
| friendRequestsSent | FriendRequest[] | @relation("FriendRequestsSent") | Friend requests sent by user |
| friendRequestsReceived | FriendRequest[] | @relation("FriendRequestsReceived") | Friend requests received by user |
| friends | Friend[] | @relation("Friends1") | Friend relationships (user as userId1) |
| friendsOf | Friend[] | @relation("Friends2") | Friend relationships (user as userId2) |

**Indexes:**
- @@unique([email]) - Ensures email uniqueness
- @@map("user") - Maps to "user" table in database

### Session
Represents user authentication sessions.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| id | String | @id | Unique session identifier |
| expiresAt | DateTime | | Session expiration timestamp |
| token | String | @@unique | Session token (unique) |
| createdAt | DateTime | @default(now()) | Session creation timestamp |
| updatedAt | DateTime | @updatedAt | Last update timestamp |
| ipAddress | String? | | User's IP address (optional) |
| userAgent | String? | | User's browser/client info (optional) |
| userId | String | | Foreign key to User |
| user | User | @relation(fields: [userId], references: [id], onDelete: Cascade) | Relation to User |

**Indexes:**
- @@unique([token]) - Ensures token uniqueness
- @@index([userId]) - Index for faster user-based lookups
- @@map("session") - Maps to "session" table in database

### Account
Represents connected third-party accounts (OAuth, etc.).

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| id | String | @id | Unique identifier |
| accountId | String | | Third-party account ID |
| providerId | String | | Provider identifier (e.g., "google", "github") |
| userId | String | | Foreign key to User |
| user | User | @relation(fields: [userId], references: [id], onDelete: Cascade) | Relation to User |
| accessToken | String? | | OAuth access token (optional) |
| refreshToken | String? | | OAuth refresh token (optional) |
| idToken | String? | | OAuth ID token (optional) |
| accessTokenExpiresAt | DateTime? | | Access token expiration (optional) |
| refreshTokenExpiresAt | DateTime? | | Refresh token expiration (optional) |
| scope | String? | | OAuth scopes (optional) |
| password | String? | | Password for credential providers (optional) |
| createdAt | DateTime | @default(now()) | Account connection timestamp |
| updatedAt | DateTime | @updatedAt | Last update timestamp |

**Indexes:**
- @@index([userId]) - Index for faster user-based lookups
- @@map("account") - Maps to "account" table in database

### Verification
Handles email verification tokens.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| id | String | @id | Unique identifier |
| identifier | String | | Email address being verified |
| value | String | | Verification token value |
| expiresAt | DateTime | | Token expiration timestamp |
| createdAt | DateTime | @default(now()) | Token creation timestamp |
| updatedAt | DateTime | @updatedAt | Last update timestamp |

**Indexes:**
- @@index([identifier]) - Index for faster lookup by email
- @@map("verification") - Maps to "verification" table in database

### FriendRequest
Represents friend requests between users.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| senderId | String | | ID of user sending request |
| receiverId | String | | ID of user receiving request |
| sender | User | @relation("FriendRequestsSent", fields: [senderId], references: [id], onDelete: Cascade) | Relation to sending user |
| receiver | User | @relation("FriendRequestsReceived", fields: [receiverId], references: [id], onDelete: Cascade) | Relation to receiving user |
| status | FriendRequestStatus | @default(PENDING) | Request status (see enum below) |
| createdAt | DateTime | @default(now()) | Request creation timestamp |
| updatedAt | DateTime | @updatedAt | Last update timestamp |

**Indexes:**
- @@unique([senderId, receiverId]) - Prevents duplicate requests
- @@index([receiverId]) - Index for finding requests received by user
- @@index([senderId]) - Index for finding requests sent by user

### Friend
Represents mutual friend relationships between users.

| Field | Type | Attributes | Description |
|-------|------|------------|-------------|
| id | String | @id @default(cuid()) | Unique identifier |
| userId1 | String | | First user in friendship |
| userId2 | String | | Second user in friendship |
| user1 | User | @relation("Friends1", fields: [userId1], references: [id], onDelete: Cascade) | Relation to first user |
| user2 | User | @relation("Friends2", fields: [userId2], references: [id], onDelete: Cascade) | Relation to second user |
| createdAt | DateTime | @default(now()) | Friendship creation timestamp |
| updatedAt | DateTime | @updatedAt | Last update timestamp |

**Indexes:**
- @@unique([userId1, userId2]) - Prevents duplicate friendships
- @@index([userId1]) - Index for lookups by first user
- @@index([userId2]) - Index for lookups by second user

### FriendRequestStatus
Enum defining possible states of a friend request.

| Value | Description |
|-------|-------------|
| PENDING | Request sent but not yet responded to |
| ACCEPTED | Request accepted by receiver |
| REJECTED | Request rejected by receiver |
| CANCELLED | Request cancelled by sender |

## Relationship Diagram

```mermaid
erDiagram
    USER ||..|| SESSION : has
    USER ||..|| ACCOUNT : has
    USER ||..|| FRIEND_REQUEST_SENT : sends
    USER ||..|| FRIEND_REQUEST_RECEIVED : receives
    USER }o..|| FRIEND : has
    USER }o..|| FRIEND : is_friend_of

    FRIEND_REQUEST_SENT }o..|| USER : from
    FRIEND_REQUEST_RECEIVED }o..|| USER : to

    FRIEND_REQUEST ||..|| USER : sender
    FRIEND_REQUEST ||..|| USER : receiver

    FRIEND ||..|| USER : user1
    FRIEND ||..|| USER : user2

    TEST {
        String id PK
        String name
        String description
    }

    USER {
        String id PK
        String name
        String email UK
        Boolean emailVerified
        String? image
        DateTime createdAt
        DateTime updatedAt
    }

    SESSION {
        String id PK
        DateTime expiresAt
        String token UK
        DateTime createdAt
        DateTime updatedAt
        String? ipAddress
        String? userAgent
        String userId FK
    }

    ACCOUNT {
        String id PK
        String accountId
        String providerId
        String? accessToken
        String? refreshToken
        String? idToken
        DateTime? accessTokenExpiresAt
        DateTime? refreshTokenExpiresAt
        String? scope
        String? password
        DateTime createdAt
        DateTime updatedAt
        String userId FK
    }

    VERIFICATION {
        String id PK
        String identifier
        String value
        DateTime expiresAt
        DateTime createdAt
        DateTime updatedAt
    }

    FRIEND_REQUEST {
        String id PK
        String senderId FK
        String receiverId FK
        FriendRequestStatus status
        DateTime createdAt
        DateTime updatedAt
    }

    FRIEND {
        String id PK
        String userId1 FK
        String userId2 FK
        DateTime createdAt
        DateTime updatedAt
    }
```

## Relationship Details

### User Relationships
- **Sessions**: One-to-Many (User 1 → ∞ Session) - A user can have multiple active sessions
- **Accounts**: One-to-Many (User 1 → ∞ Account) - A user can connect multiple third-party accounts
- **Friend Requests Sent**: One-to-Many (User 1 → ∞ FriendRequest) - Tracks requests user sent
- **Friend Requests Received**: One-to-Many (User 1 → ∞ FriendRequest) - Tracks requests user received
- **Friends**: One-to-Many via Friend table (User 1 → ∞ Friend) - Tracks user's friendships

### FriendRequest Relationships
- **Sender**: Many-to-One (FriendRequest → User) - User who sent the request
- **Receiver**: Many-to-One (FriendRequest → User) - User who received the request

### Friend Relationships
- **User1**: Many-to-One (Friend → User) - First user in friendship pair
- **User2**: Many-to-One (Friend → User) - Second user in friendship pair

## Constraints and Indexes

### Unique Constraints
- User.email - Ensures no duplicate email addresses
- Session.token - Ensures session tokens are unique
- FriendRequest(senderId, receiverId) - Prevents duplicate friend requests between same users
- Friend(userId1, userId2) - Prevents duplicate friendships (order-independent)

### Indexes
- User.email - For fast email-based lookups
- Session.userId - For finding user's sessions
- Account.userId - For finding user's connected accounts
- Verification.identifier - For finding verification tokens by email
- FriendRequest.receiverId - For finding requests received by user
- FriendRequest.senderId - For finding requests sent by user
- Friend.userId1 - For finding friendships by first user
- Friend.userId2 - For finding friendships by second user

## Cascade Deletes
- When a User is deleted:
  - All associated Sessions are deleted (CASCADE)
  - All associated Accounts are deleted (CASCADE)
  - All sent FriendRequests are deleted (CASCADE)
  - All received FriendRequests are deleted (CASCADE)
  - All Friend relationships where user is userId1 are deleted (CASCADE)
  - All Friend relationships where user is userId2 are deleted (CASCADE)

## Notes
1. The schema uses `@@map` directives to explicitly define table names in the database
2. Timestamps use `@default(now())` for creation and `@updatedAt` for automatic updates
3. Soft deletes are not implemented; relationships use hard deletes with CASCADE where appropriate
4. The Test model appears to be for development/testing purposes only