import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import OwnerLayout from "./pages/hotelOwner/Layout";
import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";

import AllRooms from "./pages/AllRooms";
import RoomDetails from "./components/RoomDetails";

import MyBookings from "./pages/MyBookings";
import Wishlist from "./pages/Wishlist";   // ⭐ ADDED

import HotelReg from "./components/HotelReg";
import Loader from "./components/Loader";

import { useAppContext } from "./context/AppContext";

const App = () => {
  const { showHotelReg } = useAppContext();

  return (
    <>
      <Navbar />

      {showHotelReg && <HotelReg />}

      <Routes>
        {/* 🌍 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<AllRooms />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/wishlist" element={<Wishlist />} /> {/* ⭐ NEW */}
        <Route path="/loader/:nextUrl" element={<Loader />} />

        {/* 🏨 Owner Routes */}
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="add-room" element={<AddRoom />} />
          <Route path="list-room" element={<ListRoom />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;