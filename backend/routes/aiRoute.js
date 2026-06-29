import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { getSuggestions, getSummary, autoComplete } from "../controllers/aiController.js";

const router = express.Router();

router.post("/suggestions", isAuthenticated, getSuggestions);
router.post("/summarize", isAuthenticated, getSummary);
router.post("/complete", isAuthenticated, autoComplete);

export default router;
