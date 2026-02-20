import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const HotelCard = ({ room, index }) => {

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

  return (
    <Link to={`/rooms/${room._id}`} className="relative">
      <img
        src={getImage()}   // ✅ FIXED
        alt={room.roomType}
        className="max-w-[270px] w-full h-[180px] object-cover rounded-xl shadow"
        onError={(e) => {
          e.target.src = assets.placeholderImage;
        }}
      />

      {index % 2 === 0 && (
        <p className="px-3 py-1 absolute top-3 left-3 text-xs bg-white rounded-full">
          Best Seller
        </p>
      )}

      <div className="p-4 pt-5">
        <div className="flex justify-between">
          <p className="font-playfair text-xl">
            {room.hotel?.name}
          </p>

          <div className="flex items-center gap-1">
            <img src={assets.starIconOutlined} alt="" />
            4.5
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <img src={assets.locationIcon} alt="" />
          <span className="truncate">
            {room.hotel?.address}
          </span>
        </div>

        <div className="flex justify-between mt-4">
          <p>
            <span className="text-xl">
              ${room.pricePerNight}
            </span>
            /night
          </p>

          <button className="px-4 py-2 text-sm border rounded">
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;