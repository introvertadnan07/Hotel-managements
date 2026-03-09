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
import Analytics from "./pages/hotelOwner/Analytics";

import AllRooms from "./pages/AllRooms";
import RoomDetails from "./components/RoomDetails";
import MyBookings from "./pages/MyBookings";
import Wishlist from "./pages/Wishlist";
import AdminPanel from "./pages/AdminPanel"; // ✅ new

import HotelReg from "./components/HotelReg";
import Loader from "./components/Loader";
import ChatAssistant from "./components/ChatAssistant";
import CompareBar from "./components/CompareBar";
import CompareModal from "./components/CompareModal";

import { useAppContext } from "./context/AppContext";

const App = () => {
  const { showHotelReg, isOwner, role } = useAppContext();
  const location = useLocation();
  const isOwnerRoute = location.pathname.startsWith("/owner");
  const [showCompare, setShowCompare] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white transition-colors duration-300">

      <Navbar />

      {!isOwnerRoute && <ChatAssistant />}

      {!isOwnerRoute && (
        <>
          <CompareBar onCompare={() => setShowCompare(true)} />
          {showCompare && <CompareModal onClose={() => setShowCompare(false)} />}
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

        {/* ✅ ADMIN ROUTE */}
        <Route
          path="/admin"
          element={role === "admin" ? <AdminPanel /> : <Navigate to="/" />}
        />

        {/* 🔐 OWNER ROUTE */}
        <Route
          path="/owner/*"
          element={isOwner ? <OwnerLayout /> : <Navigate to="/" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="add-room" element={<AddRoom />} />
          <Route path="list-room" element={<ListRoom />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>

    </div>
  );
};

export default App;