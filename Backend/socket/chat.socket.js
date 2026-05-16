const jwt = require("jsonwebtoken");
const { generateChatReply } = require("../services/gemini.service");

const chatSessions = new Map();

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

        const reply = await generateChatReply(trimmed, sessionHistory);

        const updatedHistory = [
          ...sessionHistory,
          { role: "user", content: trimmed },
          { role: "assistant", content: reply },
        ].slice(-20);

        chatSessions.set(socket.userId, updatedHistory);

        socket.emit("chat:typing", { typing: false });
        socket.emit("chat:reply", { reply, history: updatedHistory });
      } catch (err) {
        console.error("Gemini chat error:", err.message);
        socket.emit("chat:typing", { typing: false });
        socket.emit("chat:error", {
          message:
            err.message?.includes("GEMINI_API_KEY")
              ? "AI service is not configured. Please add GEMINI_API_KEY."
              : "Failed to generate response. Please try again.",
        });
      }
    });

    socket.on("chat:clear", () => {
      chatSessions.set(socket.userId, []);
      socket.emit("chat:cleared");
    });

    socket.on("disconnect", () => {
      console.log(`Chat disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupChatSocket };
