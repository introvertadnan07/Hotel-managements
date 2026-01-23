import React from "react";
import heroImage from "../assets/heroImage.png";
import { cities, assets } from "../assets/assets";

const Hero = () => {
  return (
    <div
      className="relative flex flex-col items-start justify-start px-6 md:px-16 lg:px-24 xl:px-32 pt-32 h-screen bg-no-repeat bg-cover bg-center"
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

      <form className='bg-white text-gray-500 rounded-lg px-6 py-4 mt-8 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto'>

            <div>
                <div className='flex items-center gap-2'>
                    <img src={assets.calenderIcon} alt="" className='h-4'/>
                    <label htmlFor="destinationInput">Destination</label>
                </div>
                <input list='destinations' id="destinationInput" type="text" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" placeholder="Type here" required />

                <datalist id="destinations">
            {cities.map((city, index) => (
              <option key={index} value={city} />
            ))}
          </datalist>

            </div>

            <div>
                <div className='flex items-center gap-2'>
                    <img src={assets.calenderIcon} alt="" className='h-4'/>
                    <label htmlFor="checkIn">Check in</label>
                </div>
                <input id="checkIn" type="date" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" />
            </div>

            <div>
                <div className='flex items-center gap-2'>
                    <img src={assets.calenderIcon} alt="" className='h-4'/>
                    <label htmlFor="checkOut">Check out</label>
                </div>
                <input id="checkOut" type="date" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" />
            </div>

            <div className='flex md:flex-col max-md:gap-2 max-md:items-center'>
                <label htmlFor="guests">Guests</label>
                <input min={1} max={4} id="guests" type="number" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none  max-w-16" placeholder="0" />
            </div>

            <button className='flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1' >
                <img src={assets.searchIcon} alt="searchIcon" className='h-7'/>
                <span>Search</span>
            </button>
        </form>

     
    </div>
  );
};

export default Hero;
