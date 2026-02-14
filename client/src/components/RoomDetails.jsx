import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets, facilityIcons } from "../assets/assets";
import StarRating from "../components/StarRating";

const RoomDetails = () => {
  const { id } = useParams();
  const { axios } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  const fetchRoom = async () => {
    try {
      const { data } = await axios.get(`/api/rooms/${id}`);

      if (data.success) {
        setRoom(data.room);

        // ✅ Set default main image safely
        if (data.room.images?.length > 0) {
          setMainImage(data.room.images[0]);
        }
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

  // ✅ Safe main image URL
  const mainImageUrl = mainImage
    ? `http://localhost:5000/uploads/${mainImage}`
    : assets.placeholderImage;

  return (
    <div className="py-28 md:py-36 px-4 md:px-16 lg:px-24 xl:px-32">

      {/* ✅ Title */}
      <h1 className="text-3xl font-playfair">
        {room.hotel?.name} ({room.roomType})
      </h1>

      {/* ✅ Rating */}
      <div className="flex items-center gap-2 mt-2">
        <StarRating />
        <span>200+ reviews</span>
      </div>

      {/* ✅ Location */}
      <div className="flex items-center gap-2 text-gray-500 mt-2">
        <img src={assets.locationIcon} alt="location" />
        <span>{room.hotel?.address}</span>
      </div>

      {/* ✅ Images Section */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        
        {/* Main Image */}
        <div className="lg:w-1/2">
          <img
            src={mainImageUrl}
            alt="Room"
            className="w-full rounded-xl shadow-lg object-cover"
          />
        </div>

        {/* Thumbnail Images */}
        <div className="grid grid-cols-2 gap-4 lg:w-1/2">
          {room.images?.length > 0 ? (
            room.images.map((img, index) => (
              <img
                key={index}
                src={`http://localhost:5000/uploads/${img}`}
                alt="Room"
                onClick={() => setMainImage(img)}
                className={`cursor-pointer rounded-xl shadow-md border ${
                  mainImage === img ? "border-black" : "border-transparent"
                }`}
              />
            ))
          ) : (
            <p className="text-gray-400">No images available</p>
          )}
        </div>
      </div>

      {/* ✅ Price */}
      <p className="text-2xl mt-6 font-medium">
        ₹{room.pricePerNight} / night
      </p>

      {/* ✅ Amenities */}
      <div className="flex flex-wrap gap-3 mt-4">
        {room.amenities?.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded"
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
