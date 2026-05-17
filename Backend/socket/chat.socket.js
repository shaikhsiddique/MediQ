const jwt = require("jsonwebtoken");
const { generateChatReply, summarizeChatHistory } = require("../services/ai.service");
const Patient = require("../models/patient.model");
const Report = require("../models/report.model");

const chatSessions = new Map();

const SUMMARY_TRIGGER_COUNT = 10;
const MIN_MESSAGES_FOR_SUMMARY = 1;

const getOrCreateActiveChat = (patient) => {
  let active = patient.chats.find((c) => c.status === "active");
  if (!active) {
    patient.chats.push({
      title: "Health Chat",
      messages: [],
      status: "active",
      startedAt: new Date(),
    });
    active = patient.chats[patient.chats.length - 1];
  }
  return active;
};

const setupChatSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Chat connected: ${socket.id} (${socket.userRole})`);

    if (!chatSessions.has(socket.userId)) {
      chatSessions.set(socket.userId, []);
    }

    socket.on("chat:init", async () => {
      try {
        if (socket.userRole !== "patient") return;

        const patient = await Patient.findById(socket.userId).select(
          "chats currentChatSummary chatSummaries"
        );

        if (!patient) return;

        const activeChat = patient.chats.find((c) => c.status === "active");
        const history = activeChat?.messages?.map((m) => ({
          role: m.role,
          content: m.content,
        })) || [];

        chatSessions.set(socket.userId, history.slice(-20));

        socket.emit("chat:history_loaded", {
          messages: activeChat?.messages || [],
          currentSummary: patient.currentChatSummary,
          summaries: patient.chatSummaries,
          chatId: activeChat?._id,
        });
      } catch (err) {
        console.error("Error loading chat:", err.message);
      }
    });

    socket.on("chat:message", async ({ message, history }) => {
      const trimmed = message?.trim();
      if (!trimmed) {
        socket.emit("chat:error", { message: "Message cannot be empty" });
        return;
      }

      socket.emit("chat:typing", { typing: true });

      try {
        const sessionHistory =
          history?.length > 0 ? history : chatSessions.get(socket.userId) || [];

        let userSummary = "";
        if (socket.userRole === "patient") {
          const [patient, latestReport] = await Promise.all([
            Patient.findById(socket.userId).select(
              "healthSummary monthlyHealthSummary latestHealthSummary currentChatSummary chats"
            ),
            Report.findOne({ patient: socket.userId })
              .sort({ reportDate: -1 })
              .select("extractedText glucoseLevel healthSummary reportDate"),
          ]);

          const summaryParts = [
            patient?.currentChatSummary,
            patient?.monthlyHealthSummary,
            patient?.latestHealthSummary,
            patient?.healthSummary,
          ].filter(Boolean);

          if (latestReport?.extractedText) {
            summaryParts.push(
              `Latest uploaded lab report (OCR, ${new Date(latestReport.reportDate).toLocaleDateString()}): ${latestReport.extractedText.slice(0, 2500)}`
            );
          } else if (latestReport?.glucoseLevel != null) {
            summaryParts.push(
              `Latest report glucose: ${latestReport.glucoseLevel} mg/dL`
            );
          }

          userSummary = summaryParts.join("\n\n");

          if (patient) {
            const activeChat = getOrCreateActiveChat(patient);
            activeChat.messages.push({
              role: "user",
              content: trimmed,
              createdAt: new Date(),
            });
            activeChat.messageCount = activeChat.messages.length;
            await patient.save();
          }
        }

        const reply = await generateChatReply(trimmed, sessionHistory, userSummary);

        const updatedHistory = [
          ...sessionHistory,
          { role: "user", content: trimmed },
          { role: "assistant", content: reply },
        ].slice(-20);

        chatSessions.set(socket.userId, updatedHistory);

        if (socket.userRole === "patient") {
          const patient = await Patient.findById(socket.userId).select("chats");
          if (patient) {
            const activeChat = getOrCreateActiveChat(patient);
            activeChat.messages.push({
              role: "assistant",
              content: reply,
              createdAt: new Date(),
            });
            activeChat.messageCount = activeChat.messages.length;
            await patient.save();
          }
        }

        socket.emit("chat:typing", { typing: false });
        socket.emit("chat:reply", { reply, history: updatedHistory });

        if (
          updatedHistory.length % SUMMARY_TRIGGER_COUNT === 0 &&
          socket.userRole === "patient"
        ) {
          summarizeAndSaveChat(socket.userId, updatedHistory);
        }
      } catch (err) {
        console.error("Chat error:", err.message);
        socket.emit("chat:typing", { typing: false });
        socket.emit("chat:error", {
          message: "Failed to generate response. Please try again.",
        });
      }
    });

    socket.on("chat:summarize", async () => {
      try {
        const sessionHistory = chatSessions.get(socket.userId) || [];

        if (sessionHistory.length === 0) {
          socket.emit("chat:error", { message: "No chat history to summarize" });
          return;
        }

        const summary = await summarizeAndSaveChat(socket.userId, sessionHistory);
        socket.emit("chat:summary_created", { summary });
      } catch (err) {
        console.error("Manual summarization error:", err.message);
        socket.emit("chat:error", { message: "Failed to create summary" });
      }
    });

    socket.on("chat:clear", async () => {
      try {
        const sessionHistory = chatSessions.get(socket.userId) || [];
        if (
          sessionHistory.length >= MIN_MESSAGES_FOR_SUMMARY &&
          socket.userRole === "patient"
        ) {
          await summarizeAndSaveChat(socket.userId, sessionHistory, true);
        }

        chatSessions.set(socket.userId, []);
        socket.emit("chat:cleared");
      } catch (err) {
        console.error("Clear chat error:", err.message);
        socket.emit("chat:cleared");
      }
    });

    socket.on("disconnect", async () => {
      try {
        if (socket.userRole === "patient") {
          const sessionHistory = chatSessions.get(socket.userId) || [];

          if (sessionHistory.length >= MIN_MESSAGES_FOR_SUMMARY) {
            await summarizeAndSaveChat(socket.userId, sessionHistory, true);
          }

          chatSessions.delete(socket.userId);
        }
      } catch (err) {
        console.error("Disconnect chat error:", err.message);
        chatSessions.delete(socket.userId);
      }
    });
  });
};

const summarizeAndSaveChat = async (userId, chatHistory, isFinal = false) => {
  try {
    const patient = await Patient.findById(userId);

    if (!patient) {
      console.error("Patient not found for summarization");
      return null;
    }

    const previousSummary = patient.currentChatSummary || "";
    const summaryData = await summarizeChatHistory(chatHistory, previousSummary);

    const activeChat = patient.chats.find((c) => c.status === "active");

    if (activeChat) {
      activeChat.summary = summaryData.summary;
      activeChat.topics = summaryData.topics || [];
      activeChat.messageCount = chatHistory.length;

      if (isFinal) {
        activeChat.status = "archived";
        activeChat.endedAt = new Date();
        patient.chatSummaries.push(summaryData);
        patient.currentChatSummary = "";
      } else {
        patient.currentChatSummary = summaryData.summary;
      }
    } else if (isFinal) {
      patient.chatSummaries.push(summaryData);
      patient.currentChatSummary = "";
    } else {
      patient.currentChatSummary = summaryData.summary;
    }

    await patient.save();
    return summaryData;
  } catch (err) {
    console.error("Error saving chat summary:", err.message);
    return null;
  }
};

module.exports = { setupChatSocket };
