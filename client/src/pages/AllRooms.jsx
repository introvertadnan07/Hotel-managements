import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

import { assets, facilityIcons } from "../assets/assets";
import StarRating from "../components/StarRating";

const AllRooms = () => {
  const { rooms, currency, addToCompare, compareRooms } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const destination = searchParams.get("destination");
  const [selectedSort, setSelectedSort] = useState("");

  const getImage = (room) => {
    const img = room?.images?.[0];

    if (!img) return assets.placeholderImage;

    if (typeof img === "string" && img.startsWith("http")) {
      return img;
    }

    if (img.startsWith("/uploads")) {
      return `${import.meta.env.VITE_API_URL}${img}`;
    }

    return `${import.meta.env.VITE_API_URL}/uploads/${img}`;
  };

  const matchesDestination = (room) =>
    !destination ||
    room.hotel?.city?.toLowerCase().includes(destination.toLowerCase());

  const sortRooms = (a, b) => {
    if (selectedSort === "Price Low to High") {
      return a.pricePerNight - b.pricePerNight;
    }
    if (selectedSort === "Price High to Low") {
      return b.pricePerNight - a.pricePerNight;
    }
    if (selectedSort === "Newest First") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  };

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];

    return [...rooms].filter(matchesDestination).sort(sortRooms);
  }, [rooms, selectedSort, destination]);

  return (
    <div className="flex flex-col lg:flex-row pt-28 px-6 md:px-16 lg:px-24">
      <div className="flex-1">
        <h1 className="text-4xl font-playfair mb-2">Hotel Rooms</h1>

        {filteredRooms.length === 0 && (
          <p className="text-gray-500">No rooms found.</p>
        )}

        {filteredRooms.map((room) => (
          <div
            key={room._id}
            className="flex flex-col md:flex-row gap-6 py-8 border-b"
          >
            <img
              src={getImage(room)}
              alt="room"
              className="md:w-1/2 h-64 object-cover rounded-xl shadow cursor-pointer"
              onClick={() => navigate(`/rooms/${room._id}`)}
              onError={(e) => {
                e.target.src = assets.placeholderImage;
              }}
            />

            <div className="md:w-1/2">
              <p className="text-gray-500">
                {room.hotel?.city || "City not available"}
              </p>

              <h2 className="text-3xl font-playfair">
                {room.hotel?.name || "Unknown Hotel"}
              </h2>

              <div className="flex items-center gap-2 mt-2">
                <StarRating />
                <span className="text-sm">200+ reviews</span>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {room.amenities?.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded"
                  >
                    <img
                      src={facilityIcons[item]}
                      className="w-4 h-4"
                      alt=""
                    />
                    <span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-xl mt-4 font-medium">
                {currency} {room.pricePerNight} / night
              </p>

              {/* ⭐ Compare Button */}
              <button
                onClick={() => addToCompare(room)}
                disabled={compareRooms.length >= 2}
                className="mt-3 text-xs border px-3 py-1 rounded-full hover:bg-black hover:text-white transition disabled:opacity-40"
              >
                Compare ⚖️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllRooms;