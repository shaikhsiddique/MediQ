import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useT, useLanguage } from "../context/LanguageContext";
import { mrChatbot } from "../locales/mr";
import { getSocket, disconnectSocket } from "../services/socket";
import {
  getStoredMascot,
  mascotMediaUrl,
  resolveMessageTone,
} from "../utils/kidsBuddyMascot";

function ChatBot() {
  const { language } = useLanguage();
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const historyRef = useRef([]);

  const translations = {
    en: {
      title: "AI Health Assistant",
      subtitle:
        "Ask anything about diabetes, health monitoring, food, exercise, and child care.",
      placeholder: "Type your message...",
      online: "AI Assistant Online",
      offline: "Connecting...",
      suggestions: "Quick Questions",
      q1: "What foods help reduce diabetes risk?",
      q2: "How much exercise should kids do?",
      q3: "What are early diabetes symptoms?",
      q4: "Best healthy snacks for children?",
      typing: "AI is typing...",
      back: "Back to Dashboard",
      error: "Could not get a response. Please try again.",
    },
    hi: {
      title: "AI हेल्थ असिस्टेंट",
      subtitle:
        "डायबिटीज, स्वास्थ्य निगरानी, भोजन, व्यायाम और बच्चों की देखभाल के बारे में पूछें।",
      placeholder: "अपना संदेश लिखें...",
      online: "AI असिस्टेंट ऑनलाइन",
      offline: "कनेक्ट हो रहा है...",
      suggestions: "त्वरित प्रश्न",
      q1: "डायबिटीज जोखिम कम करने वाले भोजन कौन से हैं?",
      q2: "बच्चों को कितना व्यायाम करना चाहिए?",
      q3: "डायबिटीज के शुरुआती लक्षण क्या हैं?",
      q4: "बच्चों के लिए स्वस्थ स्नैक्स कौन से हैं?",
      typing: "AI लिख रहा है...",
      back: "डैशबोर्ड पर वापस जाएं",
      error: "जवाब नहीं मिला। कृपया फिर से कोशिश करें।",
    },
    mr: mrChatbot,
  };

  const t = useT(translations);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [mascot] = useState(getStoredMascot);

  const [messages, setMessages] = useState([
    {
      type: "bot",
      text:
        language === "hi"
          ? "नमस्ते 👋 मैं GlucoBot हूँ। मैं आपकी कैसे मदद कर सकता हूँ?"
          : language === "mr"
          ? mrChatbot.greeting
          : "Hello 👋 I am GlucoBot. How can I help you today?",
    },
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    let socket;

    try {
      socket = getSocket();
      socketRef.current = socket;

      const onConnect = () => {
        setConnected(true);
        socket.emit("chat:init");
      };
      const onDisconnect = () => setConnected(false);
      const onTyping = ({ typing }) => setLoading(typing);
      const onReply = ({ reply, history }) => {
        historyRef.current = history || [];
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: reply,
            tone: resolveMessageTone(reply),
          },
        ]);
        setLoading(false);
      };
      const onError = ({ message: errMsg }) => {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: errMsg || t.error },
        ]);
        setLoading(false);
      };

      const onHistoryLoaded = ({ messages }) => {
        if (messages?.length > 0) {
          const restored = messages.map((m) => ({
            type: m.role === "user" ? "user" : "bot",
            text: m.content,
          }));
          historyRef.current = messages.map((m) => ({
            role: m.role,
            content: m.content,
          }));
          setMessages((prev) => {
            const greeting = prev[0];
            return [greeting, ...restored];
          });
        }
      };

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("chat:typing", onTyping);
      socket.on("chat:reply", onReply);
      socket.on("chat:error", onError);
      socket.on("chat:history_loaded", onHistoryLoaded);

      if (socket.connected) {
        setConnected(true);
        socket.emit("chat:init");
      }

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("chat:typing", onTyping);
        socket.off("chat:reply", onReply);
        socket.off("chat:error", onError);
        socket.off("chat:history_loaded", onHistoryLoaded);
        disconnectSocket();
      };
    } catch {
      setConnected(false);
    }
  }, [t.error]);

  const sendMessage = () => {
    if (!message.trim() || loading || !connected) return;

    const currentMessage = message.trim();
    setMessages((prev) => [...prev, { type: "user", text: currentMessage }]);
    setMessage("");
    setLoading(true);

    socketRef.current?.emit("chat:message", {
      message: currentMessage,
      history: historyRef.current,
    });
  };

  const quickQuestions = [t.q1, t.q2, t.q3, t.q4];

  return (
    <div className="page-shell p-3 sm:p-5 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all text-gray-700 font-semibold w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.back}
          </Link>

          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold w-fit ${
              connected
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {connected ? t.online : t.offline}
          </div>
        </div>

        <div className="bg-white rounded-[30px] shadow-xl border border-gray-100 p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-4 rounded-2xl shadow-lg w-fit">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                {t.title}
              </h1>
              <p className="text-gray-500 mt-2 text-sm sm:text-base leading-relaxed">
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-[30px] shadow-lg p-5 sm:p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t.suggestions}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickQuestions.map((q, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setMessage(q)}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-5 py-4 rounded-2xl transition-all font-medium text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-[30px] shadow-xl border border-gray-100 flex flex-col h-[70vh] sm:h-[650px] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[75%] px-4 sm:px-5 py-4 rounded-3xl shadow-md ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {msg.type === "user" ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <img
                          src={mascotMediaUrl(
                            mascot,
                            msg.tone || resolveMessageTone(msg.text),
                            "gif"
                          )}
                          alt="Buddy"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-green-200"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                    </div>
                    <p className="leading-relaxed text-sm sm:text-base break-words">
                      {msg.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-5 py-4 rounded-3xl shadow-md text-gray-700 text-sm sm:text-base">
                  {t.typing}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-100 p-4 sm:p-5 bg-white">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={t.placeholder}
                disabled={!connected}
                className="flex-1 px-4 sm:px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base disabled:opacity-50"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !connected}
                className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
