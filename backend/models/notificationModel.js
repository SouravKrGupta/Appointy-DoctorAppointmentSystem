import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: { type: String, enum: ["user", "doctor", "admin"], required: true },
    recipientId: { type: String, required: true, index: true },
    appointmentId: { type: String, default: "" },
    type: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    actionLink: { type: String, default: "" },
    meta: { type: Object, default: {} },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, minimize: false }
);

const notificationModel =
  mongoose.models.notification || mongoose.model("notification", notificationSchema);

export default notificationModel;
