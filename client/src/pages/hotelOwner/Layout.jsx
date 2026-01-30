import { Outlet } from "react-router-dom";
import Sidebar from "../../components/hotelOwner/Sidebar";
import Navbar from "../../components/hotelOwner/Navbar";

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
