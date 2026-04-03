import { prisma } from './src/lib/db.js';

async function setupAndTest() {
  try {
    console.log("=== Checking Database State ===\n");
    
    // Count users
    const userCount = await prisma.user.count();
    console.log("Total users:", userCount);
    
    // Count friends
    const friendCount = await prisma.friend.count();
    console.log("Total friendships:", friendCount);
    
    // Count messages
    const messageCount = await prisma.message.count();
    console.log("Total messages:", messageCount);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true }
      });
      console.log("\nUsers:", users.map(u => ({ id: u.id, name: u.name, email: u.email })));
    }
    
    if (friendCount > 0) {
      const friendships = await prisma.friend.findMany({
        include: {
          user1: { select: { name: true } },
          user2: { select: { name: true } }
        }
      });
      console.log("\nFriendships:", friendships.map(f => ({
        user1: f.user1.name,
        user2: f.user2.name
      })));
    }
    
    if (messageCount > 0) {
      const messages = await prisma.message.findMany({
        select: { id: true, senderId: true, receiverId: true, content: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 3
      });
      console.log("\nRecent messages:", messages);
    }
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupAndTest();
