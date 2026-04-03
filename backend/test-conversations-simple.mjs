import { prisma } from './src/lib/db.js';
import { getConversation } from './src/modules/chat/chat.service.js';

async function simpleTest() {
  try {
    console.log("=== Finding a User with Friends ===\n");
    
    // Find a user who has at least one friend
    const userWithFriend = await prisma.friend.findFirst({
      include: {
        user1: { select: { id: true, name: true } },
        user2: { select: { id: true, name: true } }
      }
    });
    
    if (!userWithFriend) {
      console.log("No friendships found in database!");
      return;
    }
    
    const userId = userWithFriend.user1Id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true }
    });
    
    console.log("Testing with user:", user.name, user.id);
    console.log("Friendship:", userWithFriend.user1.name, "<->", userWithFriend.user2.name);
    
    console.log("\n=== Calling getConversation ===");
    const conversations = await getConversation(userId);
    
    console.log("Number of conversations:", conversations.length);
    console.log("\nFull response:");
    console.log(JSON.stringify(conversations, null, 2));
    
    // Validate each conversation has required fields
    console.log("\n=== Validation ===");
    conversations.forEach((conv, idx) => {
      console.log(`Conversation ${idx + 1}:`);
      console.log("  id:", conv.id);
      console.log("  name:", conv.name);
      console.log("  lastMessage:", conv.lastMessage);
      console.log("  unreadCount:", conv.unreadCount);
    });
    
  } catch (err) {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

simpleTest();
