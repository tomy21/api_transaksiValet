import express from "express";
import { captureImage } from "../../controller/Camera/integration.js";
import { getLocations } from "../../controller/Ccc/index.js";

const router = express.Router();

router.post("/capture-camera", captureImage);
router.get("/getLocation", getLocations);

export default router;
