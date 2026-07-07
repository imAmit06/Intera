import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";
import mongoose from "mongoose";

export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res
        .status(400)
        .json({ msg: "Problem or difficulty is not defined." });
    }

    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const sessionId = new mongoose.Types.ObjectId();

    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by: clerkId,
        custom: { problem, difficulty, sessionId: sessionId.toString() },
      },
    });

    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    const session = await Session.create({
      _id: sessionId,
      problem,
      difficulty,
      host: userId,
      callId,
    });

    res.status(201).json({ session });
  } catch (error) {
    console.log(`Error is createSession controller: ${error.message}`);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImg email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log(`Error is getActiveSession controller: ${error.message}`);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log(`Error is getMyRecentSessions controller: ${error.message}`);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid session ID." });
    }

    const session = await Session.findById(id)
      .populate("host", "name email profileImg clerkId")
      .populate("participant", "name email profileImg clerkId");

    if (!session) {
      return res.status(404).json({ msg: "Session not found." });
    }

    return res.status(200).json({ session });
  } catch (error) {
    console.log(`Error is getSessionById controller: ${error.message}`);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid session ID." });
    }

    const session = await Session.findOneAndUpdate(
      { _id: id, participant: null },
      { participant: userId },
      { new: true }
    );

    if (!session) {
      return res.status(400).json({ msg: "Session not found or already full" });
    }

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session });
  } catch (error) {
    console.log(`Error is joinSession controller: ${error.message}`);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid session ID." });
    }

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ msg: "Session not found" });

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ msg: "Only the host can end the session" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ msg: "Session is already completed" });
    }

    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    session.status = "completed";
    await session.save();

    res.status(200).json({ msg: "Session ended successfully" });
  } catch (error) {
    console.log(`Error is endSession controller: ${error.message}`);
    res.status(500).json({ msg: "Internal Server Error" });
  }
}
