import express from "express";
import { captureImage } from "../../controller/Camera/integration.js";

const router = express.Router();

router.post("/capture-camera", captureImage);

export default router;
