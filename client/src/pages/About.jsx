import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div className="bg-black text-white pt-24">

      {/* 🌑 HERO */}
      <div className="relative h-[65vh] w-full">
        <img
          src={assets.experiencehero}
          alt="about"
          className="w-full h-full object-cover opacity-60"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl md:text-6xl font-playfair mb-6">
            Crafted for Exceptional Stays
          </h1>

          <p className="max-w-2xl text-sm md:text-base text-gray-300">
            Anumifly blends refined design with intelligent technology to create
            a seamless hospitality experience for modern travelers.
          </p>
        </div>
      </div>

      {/* ✨ INTRO */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-playfair mb-6">
          About Anumifly
        </h2>

        <p className="text-gray-400 leading-relaxed max-w-3xl">
          Anumifly Smart Hotel Management is designed to elevate how guests
          discover and book rooms. Our platform focuses on simplicity,
          elegance, and intelligent automation, ensuring every interaction
          feels effortless and refined.
        </p>
      </div>

      {/* 🖤 PREMIUM FEATURES */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 pb-24">

        <div className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur">
          <h3 className="text-xl font-semibold mb-3">
            Intelligent Experience
          </h3>
          <p className="text-sm text-gray-400">
            AI-powered tools assist with pricing, descriptions, and smarter
            booking decisions.
          </p>
        </div>

        <div className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur">
          <h3 className="text-xl font-semibold mb-3">
            Elegant Simplicity
          </h3>
          <p className="text-sm text-gray-400">
            A clean and distraction-free interface designed for comfort
            and clarity.
          </p>
        </div>

        <div className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur">
          <h3 className="text-xl font-semibold mb-3">
            Built for Growth
          </h3>
          <p className="text-sm text-gray-400">
            Hotel owners gain powerful tools to manage rooms, pricing,
            and availability.
          </p>
        </div>

      </div>

      {/* 👤 FOUNDER SECTION */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

          <div className="space-y-5">
            <h2 className="text-3xl font-playfair">
              Founder’s Vision
            </h2>

            <p className="text-gray-400 leading-relaxed">
              Anumifly was created with a simple belief: booking a stay
              should feel as smooth and premium as the stay itself.
              The platform was designed to remove friction, enhance
              decision-making with AI, and deliver an experience that
              feels modern yet luxurious.
            </p>

            <p className="text-gray-500 text-sm">
              “Technology should enhance hospitality, not complicate it.”
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-2xl blur-2xl"></div>

            <img
          src={assets.adnanImage}
          alt="adnan"
          className="w-42 h-44 rounded-full border-4 border-white"
          />
          </div>

        </div>
      </div>

      {/* 🎯 MISSION */}
      <div className="bg-gradient-to-b from-black to-gray-900 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-playfair mb-4">
            Our Mission
          </h2>

          <p className="text-gray-400">
            To redefine hotel booking through intelligent systems,
            elegant interfaces, and seamless digital experiences.
          </p>
        </div>
      </div>

    </div>
  );
};

export default About;