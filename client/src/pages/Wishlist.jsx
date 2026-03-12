import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const Wishlist = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const getImageUrl = (img) => {
    if (!img) return assets?.placeholderImage || "";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) img = img.slice(1);
    return `${import.meta.env.VITE_API_URL}/${img}`;
  };

  const fetchWishlist = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/wishlist`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) setWishlist(data.wishlist);
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (roomId) => {
    try {
      setRemovingId(roomId);
      const token = await getToken();
      if (!token) return;
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/wishlist/toggle`,
        { roomId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setWishlist((prev) => prev.filter((item) => item.room._id !== roomId));
      }
    } catch (error) {
      console.error("Remove failed:", error);
    } finally {
      setRemovingId(null);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm tracking-widest uppercase">Loading your saves...</p>
        </div>
      </div>
    );
  }

  // ── Empty State ───────────────────────────────────────────
  if (!wishlist.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 21s-6.7-4.35-9.19-7.36C.84 11.29 1.13 7.9 3.51 6.1c2.07-1.56 4.93-1.12 6.49.97 1.56-2.09 4.42-2.53 6.49-.97 2.38 1.8 2.67 5.19.7 7.54C18.7 16.65 12 21 12 21Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-playfair text-gray-800 dark:text-white mb-2">Your wishlist is empty</h2>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-8 max-w-xs">
          Save rooms you love and come back to them anytime.
        </p>
        <button onClick={() => navigate("/rooms")}
          className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full text-sm tracking-wide hover:opacity-80 transition">
          Explore Rooms
        </button>
      </div>
    );
  }

  // ── Main Wishlist ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-gray-900 transition-colors duration-300">

      {/* Header */}
      <div className="pt-28 pb-10 px-6 md:px-16 lg:px-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Your Collection</p>
            <h1 className="text-4xl md:text-5xl font-playfair text-gray-900 dark:text-white">
              Saved Rooms
            </h1>
          </div>
          <span className="text-sm text-gray-400 mb-2">
            {wishlist.length} {wishlist.length === 1 ? "property" : "properties"}
          </span>
        </div>
        <div className="mt-6 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Grid */}
      <div className="px-6 md:px-16 lg:px-24 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item) => {
            const room = item.room;
            const isRemoving = removingId === room._id;

            return (
              <div key={room._id}
                className={`group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
                  isRemoving ? "opacity-40 scale-95" : ""
                }`}>

                {/* Image */}
                <div className="relative overflow-hidden cursor-pointer h-52"
                  onClick={() => navigate(`/rooms/${room._id}`)}>
                  <img
                    src={getImageUrl(room.images?.[0])}
                    alt={room.roomType}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { if (assets?.placeholderImage) e.target.src = assets.placeholderImage; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badge */}
                  <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full text-gray-700 dark:text-gray-200 shadow-sm">
                    {room.roomType}
                  </span>

                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromWishlist(room._id); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                    title="Remove from wishlist">
                    <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21s-6.7-4.35-9.19-7.36C.84 11.29 1.13 7.9 3.51 6.1c2.07-1.56 4.93-1.12 6.49.97 1.56-2.09 4.42-2.53 6.49-.97 2.38 1.8 2.67 5.19.7 7.54C18.7 16.65 12 21 12 21Z" />
                    </svg>
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <h3
                    className="text-lg font-playfair text-gray-900 dark:text-white cursor-pointer hover:underline underline-offset-2"
                    onClick={() => navigate(`/rooms/${room._id}`)}>
                    {room.hotel?.name || "Hotel"}
                  </h3>

                  {room.hotel?.address && (
                    <div className="flex items-start gap-1.5 mt-1.5">
                      <img src={assets.locationIcon} alt="" className="w-3.5 h-3.5 mt-0.5 opacity-50 dark:invert shrink-0" />
                      <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-1">
                        {room.hotel.address}
                      </p>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                        ₹{room.pricePerNight}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">/ night</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => navigate(`/rooms/${room._id}`)}
                      className="flex-1 bg-black dark:bg-white text-white dark:text-black text-sm py-2.5 rounded-xl hover:opacity-80 transition font-medium">
                      Book Now
                    </button>
                    <button onClick={() => navigate(`/rooms/${room._id}`)}
                      className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;