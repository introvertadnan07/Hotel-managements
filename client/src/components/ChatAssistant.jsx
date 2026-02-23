import { useState } from "react";
import axios from "axios";

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    setMessages(prev => [
      ...prev,
      { role: "user", text: userMessage },
    ]);

    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/chat`,
        { message: userMessage }
      );

      if (data.success) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", text: data.reply },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">

      {/* ✅ CLOSED STATE → Circle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-black text-white shadow-xl hover:scale-110 transition flex items-center justify-center text-xl"
        >
          🤖
        </button>
      )}

      {/* ✅ OPEN STATE → Chat Panel */}
      {open && (
        <div className="w-[340px] max-w-[92vw] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">

          {/* Header */}
          <div className="bg-black text-white px-4 py-3 flex justify-between items-center">
            <span className="font-medium">AI Anumifly Assistant</span>

            <button
              onClick={() => setOpen(false)}
              className="text-sm opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="p-3 h-64 overflow-y-auto space-y-2 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-10">
                Ask anything about rooms, pricing, bookings...
              </p>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-black text-white ml-auto"
                    : "bg-white border"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <p className="text-xs text-gray-400">
                Assistant typing...
              </p>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2 bg-white">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              onClick={sendMessage}
              className="bg-black text-white px-4 rounded-lg hover:bg-gray-800 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;