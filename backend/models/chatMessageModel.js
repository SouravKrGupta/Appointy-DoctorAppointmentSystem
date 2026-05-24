import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    docId: { type: String, required: true, index: true },
    senderRole: { type: String, enum: ["user", "doctor"], required: true },
    senderId: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    readByUser: { type: Boolean, default: false },
    readByDoctor: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const chatMessageModel =
  mongoose.models.chatMessage || mongoose.model("chatMessage", chatMessageSchema);

export default chatMessageModel;
