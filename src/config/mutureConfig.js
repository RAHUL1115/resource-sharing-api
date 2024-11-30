const multer = require("multer");
const path = require("path");
const { v4 } = require("uuid");

const uploadPath = path.join(path.resolve(), "uploads/");

// Set up the storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${v4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Multer configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

module.exports = upload;
