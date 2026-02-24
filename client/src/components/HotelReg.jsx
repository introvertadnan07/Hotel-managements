import React, { useState, useEffect } from "react";
import { assets, cities } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const HotelReg = () => {
  const { setShowHotelReg, setIsOwner, navigate, axios } = useAppContext();
  const { getToken } = useAuth();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setShowHotelReg(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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

      const { data } = await axios.post(
        "/api/hotels",
        { name, contact, address, city }
      );

      if (data.success) {
        toast.success("Hotel registered successfully");

        setIsOwner(true);
        setShowHotelReg(false);
        navigate("/owner");
      } else {
        toast.error(data.message);

        if (data.message?.toLowerCase().includes("already")) {
          setIsOwner(true);
          setShowHotelReg(false);
          navigate("/owner");
        }
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed";

      toast.error(message);

      if (message.toLowerCase().includes("already")) {
        setIsOwner(true);
        setShowHotelReg(false);
        navigate("/owner");
      }

      console.log("REG ERROR:", error.response?.data);
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
        <img
          src={assets.closeIcon}
          alt="close"
          onClick={() => setShowHotelReg(false)}
          className="absolute top-5 right-5 h-4 cursor-pointer"
        />

        <div className="h-48 md:h-full">
          <img
            src={assets.regImage}
            alt="hotel"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 md:p-10">
          <h3 className="text-lg font-semibold mb-4">
            Register Your Hotel
          </h3>

          <input
            placeholder="Hotel Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3"
          />

          <input
            placeholder="Phone"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3"
          />

          <input
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3"
          />

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          >
            <option value="" disabled>Select City</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            disabled={loading}
            className="bg-indigo-500 text-white py-2 rounded w-full"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelReg;