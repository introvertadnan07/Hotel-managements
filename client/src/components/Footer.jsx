import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="bg-[#F6F9FC] dark:bg-gray-900 text-gray-500/80 dark:text-gray-400 pt-8 px-6 md:px-16 lg:px-24 xl:px-32 transition-colors duration-300">
      <div className="flex flex-wrap justify-between gap-12 md:gap-6">

        {/* Brand */}
        <div className="max-w-80">
          <p className="font-playfair text-2xl text-gray-900 dark:text-white mb-4">AnumiflyStay</p>
          <p className="text-sm leading-relaxed">
            Discover the world's most extraordinary places to stay, from boutique hotels to luxury villas and private islands.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <img src={assets.instagramIcon} alt="instagram" className="w-6 dark:invert dark:opacity-70 hover:opacity-60 transition cursor-pointer" />
            <img src={assets.facebookIcon} alt="facebook" className="w-6 dark:invert dark:opacity-70 hover:opacity-60 transition cursor-pointer" />
            <img src={assets.twitterIcon} alt="twitter" className="w-6 dark:invert dark:opacity-70 hover:opacity-60 transition cursor-pointer" />
            <img src={assets.linkendinIcon} alt="linkedin" className="w-6 dark:invert dark:opacity-70 hover:opacity-60 transition cursor-pointer" />
          </div>
        </div>

        {/* Company */}
        <div>
          <p className="font-playfair text-lg text-gray-800 dark:text-white">COMPANY</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {["About", "Careers", "Press", "Blog", "Partners"].map(item => (
              <li key={item}><a href="#" className="hover:text-gray-800 dark:hover:text-white transition">{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <p className="font-playfair text-lg text-gray-800 dark:text-white">SUPPORT</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {["Help Center", "Safety Information", "Cancellation Options", "Contact Us", "Accessibility"].map(item => (
              <li key={item}><a href="#" className="hover:text-gray-800 dark:hover:text-white transition">{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="max-w-80">
          <p className="font-playfair text-lg text-gray-800 dark:text-white">STAY UPDATED</p>
          <p className="mt-3 text-sm">
            Subscribe to our newsletter for inspiration and special offers.
          </p>
          <div className="flex items-center mt-4">
            <input type="text"
              className="bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 rounded-l border border-gray-300 h-9 px-3 outline-none text-sm placeholder-gray-400"
              placeholder="Your email" />
            <button className="flex items-center justify-center bg-black dark:bg-white h-9 w-9 aspect-square rounded-r hover:opacity-80 transition">
              <img src={assets.arrowIcon} alt="arrow" className="w-3.5 invert dark:invert-0" />
            </button>
          </div>
        </div>

      </div>

      <hr className="border-gray-200 dark:border-gray-700 mt-8" />

      <div className="flex flex-col md:flex-row gap-2 items-center justify-between py-5 text-sm">
        <p>© {new Date().getFullYear()} AnumiflyStay. All rights reserved.</p>
        <ul className="flex items-center gap-4">
          {["Privacy", "Terms", "Sitemap"].map(item => (
            <li key={item}><a href="#" className="hover:text-gray-800 dark:hover:text-white transition">{item}</a></li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Footer;