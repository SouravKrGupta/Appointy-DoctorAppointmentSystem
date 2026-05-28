import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, default: "" },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

const mediaModel = mongoose.models.media || mongoose.model("media", mediaSchema);

export default mediaModel;
