import React, { useState } from "react";
import { assets } from "../assets/assets";
import Title from "./Title";
import axios from "axios";
import toast from "react-hot-toast";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/newsletter/subscribe`,
        { email }
      );
      if (data.success) {
        toast.success("Subscribed successfully! 🎉");
        setEmail("");
      } else {
        toast.error(data.message || "Subscription failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-5xl lg:w-full rounded-2xl px-4 py-12 md:py-16 mx-2 lg:mx-auto my-20 bg-gray-900 dark:bg-gray-800 text-white transition-colors duration-300">

      <Title
        title="Stay Inspired"
        subTitle="Join our newsletter and be the first to discover new destinations, exclusive offers, and travel inspirations."
      />

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 w-full max-w-md">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
          className="bg-white/10 px-4 py-2.5 border border-white/20 rounded outline-none w-full text-white placeholder-gray-400 focus:border-white/50 transition"
          placeholder="Enter your email"
        />
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="flex items-center justify-center gap-2 group bg-white text-black px-6 py-2.5 rounded hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-60 whitespace-nowrap font-medium text-sm w-full sm:w-auto"
        >
          {loading ? "Subscribing..." : "Subscribe"}
          {!loading && (
            <img src={assets.arrowIcon} alt="arrow" className="w-3.5 group-hover:translate-x-1 transition-all" />
          )}
        </button>
      </div>

      <p className="text-gray-500 mt-6 text-xs text-center">
        By subscribing, you agree to our Privacy Policy and consent to receive updates.
      </p>
    </div>
  );
};

export default NewsLetter;