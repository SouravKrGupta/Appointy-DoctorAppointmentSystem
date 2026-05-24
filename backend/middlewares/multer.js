import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaDir = path.join(__dirname, "..", "media");

fs.mkdirSync(mediaDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, mediaDir);
  },
  filename: function (req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    callback(null, uniqueName);
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
    return;
  }

  callback(new Error("Only image uploads are allowed."));
};

const upload = multer({ storage, fileFilter });

export default upload;
