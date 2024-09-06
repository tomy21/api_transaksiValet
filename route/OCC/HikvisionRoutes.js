import express from "express";
import {
  captureImage,
  streamVideo,
} from "../../controller/Camera/hikvisionController.js";

const router = express.Router();

// Rute untuk menangkap gambar (capture)
router.get("/hikvision/capture", captureImage);

// Rute untuk memulai streaming video
router.get("/hikvision/stream", streamVideo);

export default router;
