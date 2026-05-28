import mongoose from "mongoose";
import mediaModel from "../models/mediaModel.js";

const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send("Media not found");
    }

    const media = await mediaModel.findById(id);

    if (!media) {
      return res.status(404).send("Media not found");
    }

    res.setHeader("Content-Type", media.contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.send(media.data);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Failed to load media");
  }
};

export { getMediaById };
