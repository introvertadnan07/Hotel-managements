import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { assets } from "../assets/assets";

const HotelCard = ({ room, index }) => {
  const { getToken } = useAuth();

  const [wishlisted, setWishlisted] = useState(room.isWishlisted || false);
  const [loading, setLoading] = useState(false);

  // ✅ UNIVERSAL IMAGE FIX
  const getImage = () => {
    const img = room?.images?.[0];

    if (!img) return assets.placeholderImage;

    if (typeof img === "string" && img.startsWith("http")) {
      return img;
    }

    if (img.startsWith("/uploads")) {
      return `${import.meta.env.VITE_BACKEND_URL}${img}`;
    }

    return `${import.meta.env.VITE_BACKEND_URL}/uploads/${img}`;
  };

  // ✅ Wishlist Toggle
  const toggleWishlist = async (e) => {
    e.preventDefault(); // ⭐ prevents Link navigation
    if (loading) return;

    try {
      setLoading(true);
      const token = await getToken();

      if (wishlisted) {
        // ✅ Remove
        const { data } = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/wishlist/${room._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.success) setWishlisted(false);
      } else {
        // ✅ Add
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/wishlist`,
          { roomId: room._id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.success) setWishlisted(true);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      to={`/rooms/${room._id}`}
      className="relative block group"
    >
      {/* ⭐ Heart Button */}
      <button
        onClick={toggleWishlist}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full 
        flex items-center justify-center backdrop-blur-md transition
        ${wishlisted
          ? "bg-red-500 text-white"
          : "bg-white/70 text-black"}
        hover:scale-110 active:scale-95`}
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill={wishlisted ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 21s-6.7-4.35-9.19-7.36C.84 11.29 1.13 7.9 3.51 6.1c2.07-1.56 4.93-1.12 6.49.97 1.56-2.09 4.42-2.53 6.49-.97 2.38 1.8 2.67 5.19.7 7.54C18.7 16.65 12 21 12 21Z" />
        </svg>
      </button>

      {/* ✅ Room Image */}
      <img
        src={getImage()}
        alt={room.roomType}
        className="max-w-[270px] w-full h-[180px] object-cover rounded-xl shadow group-hover:shadow-lg transition"
        onError={(e) => {
          e.target.src = assets.placeholderImage;
        }}
      />

      {/* ✅ Badge */}
      {index % 2 === 0 && (
        <p className="px-3 py-1 absolute top-3 left-3 text-xs bg-white rounded-full shadow-sm">
          Best Seller
        </p>
      )}

      {/* ✅ Card Content */}
      <div className="p-4 pt-5">
        <div className="flex justify-between">
          <p className="font-playfair text-xl">
            {room.hotel?.name}
          </p>

          <div className="flex items-center gap-1">
            <img src={assets.starIconOutlined} alt="" />
            <span>4.5</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <img src={assets.locationIcon} alt="" />
          <span className="truncate">
            {room.hotel?.address}
          </span>
        </div>

        <div className="flex justify-between mt-4 items-center">
          <p>
            <span className="text-xl font-semibold">
              ₹{room.pricePerNight}
            </span>
            <span className="text-sm text-gray-500">
              {" "} / night
            </span>
          </p>

          <button
            className="px-4 py-2 text-sm border rounded-lg hover:bg-black hover:text-white transition"
            onClick={(e) => e.preventDefault()}
          >
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;