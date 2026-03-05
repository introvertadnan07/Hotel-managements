import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {

  const navigate = useNavigate();

  const { user } = useUser();
  const { getToken } = useAuth();

  // ================= ROLE SYSTEM =================

  const [role, setRole] = useState("user");
  const [isCheckingOwner, setIsCheckingOwner] = useState(true);

  // ================= UI STATES =================

  const [showHotelReg, setShowHotelReg] = useState(false);
  const [rooms, setRooms] = useState([]);

  // ================= COMPARE SYSTEM =================

  const [compareRooms, setCompareRooms] = useState([]);

  const addToCompare = (room) => {
    setCompareRooms((prev) => {

      if (prev.find((r) => r._id === room._id)) return prev;

      if (prev.length >= 2) return prev;

      return [...prev, room];
    });
  };

  const removeFromCompare = (roomId) => {
    setCompareRooms((prev) =>
      prev.filter((r) => r._id !== roomId)
    );
  };

  const clearCompare = () => setCompareRooms([]);

  // ================= CONFIG =================

  const currency = "₹";

  const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
  });

  // ================= AXIOS TOKEN INTERCEPTOR =================

  api.interceptors.request.use(
    async (config) => {

      try {

        const token = await getToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

      } catch (error) {
        console.log("TOKEN ERROR:", error);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // ================= FETCH ROOMS =================

  const fetchRooms = async () => {
    try {

      const { data } = await api.get("/api/rooms");

      if (data?.success) {
        setRooms(data.rooms || []);
      }

    } catch (error) {
      console.log("ROOM FETCH ERROR:", error?.response?.status);
    }
  };

  // ================= FETCH USER ROLE =================

  const fetchUser = async () => {

    try {

      setIsCheckingOwner(true);

      const { data } = await api.get("/api/user");

      if (data?.success) {
        setRole(data.user.role || "user");
      } else {
        setRole("user");
      }

    } catch (error) {

      console.log("USER FETCH ERROR:", error?.response?.status);

      setRole("user");

    } finally {
      setIsCheckingOwner(false);
    }

  };

  // ================= USER LOGIN SYNC =================

  useEffect(() => {

    if (user) {
      fetchUser();
    } else {
      setRole("user");
      setIsCheckingOwner(false);
    }

  }, [user]);

  // ================= LOAD ROOMS =================

  useEffect(() => {
    fetchRooms();
  }, []);

  return (

    <AppContext.Provider
      value={{

        // Navigation
        navigate,

        // Auth
        user,
        role,
        isOwner: role === "hotelOwner",
        isCheckingOwner,
        fetchUser,

        // UI
        showHotelReg,
        setShowHotelReg,

        // Axios
        axios: api,

        // Rooms
        rooms,
        fetchRooms,
        currency,

        // Compare
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