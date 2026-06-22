import express from "express";
import { getMessage, sendMessage, markMessagesAsRead, deleteMessages } from "../controllers/messageController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import multer from "multer";
import path from "path";
import os from "os";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir())
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.route("/send/:id").post(isAuthenticated, upload.single("image"), sendMessage);
router.route("/:id").get(isAuthenticated, getMessage);
router.route("/mark-read/:id").post(isAuthenticated, markMessagesAsRead);
router.route("/delete").post(isAuthenticated, deleteMessages);

export default router;