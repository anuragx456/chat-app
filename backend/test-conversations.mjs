import { prisma } from './src/lib/db.js';

async function testConversations() {
  try {
    console.log("=== Creating Test Users & Friendships ===\n");
    
    // Create two test users if they don't exist
    const [user1, user2] = await Promise.all([
      prisma.user.upsert({
        where: { email: "alice@test.com" },
        update: {},
        create: { 
          id: "user-alice-123", 
          name: "Alice", 
          email: "alice@test.com",
          emailVerified: true
        }
      }),
      prisma.user.upsert({
        where: { email: "bob@test.com" },
        update: {},
        create: { 
          id: "user-bob-456", 
          name: "Bob", 
          email: "bob@test.com",
          emailVerified: true
        }
      })
    ]);
    
    console.log("Created/Found users:", user1.name, user2.name);
    
    // Create friendship if not exists
    const [f1, f2] = await Promise.all([
      prisma.friend.upsert({
        where: {
          userId1_userId2: {
            userId1: user1.id,
            userId2: user2.id
          }
        },
        update: {},
        create: {
          userId1: user1.id,
          userId2: user2.id
        }
      }),
      prisma.friend.upsert({
        where: {
          userId1_userId2: {
            userId1: user2.id,
            userId2: user1.id
          }
        },
        update: {},
        create: {
          userId1: user2.id,
          userId2: user1.id
        }
      })
    ]);
    
    console.log("Friendships created/found");
    
    // Now test getConversation directly
    console.log("\n=== Testing getConversation for Alice ===");
    
    const { getConversation } = await import("./src/modules/chat/chat.service.js");
    
    const conversations = await getConversation(user1.id);
    
    console.log("Conversations:", JSON.stringify(conversations, null, 2));
    
  } catch (err) {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testConversations();
