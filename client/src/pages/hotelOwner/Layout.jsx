import { Outlet } from "react-router-dom";
import Sidebar from "../../components/hotelOwner/Sidebar";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 pt-20">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-5xl p-6">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default Layout;
