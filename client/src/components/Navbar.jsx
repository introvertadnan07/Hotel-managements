import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  assets,
  facilityIcons,
  roomCommonData,
  roomsDummyData,
} from "../assets/assets";
import StarRating from "./StarRating";

const RoomDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const foundRoom = roomsDummyData.find((r) => r._id === id);
    if (foundRoom) {
      setRoom(foundRoom);
      setMainImage(foundRoom.images[0]);
    }
  }, [id]);

  if (!room) return null;

  return (
    <div className="py-28 md:py-36 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <h1 className="text-3xl md:text-4xl font-playfair">
          {room.hotel.name}{" "}
          <span className="font-inter text-sm">({room.roomType})</span>
        </h1>
        <span className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-full">
          20% OFF
        </span>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mt-2">
        <StarRating />
        <p className="ml-2">200+ reviews</p>
      </div>

      {/* Address */}
      <div className="flex items-center gap-1 text-gray-500 mt-2">
        <img src={assets.locationIcon} alt="location" />
        <span>{room.hotel.address}</span>
      </div>

      {/* Images */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        <div className="lg:w-1/2">
          <img
            src={mainImage}
            alt="Main Room"
            className="w-full rounded-xl shadow-lg object-cover"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:w-1/2">
          {room.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="Room"
              onClick={() => setMainImage(img)}
              className={`cursor-pointer rounded-xl shadow-md object-cover ${
                mainImage === img
                  ? "outline outline-2 outline-orange-500"
                  : ""
              }`}
            />
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="flex flex-col md:flex-row md:justify-between mt-10 gap-6">
        <h2 className="text-3xl md:text-4xl font-playfair">
          Experience Luxury Like Never Before
        </h2>

        <div className="flex flex-wrap gap-4">
          {room.amenities.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100"
            >
              <img src={facilityIcons[item]} alt={item} className="w-5 h-5" />
              <p className="text-xs">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      <p className="text-2xl font-medium mt-6">
        ${room.pricePerNight} / Night
      </p>

      {/* Booking Form */}
      <form className="flex flex-col md:flex-row items-center justify-between bg-white shadow-[0_0_20px_rgba(0,0,0,0.15)] rounded-xl mt-16 max-w-6xl mx-auto px-6 py-6 gap-6">
        <div className="flex flex-col md:flex-row gap-6 text-gray-500 w-full">
          <div className="flex flex-col">
            <label className="font-medium">Check-In</label>
            <input
              type="date"
              className="border rounded px-3 py-2 mt-1.5 outline-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium">Check-Out</label>
            <input
              type="date"
              className="border rounded px-3 py-2 mt-1.5 outline-none"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium">Guests</label>
            <input
              type="number"
              min={1}
              className="border rounded px-3 py-2 mt-1.5 outline-none max-w-[80px]"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-10 py-4 min-w-[180px] transition-all"
        >
          Check Availability
        </button>
      </form>

      {/* Common Specifications */}
      <div className="mt-16 space-y-6">
        {roomCommonData.map((spec, index) => (
          <div key={index} className="flex items-start gap-3">
            <img src={spec.icon} alt={spec.title} className="w-6 h-6" />
            <div>
              <p className="text-base font-medium">{spec.title}</p>
              <p className="text-gray-500">{spec.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomDetails;
