import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const SUGGESTIONS = [
  "Budget room under ₹2000 in Mumbai",
  "Luxury suite with pool and spa",
  "Family room for 4 guests with AC",
  "Romantic room with sea view",
  "Business room with WiFi and workspace",
];

// ─── ROOM CARD (used inside recommender results) ─────────────────────────────
const RecommendedRoomCard = ({ room, reason, onClose }) => {
  const navigate = useNavigate();
  const { currency } = useAppContext();

  const getImageUrl = (img) => {
    if (!img) return assets.placeholderImage;
    if (typeof img === "string" && img.startsWith("http")) return img;
    if (typeof img === "string" && img.startsWith("/")) img = img.slice(1);
    return `${import.meta.env.VITE_API_URL}/${img}`;
  };

  return (
    <div
      onClick={() => { navigate(`/rooms/${room._id}`); if (onClose) onClose(); }}
      className="flex gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 transition group"
    >
      <img
        src={getImageUrl(room.images?.[0])}
        alt={room.roomType}
        className="w-20 h-20 object-cover rounded-lg shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{room.hotel?.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{room.roomType} · {room.hotel?.city}</p>
        <p className="text-xs font-semibold text-gray-900 dark:text-white mt-1">{currency}{room.pricePerNight}/night</p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 line-clamp-2">{reason}</p>
      </div>
    </div>
  );
};

// ─── INLINE RECOMMENDER (for Hero + AllRooms sidebar) ────────────────────────
export const AIRecommenderInline = ({ onClose, compact = false }) => {
  const { axios } = useAppContext();
  const [query, setQuery]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [results, setResults]       = useState(null);
  const [error, setError]           = useState("");

  const handleSearch = async (q) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const { data } = await axios.post("/api/ai/recommend", { preferences: searchQuery });
      if (data.success) {
        setResults(data);
      } else {
        setError("Could not find matching rooms. Try different preferences.");
      }
    } catch {
      setError("AI recommender failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border border-indigo-100 dark:border-gray-700 rounded-2xl ${compact ? "p-4" : "p-6"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm">✨</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">AI Room Finder</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Describe your perfect stay</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg">✕</button>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="e.g. budget room for 2 in Mumbai with AC..."
          className="flex-1 text-sm border border-indigo-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 placeholder-gray-400"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50 shrink-0"
        >
          {loading ? "..." : "Find"}
        </button>
      </div>

      {/* Suggestion chips */}
      {!results && !loading && (
        <div className="flex flex-wrap gap-2 mb-1">
          {SUGGESTIONS.slice(0, compact ? 3 : 5).map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); handleSearch(s); }}
              className="text-xs bg-white dark:bg-gray-700 border border-indigo-100 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-600 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 py-4 justify-center">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">Finding perfect rooms...</span>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs text-red-500 text-center py-2">{error}</p>}

      {/* Results */}
      {results && (
        <div className="mt-3">
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-3 font-medium">✨ {results.message}</p>
          <div className="flex flex-col gap-3">
            {results.recommendations.map(({ room, reason }, i) => (
              <RecommendedRoomCard key={room._id || i} room={room} reason={reason} onClose={onClose} />
            ))}
          </div>
          <button
            onClick={() => { setResults(null); setQuery(""); }}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline w-full text-center"
          >
            Search again
          </button>
        </div>
      )}
    </div>
  );
};

// ─── FLOATING CHAT POPUP (appears on all pages) ───────────────────────────────
const AIRecommenderFloat = () => {
  const { axios } = useAppContext();
  const [isOpen, setIsOpen]     = useState(false);
  const [activeTab, setActiveTab] = useState("recommend"); // "recommend" | "chat"
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [results, setResults]   = useState(null);
  const [error, setError]       = useState("");

  // Chat state
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Hi! 👋 I'm your AnumiflyStay assistant. Ask me anything about rooms, bookings, or let me find the perfect room for you!" }
  ]);
  const [chatInput, setChatInput]   = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isOpen]);

  const handleRecommend = async (q) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true); setError(""); setResults(null);
    try {
      const { data } = await axios.post("/api/ai/recommend", { preferences: searchQuery });
      if (data.success) setResults(data);
      else setError("No matching rooms found. Try different preferences.");
    } catch { setError("AI recommender failed. Please try again."); }
    finally { setLoading(false); }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const history = chatHistory.filter((m) => m.role !== "assistant" || chatHistory.indexOf(m) > 0);
      const { data } = await axios.post("/api/ai/chat", {
        message: chatInput,
        history: history.map((m) => ({ role: m.role, content: m.content })),
      });
      if (data.success) {
        setChatHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setChatHistory((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble right now. Please try again!" }]);
    } finally { setChatLoading(false); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition flex items-center justify-center"
        title="AI Room Finder"
      >
        {isOpen ? (
          <span className="text-xl">✕</span>
        ) : (
          <span className="text-2xl">✨</span>
        )}
      </button>

      {/* Popup panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[360px] max-h-[560px] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-white text-lg">✨</span>
              <div>
                <p className="text-white font-semibold text-sm">AI Assistant</p>
                <p className="text-indigo-100 text-xs">AnumiflyStay</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("recommend")}
                className={`text-xs px-3 py-1 rounded-full transition ${activeTab === "recommend" ? "bg-white text-indigo-600 font-medium" : "text-white/80 hover:text-white"}`}
              >
                Find Room
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`text-xs px-3 py-1 rounded-full transition ${activeTab === "chat" ? "bg-white text-indigo-600 font-medium" : "text-white/80 hover:text-white"}`}
              >
                Chat
              </button>
            </div>
          </div>

          {/* ── RECOMMEND TAB ── */}
          {activeTab === "recommend" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Describe your perfect room and I'll find the best matches!</p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRecommend()}
                  placeholder="e.g. romantic suite under ₹5000..."
                  className="flex-1 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2 outline-none focus:border-indigo-400"
                />
                <button
                  onClick={() => handleRecommend()}
                  disabled={loading || !query.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-2 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "..." : "Go"}
                </button>
              </div>

              {/* Chips */}
              {!results && !loading && (
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => { setQuery(s); handleRecommend(s); }}
                      className="text-xs bg-indigo-50 dark:bg-gray-800 border border-indigo-100 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition">
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-2 py-6 justify-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-xs text-gray-400 ml-1">Finding rooms...</span>
                </div>
              )}

              {error && <p className="text-xs text-red-500 text-center">{error}</p>}

              {results && (
                <div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-2">✨ {results.message}</p>
                  <div className="flex flex-col gap-2">
                    {results.recommendations.map(({ room, reason }, i) => (
                      <RecommendedRoomCard key={room._id || i} room={room} reason={reason} onClose={() => setIsOpen(false)} />
                    ))}
                  </div>
                  <button onClick={() => { setResults(null); setQuery(""); }}
                    className="mt-3 text-xs text-gray-400 underline w-full text-center hover:text-gray-600">
                    Search again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── CHAT TAB ── */}
          {activeTab === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] text-sm px-3 py-2 rounded-2xl leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="border-t dark:border-gray-700 p-3 flex gap-2 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChat()}
                  placeholder="Ask me anything..."
                  className="flex-1 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2 outline-none focus:border-indigo-400"
                />
                <button
                  onClick={handleChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-2 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  ➤
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIRecommenderFloat;