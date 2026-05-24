import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay } from '../controllers/userController.js';
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
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.get("/get-profile", authUser, getProfile)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.post("/book-appointment", authUser, bookAppointment)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)
userRouter.post("/payment-razorpay", authUser, paymentRazorpay)
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay)
userRouter.get("/chat/threads", authUser, listChatThreads)
userRouter.get("/chat/:appointmentId/messages", authUser, getChatMessages)
userRouter.post("/chat/:appointmentId/messages", authUser, sendChatMessage)
userRouter.post("/chat/:appointmentId/read", authUser, markChatThreadRead)
userRouter.get("/notifications", authUser, listNotifications)
userRouter.post("/notifications/read", authUser, markNotificationsRead)


 




export default userRouter;
