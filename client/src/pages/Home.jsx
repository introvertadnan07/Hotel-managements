import React from "react";
import heroImage from "../assets/heroImage.png";

const Hero = () => {
  return (
    <div
      className="flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-no-repeat bg-cover bg-center h-screen pt-32"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <h1 className="text-4xl md:text-6xl font-bold">
        Book Your Perfect Stay
      </h1>
      <p className="mt-4 text-lg max-w-xl">
        Discover hotels, experiences, and comfort wherever you travel.
      </p>
    </div>
  );
};

export default Hero;
