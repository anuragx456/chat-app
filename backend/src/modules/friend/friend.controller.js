import {
  acceptFriendRequest,
  cancelFriendRequest,
  discoverUser,
  getFriendsDetails,
  rejectFriendRequest,
  sendFriendRequest,
} from "./friend.service.js";

export async function sendRequest(req, res) {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    const result = await sendFriendRequest(senderId, receiverId);
    // TODO : IMPLEMENT PUSH NOTIFICATION LATER

    return res.json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to send request" });
  }
}

export async function listFriends(req, res) {
  try {
    const userId = req.user.id;
    const data = await getFriendsDetails(userId);

    return res.json(data);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to list user" });
  }
}

export async function discover(req, res) {
  try {
    const userId = req.user.id;
    const search = req.query.search;

    const data = await discoverUser(userId, search);

    return res.json(data);
  } catch (err) {
    return res
      .status(400)
      .json({ message: err.message || "Failed to find user" });
  }
}

export async function acceptRequest(req, res) {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const result = await acceptFriendRequest(requestId, userId);

    return res.json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to accept request" });
  }
}

export async function rejectRequest(req, res) {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const result = await rejectFriendRequest(requestId, userId);

    return res.json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to reject request" });
  }
}

export async function cancelRequest(req, res) {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const result = await cancelFriendRequest(requestId, userId);

    return res.json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to cancel request" });
  }
}
