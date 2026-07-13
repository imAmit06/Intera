import express from "express";
import { executeCode } from "../controllers/pistonController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/execute", protectRoute, executeCode);

export default router;
