import fetch from 'node-fetch';

const API_URL = "http://localhost:3000/api";

async function testEndpoints() {
  try {
    // Test conversations endpoint without auth
    console.log("Testing /api/chat/conversations (unauthenticated):");
    const convRes = await fetch(`${API_URL}/chat/conversations`);
    console.log("Status:", convRes.status, convRes.statusText);
    console.log("Body:", await convRes.text());
    
    console.log("\n---\n");
    
    // Test if route exists at all
    console.log("Testing /api/chat (should 404):");
    const rootRes = await fetch(`${API_URL}/chat`);
    console.log("Status:", rootRes.status, rootRes.statusText);
    
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testEndpoints();
