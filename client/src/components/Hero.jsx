import React, { useState } from "react";
import heroImage from "../assets/heroImage.png";
import { cities, assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Hero = () => {
  const { navigate, getToken, axios, setSearchedCities } = useAppContext();

  const [destination, setDestination] = useState("");

  const onSearch = async (e) => {
    e.preventDefault();

    // ✅ Navigate with correct query param
    navigate(`/rooms?destination=${destination}`);

    try {
      const token = await getToken();

      // ✅ Store recent searched city in backend
      await axios.post(
        "/api/user/store-recent-search",
        { recentSearchedCity: destination },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Update frontend recent searches (max 3, no duplicates)
      setSearchedCities((prev) => {
        const filtered = prev.filter((city) => city !== destination);
        const updated = [...filtered, destination];

        if (updated.length > 3) {
          updated.shift();
        }

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
      {/* ✅ Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* ✅ Content Wrapper */}
      <div className="relative flex items-center min-h-screen px-6 md:px-16 lg:px-24 xl:px-32">
        <div className="max-w-5xl">

          {/* ✅ Badge */}
          <p className="bg-[#49B9FF] text-white px-4 py-1 rounded-full text-sm font-medium inline-block">
            The Ultimate Hotel Experience
          </p>

          {/* ✅ Heading */}
          <h1 className="font-playfair text-white text-3xl md:text-5xl lg:text-[56px] leading-tight font-bold max-w-xl mt-6">
            Discover Your Perfect <br /> Gateway Destination
          </h1>

          {/* ✅ Subtext */}
          <p className="text-gray-200 max-w-xl mt-4 text-sm md:text-base">
            Unparalleled luxury and comfort await at the world's most exclusive
            hotels and resorts. Start your journey today.
          </p>

          {/* ✅ Search Form */}
          <form
            onSubmit={onSearch}
            className="bg-white text-gray-600 rounded-xl px-6 py-4 mt-10 flex flex-col md:flex-row md:items-end gap-4 shadow-lg w-full max-w-4xl"
          >
            {/* ✅ Destination */}
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
                placeholder="Type here"
                required
              />

              <datalist id="destinations">
                {cities.map((city, index) => (
                  <option key={index} value={city} />
                ))}
              </datalist>
            </div>

            {/* ✅ Check-in */}
            <div>
              <div className="flex items-center gap-2 text-sm">
                <img src={assets.calenderIcon} alt="" className="h-4" />
                <label htmlFor="checkIn">Check in</label>
              </div>

              <input
                id="checkIn"
                type="date"
                className="rounded-lg border border-gray-200 px-3 py-2 mt-1 text-sm outline-none focus:border-black"
              />
            </div>

            {/* ✅ Check-out */}
            <div>
              <div className="flex items-center gap-2 text-sm">
                <img src={assets.calenderIcon} alt="" className="h-4" />
                <label htmlFor="checkOut">Check out</label>
              </div>

              <input
                id="checkOut"
                type="date"
                className="rounded-lg border border-gray-200 px-3 py-2 mt-1 text-sm outline-none focus:border-black"
              />
            </div>

            {/* ✅ Guests */}
            <div>
              <label htmlFor="guests" className="text-sm">
                Guests
              </label>

              <input
                min={1}
                max={4}
                id="guests"
                type="number"
                className="w-20 rounded-lg border border-gray-200 px-3 py-2 mt-1 text-sm outline-none focus:border-black"
                placeholder="1"
              />
            </div>

            {/* ✅ Search Button */}
            <button className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-white text-sm hover:bg-gray-800 transition">
              <img src={assets.searchIcon} alt="searchIcon" className="h-5" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Hero;
