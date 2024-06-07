import express from "express";
import multer from "multer";
import {
  getDataOverNight,
  importDataExcel,
  validationData,
  getDataOverNightPetugas,
  exportDataOverNight,
  getDataOverNightLocation,
  updateOutAndRemaks,
} from "../../controller/TransactionOverNight.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
const router = express.Router();

const storageExcel = multer.memoryStorage();
const uploadExcel = multer({ storage: storageExcel });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/getAllOverNight", VerifyToken, getDataOverNight);
router.get("/getAllOverNightApps", getDataOverNightPetugas);
router.get("/exportDataOn", exportDataOverNight);
router.get("/getDatabyLocation", getDataOverNightLocation);
router.put("/updateOutAndRemaks", VerifyToken, updateOutAndRemaks);

router.post(
  "/upload/dataOverNight",
  // VerifyToken,
  uploadExcel.single("file"),
  importDataExcel
);
router.post(
  "/upload/imageOfficer",
  VerifyToken,
  upload.single("file"),
  validationData
);

export default router;
