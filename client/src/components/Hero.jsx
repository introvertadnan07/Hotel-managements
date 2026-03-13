import React, { useState, useMemo } from "react";
import heroImage from "../assets/heroImage.png";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { AIRecommenderInline } from "./AIRecommender";

const Hero = () => {
  const { navigate, getToken, axios, setSearchedCities, rooms } = useAppContext();

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn]         = useState("");
  const [checkOut, setCheckOut]       = useState("");
  const [guests, setGuests]           = useState(1);

  // ✅ AI panel toggle
  const [showAI, setShowAI] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const cities = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    const citySet = new Set();
    rooms.forEach((room) => {
      if (room.hotel?.city) citySet.add(room.hotel.city);
    });
    return Array.from(citySet).sort();
  }, [rooms]);

  const onSearch = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn)     params.set("checkIn", checkIn);
    if (checkOut)    params.set("checkOut", checkOut);
    if (guests)      params.set("guests", guests);
    navigate(`/rooms?${params.toString()}`);
    try {
      const token = await getToken();
      await axios.post(
        "/api/user/store-recent-search",
        { recentSearchedCity: destination },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchedCities((prev) => {
        const filtered = prev.filter((city) => city !== destination);
        const updated = [...filtered, destination];
        if (updated.length > 3) updated.shift();
        return updated;
      });
    } catch (error) {
      console.error("Recent search save failed:", error);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative flex items-center min-h-screen px-6 md:px-16 lg:px-24 xl:px-32">
        <div className="max-w-5xl w-full">

          {/* Badge */}
          <p className="bg-[#49B9FF] text-white px-4 py-1 rounded-full text-sm font-medium inline-block">
            The Ultimate Hotel Experience
          </p>

          {/* Heading */}
          <h1 className="font-playfair text-white text-3xl md:text-5xl lg:text-[56px] leading-tight font-bold max-w-xl mt-6">
            Discover Your Perfect <br /> Gateway Destination
          </h1>

          {/* Subtext */}
          <p className="text-gray-200 max-w-xl mt-4 text-sm md:text-base">
            Unparalleled luxury and comfort await at the world's most exclusive
            hotels and resorts. Start your journey today.
          </p>

          {/* Search Form */}
          <form
            onSubmit={onSearch}
            className="bg-white text-gray-600 rounded-xl px-6 py-4 mt-10 flex flex-col md:flex-row md:items-end gap-4 shadow-lg w-full max-w-4xl"
          >
            {/* Destination */}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <img src={assets.calenderIcon} alt="" className="h-4" />
                <label htmlFor="destinationInput">Destination</label>
              </div>
              <input
                list="destinations"
                id="destinationInput"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 mt-1 text-sm outline-none focus:border-black"
                placeholder="Type city name"
                required
              />
              <datalist id="destinations">
                {cities.map((city, index) => (
                  <option key={index} value={city} />
                ))}
              </datalist>
            </div>

            {/* Check-in */}
            <div>
              <div className="flex items-center gap-2 text-sm">
                <img src={assets.calenderIcon} alt="" className="h-4" />
                <label htmlFor="checkIn">Check in</label>
              </div>
              <input
                id="checkIn"
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (checkOut && e.target.value >= checkOut) setCheckOut("");
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 mt-1 text-sm outline-none focus:border-black"
              />
            </div>

            {/* Check-out */}
            <div>
              <div className="flex items-center gap-2 text-sm">
                <img src={assets.calenderIcon} alt="" className="h-4" />
                <label htmlFor="checkOut">Check out</label>
              </div>
              <input
                id="checkOut"
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 mt-1 text-sm outline-none focus:border-black"
              />
            </div>

            {/* Guests */}
            <div>
              <label htmlFor="guests" className="text-sm">Guests</label>
              <input
                min={1}
                max={10}
                id="guests"
                type="number"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-20 rounded-lg border border-gray-200 px-3 py-2 mt-1 text-sm outline-none focus:border-black"
              />
            </div>

            {/* Search Button */}
            <button className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-white text-sm hover:bg-gray-800 transition">
              <img src={assets.searchIcon} alt="searchIcon" className="h-5" />
              <span>Search</span>
            </button>
          </form>

          {/* ✅ AI ROOM FINDER — appears below search form */}
          <div className="mt-5 max-w-4xl">
            {!showAI ? (
              <button
                onClick={() => setShowAI(true)}
                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-5 py-2.5 rounded-full text-sm hover:bg-white/25 transition group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">✨</span>
                <span>Not sure? Let AI find your perfect room</span>
                <span className="text-white/60 text-xs">→</span>
              </button>
            ) : (
              <div className="max-w-2xl">
                <AIRecommenderInline onClose={() => setShowAI(false)} />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;