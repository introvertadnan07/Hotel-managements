import React, { useState } from "react";
import axios from "axios";
import { assets, cities } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "@clerk/clerk-react";
import "../styles/hotelReg.css";
import toast from "react-hot-toast";

const HotelReg = () => {
  const { setShowHotelReg, setIsOwner } = useAppContext();
  const { getToken } = useAuth();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!name || !address || !contact || !city) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();

      const { data } = await axios.post(
        "/api/hotels",
        { name, contact, address, city },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setIsOwner(true);
        setShowHotelReg(false);
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hotel-overlay" onClick={() => setShowHotelReg(false)}>
      <form
        className="hotel-modal"
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={assets.closeIcon}
          className="hotel-close"
          alt="close"
          onClick={() => setShowHotelReg(false)}
        />

        <div className="hotel-left">
          <img src={assets.regImage} alt="hotel" />
        </div>

        <div className="hotel-right">
          <h3>Register Your Hotel</h3>

          <label>Hotel Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />

          <label>Phone</label>
          <input value={contact} onChange={(e) => setContact(e.target.value)} />

          <label>Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} />

          <label>City</label>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="" disabled>
              Select City
            </option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelReg;
