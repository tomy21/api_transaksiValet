import express from "express";
import multer from "multer";
import {
  getDataOverNight,
  importDataExcel,
  validationData,
} from "../../controller/TransactionOverNight.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/getAllOverNight", getDataOverNight);
router.post(
  "/upload/dataOverNight",
  VerifyToken,
  upload.single("file"),
  importDataExcel
);
router.post(
  "/upload/imageOfficer",
  VerifyToken,
  upload.single("file"),
  validationData
);

export default router;
