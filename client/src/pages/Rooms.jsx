import React from "react";
import { useAppContext } from "../context/AppContext";
import HotelCard from "../components/HotelCard";
import Title from "../components/Title";

const Rooms = () => {
  const { rooms } = useAppContext();

  return (
    <div className="px-6 md:px-16 lg:px-24 py-24">
      <Title
        title="All Rooms"
        subTitle="Browse all available rooms"
      />

      <div className="flex flex-wrap gap-6 mt-10">
        {rooms.map((room, index) => (
          <HotelCard key={room._id} room={room} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Rooms;
