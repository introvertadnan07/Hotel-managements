import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import OwnerLayout from "./pages/hotelOwner/Layout";
import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";

import AllRooms from "./pages/AllRooms";
import RoomDetails from "./components/RoomDetails";

import HotelReg from "./components/HotelReg";   // ✅ ADD THIS
import { useAppContext } from "./context/AppContext"; // ✅ ADD

const App = () => {
  const { showHotelReg } = useAppContext();   // ✅ GET STATE

  return (
    <>
      <Navbar />

      {/* ✅ HOTEL REGISTRATION MODAL */}
      {showHotelReg && <HotelReg />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/rooms" element={<AllRooms />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />

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
