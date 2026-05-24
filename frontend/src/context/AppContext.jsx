import { createContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { io } from "socket.io-client";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "Rs.";
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [chatThreads, setChatThreads] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [chatRefreshToken, setChatRefreshToken] = useState(0);
  const [appointmentRefreshToken, setAppointmentRefreshToken] = useState(0);
  const socketRef = useRef(null);

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });

      if (data.success) {
        const safeUserData = {
          ...data.userData,
          address: data.userData.address || { line1: "", line2: "" },
          gender: data.userData.gender || "",
          dob: data.userData.dob || "",
        };
        setUserData(safeUserData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const fetchNotifications = async () => {
    if (!token) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }

    try {
      const { data } = await axios.get(backendUrl + "/api/user/notifications", {
        headers: { token },
      });

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadNotificationCount(data.unreadCount);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchChatThreads = async () => {
    if (!token) {
      setChatThreads([]);
      setUnreadChatCount(0);
      return;
    }

    try {
      const { data } = await axios.get(backendUrl + "/api/user/chat/threads", {
        headers: { token },
      });

      if (data.success) {
        setChatThreads(data.threads);
        setUnreadChatCount(
          data.threads.reduce((sum, thread) => sum + thread.unreadCount, 0)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const markNotificationsRead = async (notificationIds = []) => {
    if (!token) {
      return;
    }

    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/notifications/read",
        { notificationIds },
        { headers: { token } }
      );

      if (data.success) {
        setUnreadNotificationCount(data.unreadCount ?? 0);
        setNotifications((prev) =>
          prev.filter(
            (notification) =>
              !(data.deletedNotificationIds || []).includes(notification._id)
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    if (token) {
      loadUserProfileData();
      fetchNotifications();
      fetchChatThreads();
      return;
    }

    setUserData(false);
    setNotifications([]);
    setUnreadNotificationCount(0);
    setChatThreads([]);
    setUnreadChatCount(0);
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchChatThreads();
  }, [token, chatRefreshToken]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = io(backendUrl, {
      auth: {
        role: "user",
        token,
      },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 20));
      setUnreadNotificationCount((prev) => prev + 1);
      toast.info(notification.title);
    });

    socket.on("notification:read", ({ unreadCount, deletedNotificationIds = [] }) => {
      setUnreadNotificationCount(unreadCount ?? 0);
      if (deletedNotificationIds.length) {
        setNotifications((prev) =>
          prev.filter(
            (notification) => !deletedNotificationIds.includes(notification._id)
          )
        );
      }
    });

    socket.on("chat:message:new", () => {
      setChatRefreshToken((prev) => prev + 1);
    });

    socket.on("chat:read", () => {
      setChatRefreshToken((prev) => prev + 1);
    });

    socket.on("appointment:updated", () => {
      setAppointmentRefreshToken((prev) => prev + 1);
      setChatRefreshToken((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [backendUrl, token]);

  const value = {
    doctors,
    getDoctorsData,
    currencySymbol,
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    loadUserProfileData,
    notifications,
    unreadNotificationCount,
    fetchNotifications,
    markNotificationsRead,
    chatThreads,
    unreadChatCount,
    fetchChatThreads,
    socketConnected,
    chatRefreshToken,
    appointmentRefreshToken,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
