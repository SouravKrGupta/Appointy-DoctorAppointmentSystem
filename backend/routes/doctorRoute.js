import express from 'express';
import { loginDoctor, appointmentsDoctor, appointmentCancel, doctorList,  appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile, changeAvailability } from '../controllers/doctorController.js';
import authDoctor from '../middlewares/authDoctor.js';
import {
  getChatMessages,
  listChatThreads,
  markChatThreadRead,
  sendChatMessage,
} from '../controllers/chatController.js';
import {
  listNotifications,
  markNotificationsRead,
} from '../controllers/notificationController.js';
import upload from '../middlewares/multer.js';
const doctorRouter = express.Router();

doctorRouter.post("/login", loginDoctor)
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel)
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor)
doctorRouter.get("/list", doctorList)
doctorRouter.post("/change-availability", authDoctor, changeAvailability)
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete)
doctorRouter.get("/dashboard", authDoctor, doctorDashboard)
doctorRouter.get("/profile", authDoctor, doctorProfile)
doctorRouter.post("/update-profile", authDoctor, upload.single('image'), updateDoctorProfile)
doctorRouter.get("/chat/threads", authDoctor, listChatThreads)
doctorRouter.get("/chat/:appointmentId/messages", authDoctor, getChatMessages)
doctorRouter.post("/chat/:appointmentId/messages", authDoctor, sendChatMessage)
doctorRouter.post("/chat/:appointmentId/read", authDoctor, markChatThreadRead)
doctorRouter.get("/notifications", authDoctor, listNotifications)
doctorRouter.post("/notifications/read", authDoctor, markNotificationsRead)

export default doctorRouter;
