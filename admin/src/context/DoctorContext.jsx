import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [profileData, setProfileData] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [chatThreads, setChatThreads] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [chatRefreshToken, setChatRefreshToken] = useState(0);
  const [appointmentRefreshToken, setAppointmentRefreshToken] = useState(0);
  const socketRef = useRef(null);

  const authHeader = {
    headers: {
      Authorization: `Bearer ${dToken}`,
    },
  };

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/appointments",
        authHeader
      );

      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/complete-appointment",
        { appointmentId },
        authHeader
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/cancel-appointment",
        { appointmentId },
        authHeader
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/dashboard",
        authHeader
      );

      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/profile",
        authHeader
      );

      if (data.success) {
        setProfileData(data.profileData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const fetchNotifications = async () => {
    if (!dToken) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }

    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/notifications",
        authHeader
      );

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadNotificationCount(data.unreadCount);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchChatThreads = async () => {
    if (!dToken) {
      setChatThreads([]);
      setUnreadChatCount(0);
      return;
    }

    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/chat/threads",
        authHeader
      );

      if (data.success) {
        setChatThreads(data.threads);
        setUnreadChatCount(
          data.threads.reduce((sum, thread) => sum + thread.unreadCount, 0)
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markNotificationsRead = async (notificationIds = []) => {
    if (!dToken) {
      return;
    }

    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/notifications/read",
        { notificationIds },
        authHeader
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
      console.error(error);
    }
  };

  useEffect(() => {
    if (dToken) {
      fetchNotifications();
      fetchChatThreads();
      return;
    }

    setAppointments([]);
    setDashData(false);
    setProfileData(false);
    setNotifications([]);
    setUnreadNotificationCount(0);
    setChatThreads([]);
    setUnreadChatCount(0);
  }, [dToken]);

  useEffect(() => {
    if (!dToken) {
      return;
    }

    fetchChatThreads();
  }, [chatRefreshToken, dToken]);

  useEffect(() => {
    if (!dToken) {
      return;
    }

    const socket = io(backendUrl, {
      auth: {
        role: "doctor",
        token: dToken,
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
  }, [backendUrl, dToken]);

  const value = {
    dToken,
    setDToken,
    backendUrl,
    getAppointments,
    appointments,
    setAppointments,
    completeAppointment,
    cancelAppointment,
    getDashData,
    dashData,
    setDashData,
    getProfileData,
    setProfileData,
    profileData,
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
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
