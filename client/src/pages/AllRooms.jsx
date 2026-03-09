import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";

import { assets, facilityIcons } from "../assets/assets";
import StarRating from "../components/StarRating";

const AllRooms = () => {
  const { rooms, currency, addToCompare, compareRooms } = useAppContext();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const destination = searchParams.get("destination");
  const typeFilter = searchParams.get("type");
  const [selectedSort, setSelectedSort] = useState("");

  // ✅ Price range filter
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ✅ Wishlist state
  const [wishlistedIds, setWishlistedIds] = useState({});
  const [wishlistLoading, setWishlistLoading] = useState({});

  // ✅ Get max price dynamically from rooms
  const maxPrice = useMemo(() => {
    if (!rooms || rooms.length === 0) return 50000;
    return Math.max(...rooms.map((r) => r.pricePerNight || 0));
  }, [rooms]);

  React.useEffect(() => {
    if (maxPrice) setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const getImage = (room) => {
    const img = room?.images?.[0];
    if (!img) return assets.placeholderImage;
    if (typeof img === "string" && img.startsWith("http")) return img;
    if (img.startsWith("/uploads")) return `${import.meta.env.VITE_API_URL}${img}`;
    return `${import.meta.env.VITE_API_URL}/uploads/${img}`;
  };

  // ✅ Wishlist toggle
  const toggleWishlist = async (e, roomId) => {
    e.stopPropagation();
    if (wishlistLoading[roomId]) return;
    try {
      setWishlistLoading((prev) => ({ ...prev, [roomId]: true }));
      const token = await getToken();
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/wishlist/toggle`,
        { roomId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setWishlistedIds((prev) => ({ ...prev, [roomId]: !prev[roomId] }));
        toast.success(wishlistedIds[roomId] ? "Removed from wishlist" : "Added to wishlist ❤️");
      }
    } catch {
      toast.error("Please login to use wishlist");
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [roomId]: false }));
    }
  };

  const matchesDestination = (room) =>
    !destination ||
    room.hotel?.city?.toLowerCase().includes(destination.toLowerCase());

  const matchesType = (room) =>
    !typeFilter ||
    room.roomType?.toLowerCase() === typeFilter.toLowerCase();

  // ✅ Price filter
  const matchesPrice = (room) =>
    room.pricePerNight >= priceRange[0] && room.pricePerNight <= priceRange[1];

  const sortRooms = (a, b) => {
    if (selectedSort === "Price Low to High") return a.pricePerNight - b.pricePerNight;
    if (selectedSort === "Price High to Low") return b.pricePerNight - a.pricePerNight;
    if (selectedSort === "Newest First") return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  };

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    return [...rooms]
      .filter(matchesDestination)
      .filter(matchesType)
      .filter(matchesPrice)
      .sort(sortRooms);
  }, [rooms, selectedSort, destination, typeFilter, priceRange]);

  const isFiltered = priceRange[0] > 0 || priceRange[1] < maxPrice || selectedSort !== "";

  const resetFilters = () => {
    setPriceRange([0, maxPrice]);
    setSelectedSort("");
  };

  return (
    <div className="pt-28 px-6 md:px-16 lg:px-24">

      {/* ✅ Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-4xl font-playfair">Hotel Rooms</h1>
          {typeFilter && (
            <div className="flex items-center gap-2 bg-black text-white text-sm px-4 py-1.5 rounded-full">
              <span>{typeFilter}</span>
              <button onClick={() => navigate("/rooms")} className="ml-1 hover:text-gray-300">✕</button>
            </div>
          )}
        </div>

        {/* ✅ Filter Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition ${
            isFiltered ? "bg-black text-white border-black" : "border-gray-300 hover:bg-gray-100"
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filters {isFiltered && "●"}
        </button>
      </div>

      {/* ✅ Filter Panel */}
      {isFilterOpen && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-10 items-start">

          {/* Price Range */}
          <div className="flex-1 min-w-[240px]">
            <p className="text-sm font-medium mb-1">Price Range</p>
            <p className="text-gray-500 text-sm mb-4">
              {currency}{priceRange[0].toLocaleString()} — {currency}{priceRange[1].toLocaleString()} / night
            </p>

            <div className="flex gap-4 items-center">
              <input
                type="range"
                min={0}
                max={maxPrice}
                step={100}
                value={priceRange[0]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val < priceRange[1]) setPriceRange([val, priceRange[1]]);
                }}
                className="w-full accent-black cursor-pointer"
              />
              <input
                type="range"
                min={0}
                max={maxPrice}
                step={100}
                value={priceRange[1]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val > priceRange[0]) setPriceRange([priceRange[0], val]);
                }}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{currency}0</span>
              <span>{currency}{maxPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Sort */}
          <div className="min-w-[200px]">
            <p className="text-sm font-medium mb-3">Sort By</p>
            <div className="flex flex-col gap-2">
              {["Price Low to High", "Price High to Low", "Newest First"].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="sort"
                    checked={selectedSort === option}
                    onChange={() => setSelectedSort(option)}
                    className="accent-black"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 justify-end">
            {isFiltered && (
              <button onClick={resetFilters} className="text-sm text-red-500 hover:underline">
                Reset Filters
              </button>
            )}
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-sm bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* ✅ Results count */}
      <p className="text-sm text-gray-400 mb-2">
        {filteredRooms.length} {filteredRooms.length === 1 ? "room" : "rooms"} found
      </p>

      {/* ✅ Room List */}
      <div className="flex-1">
        {filteredRooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-lg mb-4">No rooms found for selected filters.</p>
            <button onClick={resetFilters} className="text-sm underline text-black">
              Clear filters
            </button>
          </div>
        )}

        {filteredRooms.map((room) => (
          <div key={room._id} className="flex flex-col md:flex-row gap-6 py-8 border-b">

            {/* Image */}
            <div className="relative md:w-1/2">
              <img
                src={getImage(room)}
                alt="room"
                className="w-full h-64 object-cover rounded-xl shadow cursor-pointer"
                onClick={() => navigate(`/rooms/${room._id}`)}
                onError={(e) => { e.target.src = assets.placeholderImage; }}
              />

              {/* Heart Button */}
              <button
                onClick={(e) => toggleWishlist(e, room._id)}
                className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow transition hover:scale-110 active:scale-95
                  ${wishlistedIds[room._id] ? "bg-red-500 text-white" : "bg-white/80 text-gray-600"}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24"
                  fill={wishlistedIds[room._id] ? "currentColor" : "none"}
                  stroke="currentColor" strokeWidth="2"
                >
                  <path d="M12 21s-6.7-4.35-9.19-7.36C.84 11.29 1.13 7.9 3.51 6.1c2.07-1.56 4.93-1.12 6.49.97 1.56-2.09 4.42-2.53 6.49-.97 2.38 1.8 2.67 5.19.7 7.54C18.7 16.65 12 21 12 21Z" />
                </svg>
              </button>

              {/* Price badge */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                {currency}{room.pricePerNight} / night
              </div>
            </div>

            {/* Details */}
            <div className="md:w-1/2">
              <p className="text-gray-500">{room.hotel?.city || "City not available"}</p>
              <h2 className="text-3xl font-playfair">{room.hotel?.name || "Unknown Hotel"}</h2>

              <div className="flex items-center gap-2 mt-2">
                <StarRating />
                <span className="text-sm">200+ reviews</span>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {room.amenities?.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded">
                    <img src={facilityIcons[item]} className="w-4 h-4" alt="" />
                    <span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-xl mt-4 font-medium">
                {currency} {room.pricePerNight} / night
              </p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => addToCompare(room)}
                  disabled={compareRooms.length >= 2}
                  className="text-xs border px-3 py-1 rounded-full hover:bg-black hover:text-white transition disabled:opacity-40"
                >
                  Compare ⚖️
                </button>
                <button
                  onClick={() => navigate(`/rooms/${room._id}`)}
                  className="text-xs bg-black text-white px-4 py-1 rounded-full hover:bg-gray-800 transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllRooms;