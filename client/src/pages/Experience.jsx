import React from "react";
import { assets } from "../assets/assets";

const experiences = [
  {
    title: "Luxury Spa",
    description:
      "Relax and rejuvenate with premium wellness treatments designed for ultimate comfort.",
    image: assets.spa,
  },
  {
    title: "Fine Dining",
    description:
      "Indulge in gourmet cuisine crafted by top chefs in an elegant atmosphere.",
    image: assets.dining,
  },
  {
    title: "Infinity Pool",
    description:
      "Enjoy breathtaking views while unwinding in our stunning infinity pool.",
    image: assets.pool,
  },
];

const Experience = () => {
  return (
    <div className="pt-24">

      {/* 🌟 HERO SECTION */}
      <div className="relative h-[60vh] w-full">
        <img
          src={assets.experiencehero}
          alt="Experience Hero"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-6xl font-playfair mb-4">
            Elevate Your Stay
          </h1>

          <p className="max-w-2xl text-sm md:text-base opacity-90">
            Discover experiences designed to transform your journey into unforgettable memories.
          </p>
        </div>
      </div>

      {/* ✨ INTRO TEXT */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-playfair mb-4">
          Curated Experiences
        </h2>

        <p className="text-gray-500 max-w-2xl mx-auto">
          From relaxation to indulgence, explore a world of comfort and luxury crafted just for you.
        </p>
      </div>

      {/* 🏝 EXPERIENCE CARDS */}
      <div className="max-w-6xl mx-auto px-4 pb-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {experiences.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition overflow-hidden group"
          >
            <div className="h-52 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
            </div>

            <div className="p-5">
              <h3 className="text-xl font-semibold mb-2">
                {item.title}
              </h3>

              <p className="text-sm text-gray-500">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ⭐ FEATURE STRIP */}
      <div className="bg-black text-white py-12">
        <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-lg font-semibold">Luxury Rooms</p>
            <p className="text-xs opacity-70">Designed for comfort</p>
          </div>

          <div>
            <p className="text-lg font-semibold">Premium Dining</p>
            <p className="text-xs opacity-70">Exceptional cuisine</p>
          </div>

          <div>
            <p className="text-lg font-semibold">Wellness & Spa</p>
            <p className="text-xs opacity-70">Relax & recharge</p>
          </div>

          <div>
            <p className="text-lg font-semibold">Infinity Pool</p>
            <p className="text-xs opacity-70">Scenic views</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Experience;