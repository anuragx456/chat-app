import { prisma } from './src/lib/db.js';
import { getConversation } from './src/modules/chat/chat.service.js';

async function finalTest() {
  try {
    console.log("=== Using Existing Database User ===\n");
    
    // Get batman67 user ID from earlier test
    const batman = await prisma.user.findFirst({
      where: { email: "batman67@gmail.com" },
      select: { id: true, name: true }
    });
    
    if (!batman) {
      console.log("User not found!");
      return;
    }
    
    console.log("Testing with user:", batman.name, batman.id);
    
    // Check friendships
    const friendships = await prisma.friend.findMany({
      where: {
        OR: [
          { userId1: batman.id },
          { userId2: batman.id }
        ]
      },
      include: {
        user1: { select: { name: true } },
        user2: { select: { name: true } }
      }
    });
    
    console.log("Friendships count:", friendships.length);
    friendships.forEach(f => {
      console.log(`  ${f.user1.name} <-> ${f.user2.name}`);
    });
    
    console.log("\n=== Calling getConversation ===");
    const conversations = await getConversation(batman.id);
    
    console.log("Number of conversations returned:", conversations.length);
    
    if (conversations.length === 0) {
      console.log("ERROR: Expected conversations but got empty array!");
    } else {
      console.log("\nConversations:");
      console.log(JSON.stringify(conversations, null, 2));
      
      // Validate structure
      console.log("\n=== Validation ===");
      conversations.forEach((conv, idx) => {
        console.log(`Conversation ${idx + 1}:`);
        console.log("  id:", conv.id);
        console.log("  name:", conv.name);
        console.log("  lastMessage:", conv.lastMessage);
        console.log("  unreadCount:", conv.unreadCount);
      });
    }
    
  } catch (err) {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

finalTest();
