import express from "express";
import {
  getLocationAll,
  getLocationUsers,
  getLocationAllLocation,
} from "../../controller/Location.js";
// import { VerifyToken } from "../../middleware/VerifyToken.js";
const router = express.Router();

router.get("/getAllLocation", getLocationAll);
router.get("/getByLocation", getLocationUsers);
router.get("/getByLocationAll", getLocationAllLocation);

export default router;
