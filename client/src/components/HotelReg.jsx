import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const HotelReg = () => {
  const { setShowHotelReg, navigate, axios, fetchUser, rooms } = useAppContext();
  const { getToken } = useAuth();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Dynamic cities from existing rooms in DB
  const cities = React.useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    const citySet = new Set();
    rooms.forEach((room) => {
      if (room.hotel?.city) citySet.add(room.hotel.city);
    });
    return Array.from(citySet).sort();
  }, [rooms]);

  // ✅ Close modal with ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setShowHotelReg(false);
    };
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
      if (!token) {
        toast.error("Authentication failed. Please login again.");
        return;
      }

      const { data } = await axios.post("/api/hotels", {
        name: name.trim(),
        contact: contact.trim(),
        address: address.trim(),
        city: city.trim(),
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

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]"
      onClick={() => setShowHotelReg(false)}
    >
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-[860px] max-w-[95%] grid md:grid-cols-2 relative overflow-hidden shadow-2xl"
      >
        {/* Close Button */}
        <img
          src={assets.closeIcon}
          alt="close"
          onClick={() => setShowHotelReg(false)}
          className="absolute top-5 right-5 h-4 cursor-pointer"
        />

        {/* Left Image */}
        <div className="h-48 md:h-full">
          <img
            src={assets.regImage}
            alt="hotel"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form */}
        <div className="p-6 md:p-10">
          <h3 className="text-lg font-semibold mb-6">
            Register Your Hotel
          </h3>

          <input
            placeholder="Hotel Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 mb-4 outline-none focus:border-black"
          />

          <input
            placeholder="Phone"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 mb-4 outline-none focus:border-black"
          />

          <input
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 mb-4 outline-none focus:border-black"
          />

          {/* ✅ City - free text input with datalist suggestions */}
          <input
            list="city-suggestions"
            placeholder="City (type any city)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 mb-6 outline-none focus:border-black"
          />
          <datalist id="city-suggestions">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white py-2 rounded w-full"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelReg;