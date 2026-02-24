import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState(null);
  const [isCheckingOwner, setIsCheckingOwner] = useState(true);

  const [showHotelReg, setShowHotelReg] = useState(false);
  const [rooms, setRooms] = useState([]);

  // ⭐ COMPARE FEATURE
  const [compareRooms, setCompareRooms] = useState([]);

  const addToCompare = (room) => {
    setCompareRooms((prev) => {
      if (prev.find((r) => r._id === room._id)) return prev;
      if (prev.length >= 2) return prev;
      return [...prev, room];
    });
  };

  const removeFromCompare = (roomId) => {
    setCompareRooms((prev) => prev.filter((r) => r._id !== roomId));
  };

  const clearCompare = () => setCompareRooms([]);

  const currency = "₹";

  const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
  });

  // ✅ Auto attach Clerk token
  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchRooms = async () => {
    try {
      const { data } = await api.get("/api/rooms");
      if (data?.success) setRooms(data.rooms || []);
    } catch (error) {
      console.log("ROOM FETCH ERROR:", error.response?.status);
    }
  };

  const fetchUser = async () => {
    try {
      setIsCheckingOwner(true);
      const { data } = await api.get("/api/user");

      if (data?.success) {
        setIsOwner(data.user.role === "hotelOwner");
      } else setIsOwner(false);
    } catch {
      setIsOwner(false);
    } finally {
      setIsCheckingOwner(false);
    }
  };

  useEffect(() => {
    if (user) fetchUser();
    else {
      setIsOwner(false);
      setIsCheckingOwner(false);
    }
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
        isCheckingOwner,

        showHotelReg,
        setShowHotelReg,

        axios: api,
        currency,

        rooms,
        fetchRooms,

        // ⭐ Compare
        compareRooms,
        addToCompare,
        removeFromCompare,
        clearCompare,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);