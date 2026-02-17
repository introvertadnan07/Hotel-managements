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

  const currency = "$";

  const api = axios.create({
    baseURL: "/",
  });

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

  const fetchUser = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await api.get("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.success) {
        setIsOwner(data.user.role === "hotelOwner");  // ✅ FIX WORKS NOW
      }
    } catch (error) {
      console.error("fetchUser error:", error.message);
    }
  };

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
        axios: api,
        getToken,
        currency,
        rooms,
        setRooms,
        fetchRooms,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
