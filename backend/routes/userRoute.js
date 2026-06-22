import express from "express";
import { getOtherUsers, login, logout, register, updateProfile, resetPassword } from "../controllers/userController.js";
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

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/reset-password").post(resetPassword);
router.route("/").get(isAuthenticated, getOtherUsers);
router.route("/update-profile").post(isAuthenticated, upload.single("profilePhoto"), updateProfile);

export default router;