import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

import { assets, facilityIcons } from "../assets/assets";
import StarRating from "../components/StarRating";

const CheckBox = ({ label, selected, onChange }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="font-light select-none">{label}</span>
    </label>
  );
};

const RadioButton = ({ label, selected, onChange }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="radio"
        name="sort"
        checked={selected}
        onChange={onChange}
      />
      <span className="font-light select-none">{label}</span>
    </label>
  );
};

const AllRooms = () => {
  const { rooms, currency } = useAppContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedFilters, setSelectedFilters] = useState({
    roomType: [],
    priceRange: [],
  });

  const [selectedSort, setSelectedSort] = useState("");

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

  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };

      if (checked) {
        updated[type] = [...updated[type], value];
      } else {
        updated[type] = updated[type].filter((item) => item !== value);
      }

      return updated;
    });
  };

  const matchesRoomType = (room) =>
    selectedFilters.roomType.length === 0 ||
    selectedFilters.roomType.includes(room.roomType);

  const matchesPriceRange = (room) =>
    selectedFilters.priceRange.length === 0 ||
    selectedFilters.priceRange.some((range) => {
      const [min, max] = range.split("to").map(Number);
      return (
        room.pricePerNight >= min &&
        room.pricePerNight <= max
      );
    });

  const sortRooms = (a, b) => {
    if (selectedSort === "Price Low to High") {
      return a.pricePerNight - b.pricePerNight;
    }
    if (selectedSort === "Price High to Low") {
      return b.pricePerNight - a.pricePerNight;
    }
    if (selectedSort === "Newest First") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  };

  const filterRooms = useMemo(() => {
    return rooms
      ?.filter(
        (room) =>
          matchesRoomType(room) &&
          matchesPriceRange(room)
      )
      .sort(sortRooms);
  }, [rooms, selectedFilters, selectedSort]);

  const clearFilters = () => {
    setSelectedFilters({ roomType: [], priceRange: [] });
    setSelectedSort("");
    setSearchParams({});
  };

  return (
    <div className="flex flex-col lg:flex-row pt-28 px-6 md:px-16 lg:px-24">

      {/* ROOMS */}
      <div className="flex-1">
        <h1 className="text-4xl font-playfair mb-2">
          Hotel Rooms
        </h1>

        <p className="text-gray-500 mb-8">
          Take advantage of our limited-time offers and special packages.
        </p>

        {filterRooms?.length === 0 && (
          <p className="text-gray-500">
            No rooms found.
          </p>
        )}

        {filterRooms?.map((room) => (
          <div
            key={room._id}
            className="flex flex-col md:flex-row gap-6 py-8 border-b"
          >
            <img
              src={`http://localhost:5000${room.images?.[0] || "/placeholder.jpg"}`}
              alt="room"
              className="md:w-1/2 h-64 object-cover rounded-xl shadow cursor-pointer"
              onClick={() => navigate(`/rooms/${room._id}`)}
            />

            <div className="md:w-1/2">
              <p className="text-gray-500">
                {room.hotel?.city || "City not available"}
              </p>

              <h2 className="text-3xl font-playfair">
                {room.hotel?.name || "Unknown Hotel"}
              </h2>

              <div className="flex items-center gap-2 mt-2">
                <StarRating />
                <span className="text-sm">
                  200+ reviews
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                <img src={assets.locationIcon} alt="" />
                <span>
                  {room.hotel?.address || "Address not available"}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {room.amenities?.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded"
                  >
                    <img
                      src={facilityIcons[item]}
                      className="w-4 h-4"
                      alt=""
                    />
                    <span className="text-xs">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xl mt-4 font-medium">
                {currency} {room.pricePerNight} / night
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="w-full lg:w-80 border border-gray-300 p-5 mt-8 lg:mt-0 lg:ml-10">
        <div className="flex justify-between mb-4">
          <p className="font-medium">FILTERS</p>
          <button
            onClick={clearFilters}
            className="text-xs"
          >
            CLEAR
          </button>
        </div>

        <p className="font-medium">Room Type</p>
        {roomTypes.map((type) => (
          <CheckBox
            key={type}
            label={type}
            selected={selectedFilters.roomType.includes(type)}
            onChange={(checked) =>
              handleFilterChange(checked, type, "roomType")
            }
          />
        ))}

        <p className="font-medium mt-4">
          Price Range
        </p>

        {priceRange.map((range) => (
          <CheckBox
            key={range}
            label={`${currency} ${range}`}
            selected={selectedFilters.priceRange.includes(range)}
            onChange={(checked) =>
              handleFilterChange(checked, range, "priceRange")
            }
          />
        ))}

        <p className="font-medium mt-4">
          Sort By
        </p>

        {sortOptions.map((opt) => (
          <RadioButton
            key={opt}
            label={opt}
            selected={selectedSort === opt}
            onChange={() => setSelectedSort(opt)}
          />
        ))}
      </div>
    </div>
  );
};

export default AllRooms;
