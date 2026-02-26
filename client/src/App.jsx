import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Experience from "./pages/Experience";
import About from "./pages/About";

import OwnerLayout from "./pages/hotelOwner/Layout";
import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";

import AllRooms from "./pages/AllRooms";
import RoomDetails from "./components/RoomDetails";

import MyBookings from "./pages/MyBookings";
import Wishlist from "./pages/Wishlist";

import HotelReg from "./components/HotelReg";
import Loader from "./components/Loader";
import ChatAssistant from "./components/ChatAssistant";

import CompareBar from "./components/CompareBar";
import CompareModal from "./components/CompareModal";

import { useAppContext } from "./context/AppContext";

const App = () => {
  const { showHotelReg, isOwner } = useAppContext();
  const location = useLocation();

  const isOwnerRoute = location.pathname.startsWith("/owner");
  const [showCompare, setShowCompare] = useState(false);

  return (
    <>
      <Navbar />

      {!isOwnerRoute && <ChatAssistant />}

      {!isOwnerRoute && (
        <>
          <CompareBar onCompare={() => setShowCompare(true)} />
          {showCompare && (
            <CompareModal onClose={() => setShowCompare(false)} />
          )}
        </>
      )}

      {showHotelReg && <HotelReg />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<AllRooms />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/about" element={<About />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/loader/:nextUrl" element={<Loader />} />

        {/* 🔐 PROTECTED OWNER ROUTE */}
        <Route
          path="/owner/*"
          element={
            isOwner ? (
              <OwnerLayout />
            ) : (
              <Navigate to="/" />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-room" element={<AddRoom />} />
          <Route path="list-room" element={<ListRoom />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;