import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

import { assets, facilityIcons } from "../assets/assets";
import StarRating from "../components/StarRating";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // ✅ FIX

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

  const destination = searchParams.get("destination");

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

  const matchesDestination = (room) =>
    !destination ||
    room.hotel?.city?.toLowerCase().includes(destination.toLowerCase());

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
          matchesDestination(room) &&
          matchesRoomType(room) &&
          matchesPriceRange(room)
      )
      .sort(sortRooms);
  }, [rooms, selectedFilters, selectedSort, destination]);

  const clearFilters = () => {
    setSelectedFilters({ roomType: [], priceRange: [] });
    setSelectedSort("");
    setSearchParams({});
  };

  return (
    <div className="flex flex-col lg:flex-row pt-28 px-6 md:px-16 lg:px-24">
      <div className="flex-1">
        <h1 className="text-4xl font-playfair mb-2">
          Hotel Rooms
        </h1>

        {filterRooms?.map((room) => (
          <div key={room._id} className="flex gap-6 py-8 border-b">
            <img
              src={`${BACKEND_URL}${room.images?.[0] || "/placeholder.jpg"}`} // ✅ FIX
              alt="room"
              className="md:w-1/2 h-64 object-cover rounded-xl shadow"
              onClick={() => navigate(`/rooms/${room._id}`)}
            />

            <div>
              <h2>{room.hotel?.name}</h2>
              <p>{currency} {room.pricePerNight}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllRooms;