import { prisma } from './src/lib/db.js';
import { getConversation } from './src/modules/chat/chat.service.js';

async function fullTest() {
  try {
    console.log("=== Creating Test User with Email/Password ===\n");
    
    // Create user with account (email/password)
    const user = await prisma.user.upsert({
      where: { email: "testalice@example.com" },
      update: {},
      create: { 
        id: "alice-test-001", 
        name: "Alice Test", 
        email: "testalice@example.com",
        emailVerified: true
      }
    });
    
    // Create account for password auth
    await prisma.account.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId: user.id,
          provider: "email",
          providerAccountId: user.email
        }
      },
      update: {},
      create: {
        userId: user.id,
        type: "email",
        provider: "email",
        providerAccountId: user.email,
        password: "hashed_password_123"
      }
    });
    
    console.log("User created:", user.name, user.id);
    
    // Create another user
    const friend = await prisma.user.upsert({
      where: { email: "testbob@example.com" },
      update: {},
      create: { 
        id: "bob-test-001", 
        name: "Bob Test", 
        email: "testbob@example.com",
        emailVerified: true
      }
    });
    
    await prisma.account.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId: friend.id,
          provider: "email",
          providerAccountId: friend.email
        }
      },
      update: {},
      create: {
        userId: friend.id,
        type: "email",
        provider: "email",
        providerAccountId: friend.email,
        password: "hashed_password_123"
      }
    });
    
    console.log("Friend created:", friend.name, friend.id);
    
    // Create friendship in normalized order
    const [u1, u2] = [user.id, friend.id].sort();
    
    await prisma.friend.upsert({
      where: {
        userId1_userId2: { userId1: u1, userId2: u2 }
      },
      update: {},
      create: {
        userId1: u1,
        userId2: u2
      }
    });
    
    console.log("Friendship created (normalized order):", u1, u2);
    
    // Test getConversation
    console.log("\n=== Testing getConversation for Alice ===");
    const conversations = await getConversation(user.id);
    
    console.log("Number of conversations:", conversations.length);
    console.log("Conversations:", JSON.stringify(conversations, null, 2));
    
    // Verify structure
    if (conversations.length > 0) {
      const conv = conversations[0];
      console.log("\n=== Validation ===");
      console.log("Has 'id':", 'id' in conv);
      console.log("Has 'name':", 'name' in conv);
      console.log("Has 'lastMessage':", 'lastMessage' in conv);
      console.log("Has 'unreadCount':", 'unreadCount' in conv);
      console.log("lastMessage value:", conv.lastMessage);
      console.log("unreadCount value:", conv.unreadCount);
    }
    
  } catch (err) {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

fullTest();
