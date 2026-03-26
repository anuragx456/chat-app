import { Router } from "express";
import { requireAuth } from "../../lib/require-auth.js";


export const friendRouter = Router();

friendRouter.use(requireAuth)

// Send Request
friendRouter.post("/request", sendRequest);

// List friends
friendRouter.get("/list", listFriends);

// Discover friends
friendRouter.get("/discover", discover);