import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // save to uploads folder
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)), // unique filename
});

export const upload = multer({ storage });
