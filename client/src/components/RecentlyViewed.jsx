import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { FaStar } from "react-icons/fa";

const MAX_RECENT = 4;
const STORAGE_KEY = "anumifly_recently_viewed";

// ── Helper functions (use these in RoomDetails too) ──────────────────────────
export const addRecentlyViewed = (room) => {
  if (!room?._id) return;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = stored.filter((r) => r._id !== room._id);
    const updated = [
      {
        _id:          room._id,
        roomType:     room.roomType,
        pricePerNight:room.pricePerNight,
        images:       room.images?.slice(0, 1) || [],
        hotel:        { name: room.hotel?.name, city: room.hotel?.city },
        avgRating:    room.avgRating || null,
      },
      ...filtered,
    ].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
};

export const getRecentlyViewed = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
};

// ── Component ─────────────────────────────────────────────────────────────────
const RecentlyViewed = () => {
  const navigate          = useNavigate();
  const { currency }      = useAppContext();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    setRooms(getRecentlyViewed());
  }, []);

  if (rooms.length === 0) return null;

  const getImageUrl = (img) => {
    if (!img) return assets.placeholderImage;
    if (typeof img === "string" && img.startsWith("http")) return img;
    if (typeof img === "string" && img.startsWith("/")) img = img.slice(1);
    return `${import.meta.env.VITE_API_URL}/${img}`;
  };

  return (
    <section className="px-6 md:px-16 lg:px-24 xl:px-32 py-16 dark:bg-gray-900 transition-colors duration-300">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-medium mb-1">
            Your History
          </p>
          <h2 className="text-3xl font-playfair text-gray-900 dark:text-white">
            Recently Viewed
          </h2>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            setRooms([]);
          }}
          className="text-xs text-gray-400 hover:text-red-500 transition underline"
        >
          Clear history
        </button>
      </div>

      {/* Room Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <div
            key={room._id}
            onClick={() => navigate(`/rooms/${room._id}`)}
            className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image */}
            <div className="relative overflow-hidden h-48">
              <img
                src={getImageUrl(room.images?.[0])}
                alt={room.roomType}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.src = assets.placeholderImage; }}
              />
              {/* Recently viewed badge */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Recently viewed
              </div>
              {/* Price badge */}
              <div className="absolute bottom-3 right-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                {currency}{room.pricePerNight}/night
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{room.hotel?.city}</p>
              <p className="font-playfair text-gray-900 dark:text-white text-base truncate">{room.hotel?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{room.roomType}</p>

              {/* Rating */}
              {room.avgRating ? (
                <div className="flex items-center gap-1 mt-2">
                  <FaStar className="text-yellow-400 text-xs" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{room.avgRating}</span>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-2">No reviews yet</p>
              )}

              {/* CTA */}
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/rooms/${room._id}`); }}
                className="mt-3 w-full text-xs bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg hover:opacity-80 transition font-medium"
              >
                View Room
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;