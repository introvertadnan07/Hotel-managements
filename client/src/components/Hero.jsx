import React from "react";
import heroImage from "../assets/heroImage.png";
import { cities, assets } from "../assets/assets";

const Hero = () => {
  return (
    <div
      className="relative flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 pt-28 min-h-screen bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Badge */}
      <p className="bg-[#49B9FF] text-white px-4 py-1 rounded-full text-sm font-medium">
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
      <form className="bg-white text-gray-600 rounded-xl px-6 py-4 mt-10 flex flex-col md:flex-row md:items-end gap-4 shadow-lg w-full max-w-4xl">
        
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

        {/* Check-in */}
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

        {/* Check-out */}
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

        {/* Guests */}
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

        {/* Button */}
        <button className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-white text-sm hover:bg-gray-800 transition">
          <img src={assets.searchIcon} alt="searchIcon" className="h-5" />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
};

export default Hero;
