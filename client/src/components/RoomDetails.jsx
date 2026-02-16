import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets, facilityIcons } from "../assets/assets";
import StarRating from "./StarRating";

const RoomDetails = () => {
  const { id } = useParams();
  const { axios, currency } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  const fetchRoom = async () => {
    try {
      const { data } = await axios.get(`/api/rooms/${id}`);

      if (data.success) {
        setRoom(data.room);
        setMainImage(data.room.images?.[0]);
      }
    } catch (error) {
      console.error("Room fetch error:", error.message);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  if (!room) {
    return <p className="pt-32 text-center">Loading...</p>;
  }

  return (
    <div className="py-28 md:py-36 px-4 md:px-16 lg:px-24 xl:px-32">

      {/* Header */}
      <h1 className="text-3xl font-playfair">
        {room.hotel?.name} ({room.roomType})
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2 mt-2">
        <StarRating />
        <span>200+ reviews</span>
      </div>

      {/* Address */}
      <div className="flex items-center gap-2 text-gray-500 mt-2">
        <img src={assets.locationIcon} alt="location" />
        <span>{room.hotel?.address}</span>
      </div>

      {/* Images Section */}
      <div className="flex flex-col lg:flex-row gap-6 mt-8">

        {/* Main Image */}
        <div className="lg:w-1/2">
          <img
            src={`http://localhost:5000${mainImage}`}
            alt="Main Room"
            className="w-full rounded-xl shadow-lg object-cover"
          />
        </div>

        {/* Thumbnail Images */}
        <div className="grid grid-cols-2 gap-4 lg:w-1/2">
          {room.images?.map((img, index) => (
            <img
              key={index}
              src={`http://localhost:5000${img}`}
              alt="Room"
              onClick={() => setMainImage(img)}
              className={`cursor-pointer rounded-xl shadow-md object-cover ${
                mainImage === img ? "outline outline-2 outline-blue-500" : ""
              }`}
            />
          ))}
        </div>
      </div>

      {/* Price */}
      <p className="text-2xl mt-8 font-medium">
        {currency} {room.pricePerNight} / night
      </p>

      {/* Amenities */}
      <div className="flex flex-wrap gap-3 mt-5">
        {room.amenities?.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg"
          >
            <img
              src={facilityIcons[item]}
              alt={item}
              className="w-5 h-5"
            />
            <span className="text-xs">{item}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default RoomDetails;
