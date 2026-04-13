import express from "express";
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { friendRouter } from "./modules/friend/friend.routes.js";
import { chatRouter } from "./modules/chat/chat.routes.js";
import { userRouter } from "./modules/user/user.routes.js";
import { createServer } from "http";
import { setupSocketIo } from "./lib/socket.js";

const app = express();
const httpServer = createServer(app);

export const io = setupSocketIo(httpServer)

// Enable CORS for mobile app
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

console.log("Mounting auth routes at /api/auth");
app.use("/api/auth", toNodeHandler(auth));

app.use("/api/friend", friendRouter);
app.use("/api/chat", chatRouter);
app.use("/api/user", userRouter);

app.get('/', (req, res) => {
    res.send("Hello from backend");
})

httpServer.listen(3000, "0.0.0.0", () => {
    console.log("Server is running at http://0.0.0.0:3000");
    console.log('Socket.IO server is ready');
})
