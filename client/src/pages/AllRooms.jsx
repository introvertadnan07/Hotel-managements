import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { assets, facilityIcons, roomsDummyData } from "../assets/assets";
import StarRating from "../components/StarRating";

const CheckBox = ({ label }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input type="checkbox" />
      <span className="font-light select-none">{label}</span>
    </label>
  );
};

const RadioButton = ({ label }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input type="radio" name="sort" />
      <span className="font-light select-none">{label}</span>
    </label>
  );
};

const AllRooms = () => {
  const navigate = useNavigate();
  const [openFilters, setOpenFilters] = useState(false);

  const roomTypes = [
    "Single Bed",
    "Double Bed",
    "Luxury Room",
    "Family Suite",
  ];

  const priceRange = [
    "0 to 500",
    "500 to 1000",
    "1000 to 2000",
    "2000 to 3000",
  ];

  const sortOptions = [
    "Price Low to High",
    "Price High to Low",
    "Newest First",
  ];

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-36 px-4 md:px-16 lg:px-24 xl:px-32">
      
      {/* ================= ROOMS LIST ================= */}
      <div className="flex-1">
        <div className="mb-8">
          <h1 className="font-playfair text-4xl md:text-[40px]">
            Hotel Rooms
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl">
            Take advantage of our limited-time offers and special packages.
          </p>
        </div>

        {roomsDummyData.map((room) => (
          <div
            key={room._id}
            className="flex flex-col md:flex-row gap-6 py-10 border-b last:border-0"
          >
            <img
              src={room.images[0]}
              alt="room"
              onClick={() => navigate(`/rooms/${room._id}`)}
              className="md:w-1/2 max-h-64 object-cover rounded-xl shadow cursor-pointer"
            />

            <div className="md:w-1/2 flex flex-col gap-2">
              <p className="text-gray-500">{room.hotel.city}</p>

              <h2
                className="text-3xl font-playfair cursor-pointer"
                onClick={() => navigate(`/rooms/${room._id}`)}
              >
                {room.hotel.name}
              </h2>

              <div className="flex items-center gap-2">
                <StarRating />
                <span className="text-sm">200+ reviews</span>
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <img src={assets.locationIcon} alt="location" />
                <span>{room.hotel.address}</span>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {room.amenities.map((item, index) => (
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

              <p className="text-xl font-medium mt-3">
                ${room.pricePerNight} / Night
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ================= FILTERS ================= */}
      <div className="w-full lg:w-80 bg-white border border-gray-300 mb-8 lg:mb-0 lg:ml-10">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <p className="font-medium">FILTERS</p>
          <span
            className="text-xs cursor-pointer lg:hidden"
            onClick={() => setOpenFilters(!openFilters)}
          >
            {openFilters ? "HIDE" : "SHOW"}
          </span>
        </div>

        <div
          className={`px-5 overflow-hidden transition-all duration-500 ${
            openFilters ? "max-h-[600px]" : "max-h-0 lg:max-h-full"
          }`}
        >
          <div className="pt-5">
            <p className="font-medium mb-2">Room Type</p>
            {roomTypes.map((room, i) => (
              <CheckBox key={i} label={room} />
            ))}
          </div>

          <div className="pt-5">
            <p className="font-medium mb-2">Price Range</p>
            {priceRange.map((range, i) => (
              <CheckBox key={i} label={`$ ${range}`} />
            ))}
          </div>

          <div className="pt-5 pb-6">
            <p className="font-medium mb-2">Sort By</p>
            {sortOptions.map((opt, i) => (
              <RadioButton key={i} label={opt} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRooms;
