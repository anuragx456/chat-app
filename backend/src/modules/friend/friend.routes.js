import { Router } from "express";
import { requireAuth } from "../../lib/require-auth.js";
import { acceptRequest, cancelRequest, discover, listFriends, rejectRequest, sendRequest } from "./friend.controller.js";


export const friendRouter = Router();

friendRouter.use(requireAuth)

// Send Request
friendRouter.post("/request", sendRequest);

// List friends
friendRouter.get("/list", listFriends);

// Discover friends
friendRouter.get("/discover", discover);

// Friend Request Endpoints
// Accept Friend Request
friendRouter.post("/request/id/:requestId/accept", acceptRequest)

// Reject Friend Request
friendRouter.post("/request/id/:requestId/reject", rejectRequest)

// Cancel Friend Request
friendRouter.post("/request/id/:requestId/cancel", cancelRequest)