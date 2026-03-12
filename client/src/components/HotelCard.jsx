import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { assets } from "../assets/assets";
import { FaStar } from "react-icons/fa";

// ── Skeleton loader ───────────────────────────────────────────
export const HotelCardSkeleton = () => (
  <div className="relative block animate-pulse">
    <div className="max-w-[270px] w-full h-[180px] bg-gray-200 dark:bg-gray-700 rounded-xl" />
    <div className="p-4 pt-5 space-y-3 max-w-[270px]">
      <div className="flex justify-between">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-10" />
      </div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      <div className="flex justify-between mt-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24" />
      </div>
    </div>
  </div>
);

// ── Card ─────────────────────────────────────────────────────
const HotelCard = ({ room, index }) => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [wishlisted, setWishlisted] = useState(room.isWishlisted || false);
  const [loading, setLoading] = useState(false);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);

  // ✅ Fetch real rating for this room
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/reviews/${room._id}`
        );
        if (data.success && data.reviews?.length > 0) {
          const avg = data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length;
          setAvgRating(avg.toFixed(1));
          setReviewCount(data.reviews.length);
        }
      } catch {}
    };
    fetchRating();
  }, [room._id]);

  const getImage = () => {
    const img = room?.images?.[0];
    if (!img) return assets.placeholderImage;
    if (typeof img === "string" && img.startsWith("http")) return img;
    if (img.startsWith("/uploads")) return `${import.meta.env.VITE_BACKEND_URL}${img}`;
    return `${import.meta.env.VITE_BACKEND_URL}/uploads/${img}`;
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    try {
      setLoading(true);
      const token = await getToken();
      if (wishlisted) {
        const { data } = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/wishlist/${room._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) setWishlisted(false);
      } else {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/wishlist`,
          { roomId: room._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) setWishlisted(true);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/rooms/${room._id}`);
  };

  return (
    <Link to={`/rooms/${room._id}`} className="relative block group">

      {/* Heart */}
      <button onClick={toggleWishlist}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition hover:scale-110 active:scale-95
          ${wishlisted ? "bg-red-500 text-white" : "bg-white/70 dark:bg-gray-800/70 text-black dark:text-white"}`}>
        <svg className="w-5 h-5" viewBox="0 0 24 24"
          fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-6.7-4.35-9.19-7.36C.84 11.29 1.13 7.9 3.51 6.1c2.07-1.56 4.93-1.12 6.49.97 1.56-2.09 4.42-2.53 6.49-.97 2.38 1.8 2.67 5.19.7 7.54C18.7 16.65 12 21 12 21Z" />
        </svg>
      </button>

      {/* Image */}
      <img src={getImage()} alt={room.roomType}
        className="max-w-[270px] w-full h-[180px] object-cover rounded-xl shadow group-hover:shadow-lg transition"
        onError={(e) => { e.target.src = assets.placeholderImage; }} />

      {/* Badge */}
      {index % 2 === 0 && (
        <p className="px-3 py-1 absolute top-3 left-3 text-xs bg-white dark:bg-gray-900 dark:text-white rounded-full shadow-sm">
          Best Seller
        </p>
      )}

      {/* Content */}
      <div className="p-4 pt-5">
        <div className="flex justify-between items-start gap-2">
          <p className="font-playfair text-xl text-gray-900 dark:text-white leading-tight">
            {room.hotel?.name}
          </p>
          {/* ✅ Real rating */}
          <div className="flex items-center gap-1 shrink-0">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {avgRating ?? "—"}
            </span>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-400">({reviewCount})</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <img src={assets.locationIcon} alt="" className="w-3.5 opacity-60" />
          <span className="truncate">{room.hotel?.address}</span>
        </div>

        <div className="flex justify-between mt-4 items-center">
          <p>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              ₹{room.pricePerNight}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400"> / night</span>
          </p>
          <button onClick={handleBookNow}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition">
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;