import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";

import { assets, facilityIcons } from "../assets/assets";
import StarRating from "../components/StarRating";
import { AIRecommenderInline } from "../components/AIRecommender";

const ROOMS_PER_PAGE = 6;

const AllRooms = () => {
  const { rooms, currency, addToCompare, compareRooms } = useAppContext();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const destination   = searchParams.get("destination");
  const typeFilter    = searchParams.get("type");
  const checkInParam  = searchParams.get("checkIn")  || "";
  const checkOutParam = searchParams.get("checkOut") || "";
  const guestsParam   = Number(searchParams.get("guests")) || 1;

  const [selectedSort, setSelectedSort]             = useState("");
  const [priceRange, setPriceRange]                 = useState([0, 50000]);
  const [isFilterOpen, setIsFilterOpen]             = useState(false);
  const [wishlistedIds, setWishlistedIds]           = useState({});
  const [wishlistLoading, setWishlistLoading]       = useState({});
  const [unavailableIds, setUnavailableIds]         = useState(new Set());
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [currentPage, setCurrentPage]               = useState(1);

  const maxPrice = useMemo(() => {
    if (!rooms || rooms.length === 0) return 50000;
    return Math.max(...rooms.map((r) => r.pricePerNight || 0));
  }, [rooms]);

  useEffect(() => {
    if (maxPrice) setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  useEffect(() => {
    setCurrentPage(1);
  }, [destination, typeFilter, selectedSort, priceRange, guestsParam, unavailableIds]);

  useEffect(() => {
    if (!checkInParam || !checkOutParam) { setUnavailableIds(new Set()); return; }
    const fetchUnavailable = async () => {
      setCheckingAvailability(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/rooms/unavailable`,
          { params: { checkIn: checkInParam, checkOut: checkOutParam } }
        );
        if (data.success) setUnavailableIds(new Set(data.unavailableRoomIds));
      } catch (err) {
        console.error("Availability check failed:", err);
      } finally { setCheckingAvailability(false); }
    };
    fetchUnavailable();
  }, [checkInParam, checkOutParam]);

  const getImage = (room) => {
    const img = room?.images?.[0];
    if (!img) return assets.placeholderImage;
    if (typeof img === "string" && img.startsWith("http")) return img;
    if (img.startsWith("/uploads")) return `${import.meta.env.VITE_API_URL}${img}`;
    return `${import.meta.env.VITE_API_URL}/uploads/${img}`;
  };

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
    } catch { toast.error("Please login to use wishlist"); }
    finally { setWishlistLoading((prev) => ({ ...prev, [roomId]: false })); }
  };

  const matchesDestination  = (room) => !destination || room.hotel?.city?.toLowerCase().includes(destination.toLowerCase());
  const matchesType         = (room) => !typeFilter   || room.roomType?.toLowerCase() === typeFilter.toLowerCase();
  const matchesPrice        = (room) => room.pricePerNight >= priceRange[0] && room.pricePerNight <= priceRange[1];
  const matchesGuests       = (room) => !guestsParam  || (room.maxGuests && room.maxGuests >= guestsParam);
  const matchesAvailability = (room) => !unavailableIds.has(room._id?.toString());

  const sortRooms = (a, b) => {
    if (selectedSort === "Price Low to High") return a.pricePerNight - b.pricePerNight;
    if (selectedSort === "Price High to Low") return b.pricePerNight - a.pricePerNight;
    if (selectedSort === "Newest First")      return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  };

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    return [...rooms]
      .filter(matchesDestination)
      .filter(matchesType)
      .filter(matchesPrice)
      .filter(matchesGuests)
      .filter(matchesAvailability)
      .sort(sortRooms);
  }, [rooms, selectedSort, destination, typeFilter, priceRange, guestsParam, unavailableIds]);

  const totalPages   = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE);
  const startIndex   = (currentPage - 1) * ROOMS_PER_PAGE;
  const endIndex     = startIndex + ROOMS_PER_PAGE;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);

  const isFiltered   = priceRange[0] > 0 || priceRange[1] < maxPrice || selectedSort !== "";
  const resetFilters = () => { setPriceRange([0, maxPrice]); setSelectedSort(""); };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const goToRoom = (roomId) => {
    const params = new URLSearchParams();
    if (checkInParam)  params.set("checkIn",  checkInParam);
    if (checkOutParam) params.set("checkOut", checkOutParam);
    if (guestsParam)   params.set("guests",   guestsParam);
    const qs = params.toString();
    navigate(`/rooms/${roomId}${qs ? `?${qs}` : ""}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="pt-28 px-6 md:px-16 lg:px-24 dark:bg-gray-900 min-h-screen transition-colors duration-300">

      {/* ✅ MAIN LAYOUT — rooms list + AI sidebar */}
      <div className="flex gap-8 items-start">

        {/* LEFT — rooms list (existing content) */}
        <div className="flex-1 min-w-0">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-playfair text-gray-900 dark:text-white">Hotel Rooms</h1>
              {typeFilter && (
                <div className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black text-sm px-4 py-1.5 rounded-full">
                  <span>{typeFilter}</span>
                  <button onClick={() => navigate("/rooms")} className="ml-1 hover:opacity-70">✕</button>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition ${
                isFiltered
                  ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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

          {/* Active search badges */}
          {(checkInParam || checkOutParam || guestsParam > 1) && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {checkInParam && (
                <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700">
                  📅 Check-in: {formatDate(checkInParam)}
                </span>
              )}
              {checkOutParam && (
                <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700">
                  📅 Check-out: {formatDate(checkOutParam)}
                </span>
              )}
              {guestsParam > 1 && (
                <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700">
                  👥 {guestsParam} Guests
                </span>
              )}
              {checkingAvailability && (
                <span className="text-xs text-gray-400 dark:text-gray-500 animate-pulse">⏳ Checking availability...</span>
              )}
            </div>
          )}

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-10 items-start transition-colors duration-300">
              <div className="flex-1 min-w-[240px]">
                <p className="text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">Price Range</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  {currency}{priceRange[0].toLocaleString()} — {currency}{priceRange[1].toLocaleString()} / night
                </p>
                <div className="flex gap-4 items-center">
                  <input type="range" min={0} max={maxPrice} step={100} value={priceRange[0]}
                    onChange={(e) => { const v = Number(e.target.value); if (v < priceRange[1]) setPriceRange([v, priceRange[1]]); }}
                    className="w-full accent-black dark:accent-white cursor-pointer" />
                  <input type="range" min={0} max={maxPrice} step={100} value={priceRange[1]}
                    onChange={(e) => { const v = Number(e.target.value); if (v > priceRange[0]) setPriceRange([priceRange[0], v]); }}
                    className="w-full accent-black dark:accent-white cursor-pointer" />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{currency}0</span><span>{currency}{maxPrice.toLocaleString()}</span>
                </div>
              </div>
              <div className="min-w-[200px]">
                <p className="text-sm font-medium mb-3 text-gray-800 dark:text-gray-200">Sort By</p>
                <div className="flex flex-col gap-2">
                  {["Price Low to High", "Price High to Low", "Newest First"].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                      <input type="radio" name="sort" checked={selectedSort === option}
                        onChange={() => setSelectedSort(option)} className="accent-black dark:accent-white" />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 justify-end">
                {isFiltered && <button onClick={resetFilters} className="text-sm text-red-500 hover:underline">Reset Filters</button>}
                <button onClick={() => setIsFilterOpen(false)}
                  className="text-sm bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full hover:opacity-80 transition">
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Results count */}
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">
            {checkingAvailability ? "Checking availability..." : (
              filteredRooms.length > 0
                ? `Showing ${startIndex + 1}–${Math.min(endIndex, filteredRooms.length)} of ${filteredRooms.length} rooms`
                : "0 rooms found"
            )}
          </p>

          {/* Room List */}
          <div className="flex-1">
            {!checkingAvailability && filteredRooms.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-5xl mb-4">🏨</p>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium mb-2">No rooms available</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                  {checkInParam && checkOutParam
                    ? "No rooms available for the selected dates and guests."
                    : "No rooms found for selected filters."}
                </p>
                <button onClick={resetFilters} className="text-sm underline text-black dark:text-white">Clear filters</button>
              </div>
            )}

            {currentRooms.map((room) => (
              <div key={room._id} className="flex flex-col md:flex-row gap-6 py-8 border-b border-gray-200 dark:border-gray-700">
                <div className="relative md:w-1/2">
                  <img src={getImage(room)} alt="room"
                    className="w-full h-64 object-cover rounded-xl shadow cursor-pointer"
                    onClick={() => goToRoom(room._id)}
                    onError={(e) => { e.target.src = assets.placeholderImage; }} />
                  <button onClick={(e) => toggleWishlist(e, room._id)}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow transition hover:scale-110 active:scale-95
                      ${wishlistedIds[room._id] ? "bg-red-500 text-white" : "bg-white/80 text-gray-600"}`}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24"
                      fill={wishlistedIds[room._id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M12 21s-6.7-4.35-9.19-7.36C.84 11.29 1.13 7.9 3.51 6.1c2.07-1.56 4.93-1.12 6.49.97 1.56-2.09 4.42-2.53 6.49-.97 2.38 1.8 2.67 5.19.7 7.54C18.7 16.65 12 21 12 21Z" />
                    </svg>
                  </button>
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                    {currency}{room.pricePerNight} / night
                  </div>
                </div>

                <div className="md:w-1/2">
                  <p className="text-gray-500 dark:text-gray-400">{room.hotel?.city || "City not available"}</p>
                  <h2 className="text-3xl font-playfair text-gray-900 dark:text-white">{room.hotel?.name || "Unknown Hotel"}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating />
                    <span className="text-sm text-gray-600 dark:text-gray-400">200+ reviews</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {room.amenities?.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">
                        <img src={facilityIcons[item]} className="w-4 h-4 dark:invert dark:opacity-80" alt="" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{item}</span>
                      </div>
                    ))}
                  </div>
                  {room.maxGuests && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      👥 Up to {room.maxGuests} guests
                      {room.baseGuests && room.extraGuestPrice
                        ? ` · Extra guest: ${currency}${room.extraGuestPrice}/night after ${room.baseGuests}`
                        : ""}
                    </p>
                  )}
                  <p className="text-xl mt-4 font-medium text-gray-900 dark:text-white">
                    {currency} {room.pricePerNight} / night
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => addToCompare(room)}
                      disabled={compareRooms.length >= 2}
                      className="text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition disabled:opacity-40">
                      Compare ⚖️
                    </button>
                    <button
                      onClick={() => goToRoom(room._id)}
                      className="text-xs bg-black dark:bg-white text-white dark:text-black px-4 py-1 rounded-full hover:opacity-80 transition">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Prev
              </button>
              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-400 dark:text-gray-500 select-none">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition ${
                      currentPage === page
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* ✅ RIGHT — AI Recommender Sidebar (only on xl screens) */}
        <div className="hidden xl:block w-[340px] shrink-0">
          <div className="sticky top-28">
            <AIRecommenderInline compact={true} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AllRooms;