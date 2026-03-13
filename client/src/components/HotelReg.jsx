import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const HotelReg = () => {
  const { setShowHotelReg, navigate, axios, fetchUser, rooms } = useAppContext();
  const { getToken } = useAuth();

  const [name, setName]       = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity]       = useState("");
  const [loading, setLoading] = useState(false);

  // Dynamic cities from existing rooms in DB
  const cities = React.useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    const citySet = new Set();
    rooms.forEach((room) => {
      if (room.hotel?.city) citySet.add(room.hotel.city);
    });
    return Array.from(citySet).sort();
  }, [rooms]);

  // Close modal with ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setShowHotelReg(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setShowHotelReg]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!name || !address || !contact || !city) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) { toast.error("Authentication failed. Please login again."); return; }

      const { data } = await axios.post("/api/hotels", {
        name:    name.trim(),
        contact: contact.trim(),
        address: address.trim(),
        city:    city.trim(),
      });

      if (data.success) {
        toast.success("Hotel registered successfully");
        await fetchUser();
        setShowHotelReg(false);
        navigate("/owner");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      if (message.toLowerCase().includes("already")) {
        await fetchUser();
        setShowHotelReg(false);
        navigate("/owner");
      }
      console.log("HOTEL REGISTER ERROR:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Shared input class with full dark mode
  const inputClass = "w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 rounded-lg px-3 py-2.5 mb-4 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition";

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]"
      onClick={() => setShowHotelReg(false)}
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl w-[860px] max-w-[95%] grid md:grid-cols-2 relative overflow-hidden shadow-2xl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setShowHotelReg(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition z-10 text-lg"
        >
          ✕
        </button>

        {/* Left Image */}
        <div className="h-48 md:h-full">
          <img src={assets.regImage} alt="hotel" className="w-full h-full object-cover" />
        </div>

        {/* Right Form */}
        <div className="p-6 md:p-10">
          <div className="mb-6">
            <h3 className="text-xl font-playfair text-gray-900 dark:text-white">Register Your Hotel</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in your hotel details to get started</p>
          </div>

          <input
            placeholder="Hotel Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            required
          />

          <input
            placeholder="Phone Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className={inputClass}
            required
          />

          <input
            placeholder="Full Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClass}
            required
          />

          <input
            list="city-suggestions"
            placeholder="City (type any city)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass.replace("mb-4", "mb-6")}
            required
          />
          <datalist id="city-suggestions">
            {cities.map((c) => <option key={c} value={c} />)}
          </datalist>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white py-2.5 rounded-lg w-full font-medium disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register Hotel"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelReg;