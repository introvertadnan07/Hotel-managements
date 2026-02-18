import React, { useEffect, useState } from "react";
import HotelCard from "./HotelCard";
import Title from "./Title";
import { useAppContext } from "../context/AppContext";

const RecommendedHotels = () => {
  const { rooms, searchedCities, navigate } = useAppContext();
  const [recommended, setRecommended] = useState([]);

  const filterHotels = () => {
    // ✅ Safety checks
    if (!rooms?.length || !searchedCities?.length) {
      setRecommended([]);
      return;
    }

    // ✅ Case-insensitive filtering
    const filteredHotels = rooms.filter((room) =>
      searchedCities
        .map((city) => city.toLowerCase())
        .includes(room.hotel?.city?.toLowerCase())
    );

    setRecommended(filteredHotels);
  };

  useEffect(() => {
    filterHotels();
  }, [rooms, searchedCities]);

  if (!rooms || rooms.length === 0) return null;

  return recommended.length > 0 && (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20">
      <Title
        title="Recommended Hotels"
        subTitle="Discover our handpicked selection of exceptional properties based on your recent searches."
      />

      <div className="flex flex-wrap items-center justify-center gap-6 mt-20">
        {recommended.slice(0, 4).map((room, index) => (
          <HotelCard key={room._id} room={room} index={index} />
        ))}
      </div>

      <button
        onClick={() => {
          navigate("/rooms");
          window.scrollTo(0, 0);
        }}
        className="mt-10 px-5 py-2 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 transition-all cursor-pointer"
      >
        View All Destinations
      </button>
    </div>
  );
};

export default RecommendedHotels;
