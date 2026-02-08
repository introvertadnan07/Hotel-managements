import { Routes, Route, useLocation } from "react-router-dom";

// public
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AllRooms from "./pages/AllRooms";
import RoomDetails from "./components/RoomDetails";
import MyBookings from "./pages/MyBookings";

// owner
import Layout from "./pages/hotelOwner/Layout";
import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";

// hotel register modal
import HotelReg from "./components/HotelReg";

// context + toast
import { Toaster } from "react-hot-toast";
import { UseAppContext } from "./context/AppContext";

const App = () => {
  const location = useLocation();
  const isOwnerPath = location.pathname.startsWith("/owner");
  const { showHotelReg } = UseAppContext();

  return (
    <>
      <Toaster />

      {!isOwnerPath && <Navbar />}
      {showHotelReg && <HotelReg />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<AllRooms />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/my-bookings" element={<MyBookings />} />

        {/* OWNER ROUTES */}
        <Route path="/owner" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add-room" element={<AddRoom />} />
          <Route path="list-room" element={<ListRoom />} />
        </Route>
      </Routes>

      {!isOwnerPath && <Footer />}
    </>
  );
};

export default App;
