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

  // ✅ null = unknown (prevents flicker)
  const [isOwner, setIsOwner] = useState(null);
  const [isCheckingOwner, setIsCheckingOwner] = useState(true);

  const [showHotelReg, setShowHotelReg] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [searchedCities, setSearchedCities] = useState([]);

  const currency = "$";

  const api = axios.create({
    baseURL: "/",
  });

  // ✅ Fetch rooms
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

  // ✅ Fetch user / role
  const fetchUser = async () => {
    try {
      setIsCheckingOwner(true);

      const token = await getToken();

      if (!token) {
        setIsOwner(false);
        return;
      }

      const { data } = await api.get("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.success) {
        setIsOwner(data.user.role === "hotelOwner");
      } else {
        setIsOwner(false);
      }

    } catch (error) {
      console.error("fetchUser error:", error.message);
      setIsOwner(false);
    } finally {
      setIsCheckingOwner(false);
    }
  };

  // ✅ Run when Clerk user ready
  useEffect(() => {
    if (user) {
      fetchUser();
    } else {
      setIsOwner(false);
      setIsCheckingOwner(false);
    }
  }, [user]);

  // ✅ Initial rooms load
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

        setIsOwner,
        showHotelReg,
        setShowHotelReg,

        searchedCities,
        setSearchedCities,

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
