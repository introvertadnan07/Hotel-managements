import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [rooms, setRooms] = useState([]);

  // ✅ Currency (future scalable)
  const currency = "$";

  // ✅ Axios instance (recommended)
  const api = axios.create({
    baseURL: "/",
  });

  // ✅ Fetch Rooms (Public)
  const fetchRooms = async () => {
    try {
      const { data } = await api.get("/api/rooms");

      if (data?.success) {
        setRooms(data.rooms || []);
      } else {
        toast.error(data?.message || "Failed to load rooms");
      }
    } catch (error) {
      toast.error(error.message || "Rooms fetch failed");
    }
  };

  // ✅ Fetch Logged-in User
  const fetchUser = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await api.get("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data?.success) {
        setIsOwner(data.user.role === "hotelOwner");
      }
    } catch (error) {
      console.error("fetchUser error:", error.message);
    }
  };

  // ✅ Effects
  useEffect(() => {
    if (user) fetchUser();
  }, [user]);

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <AppContext.Provider
      value={{
        navigate,
        user,
        isOwner,
        setIsOwner,
        showHotelReg,
        setShowHotelReg,
        axios: api,   // ✅ expose configured axios
        getToken,
        currency,
        rooms,
        setRooms,
        fetchRooms,   // ✅ useful for refresh
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
