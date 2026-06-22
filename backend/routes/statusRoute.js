import express from "express";
import { getAllStatuses, uploadStatus, markStatusViewed, deleteStatus } from "../controllers/statusController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.route("/upload").post(isAuthenticated, upload.single("image"), uploadStatus);
router.route("/all").get(isAuthenticated, getAllStatuses);
router.route("/view/:id").post(isAuthenticated, markStatusViewed);
router.route("/:id").delete(isAuthenticated, deleteStatus);

export default router;
