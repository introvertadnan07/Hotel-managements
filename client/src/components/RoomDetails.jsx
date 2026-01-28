import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  assets,
  facilityIcons,
  roomsDummyData,
  roomCommonData,
} from "../assets/assets";
import StarRating from "./StarRating";

const RoomDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);

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
            alt="Main room"
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

      {/* Experience + Price (MATCHES TUTORIAL) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-10 gap-6">
        <h2 className="text-3xl md:text-4xl font-playfair">
          Experience Luxury Like Never Before
        </h2>

        <p className="text-2xl font-medium">
          ${room.pricePerNight} / night
        </p>
      </div>

      {/* Amenities */}
      <div className="flex flex-wrap gap-4 mt-6">
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

      {/* Booking Form */}
      <form className="flex flex-col md:flex-row items-center justify-between bg-white shadow-[0_0_20px_rgba(0,0,0,0.15)] rounded-xl mt-16 max-w-6xl mx-auto px-6 py-6 gap-6">
        <div className="flex flex-col md:flex-row gap-6 text-gray-500 w-full">
          <div className="flex flex-col">
            <label className="font-medium">Check-In</label>
            <input type="date" className="border rounded px-3 py-2 mt-1.5" />
          </div>

          <div className="flex flex-col">
            <label className="font-medium">Check-Out</label>
            <input type="date" className="border rounded px-3 py-2 mt-1.5" />
          </div>

          <div className="flex flex-col">
            <label className="font-medium">Guests</label>
            <input
              type="number"
              min="1"
              className="border rounded px-3 py-2 mt-1.5 max-w-[80px]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-10 py-4 min-w-[180px]"
        >
          Check Availability
        </button>
      </form>

      {/* Common Specifications */}
      <div className="mt-16 space-y-4">
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

      {/* Description */}
      <div className="max-w-3xl border-y border-gray-300 my-16 py-10 text-gray-500">
        <p>
          Guests are thoughtfully accommodated on the ground floor, subject to
          availability, ensuring ease and comfort throughout your stay. This
          elegant two-bedroom apartment offers a refined blend of space, style,
          and authentic city charm.
        </p>
      </div>

      {/* Hosted by */}
      <div className="flex items-center gap-4 mt-12">
        <img
          src={room?.hotel?.owner?.image}
          alt="Host"
          className="h-14 w-14 md:h-16 md:w-16 rounded-full object-cover"
        />

        <div>
          <p className="text-lg md:text-xl font-medium">
            Hosted by {room.hotel.owner.username}
          </p>

          <div className="flex items-center mt-1">
            <StarRating />
            <p className="ml-2 text-sm text-gray-500">200+ reviews</p>
          </div>
        </div>
      </div>

      {/* Contact Button */}
      <button className="px-6 py-2.5 mt-6 rounded text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer">
        Contact Now
      </button>

    </div>
  );
};

export default RoomDetails;
