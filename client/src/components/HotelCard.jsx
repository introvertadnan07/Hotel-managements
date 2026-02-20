import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // ✅ FIX

const HotelCard = ({ room, index }) => {
  const imageUrl =
    room.images?.length > 0
      ? `${BACKEND_URL}${room.images[0]}`   // ✅ FIX
      : assets.placeholderImage;

  return (
    <Link to={`/rooms/${room._id}`} className="relative">
      <img
        src={imageUrl}
        alt={room.roomType}
        className="max-w-[270px] w-full h-[180px] object-cover rounded-xl shadow"
      />

      <div className="p-4">
        <p>{room.hotel?.name}</p>
        <p>${room.pricePerNight} / night</p>
      </div>
    </Link>
  );
};

export default HotelCard;