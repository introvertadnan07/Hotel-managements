import { useState } from "react";
import axios from "axios";

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-xl flex flex-col">
      
      <div className="p-4 border-b font-semibold">
        🤖 AI Assistant
      </div>

      <div className="p-3 h-64 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg text-sm max-w-[80%] ${
              msg.role === "user"
                ? "bg-black text-white ml-auto"
                : "bg-gray-100"
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

      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="bg-black text-white px-4 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatAssistant;