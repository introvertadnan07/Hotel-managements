import React from "react";
import heroImage from "../assets/heroImage.png";

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-[url('/src/assets/heroImage.png')] bg-cover bg-center">
      
      {/* overlay */}
      <div className="absolute inset-0 bg-black/25"></div>

      {/* content */}
      <div className="relative z-10 flex flex-col justify-center px-6 md:px-16 lg:px-24 pt-24 text-white max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
          Book Your Perfect Stay
        </h1>

        <p className="mt-4 text-lg drop-shadow">
          Discover hotels, experiences, and comfort wherever you travel.
        </p>
      </div>
    </div>
  );
};
export default Hero;