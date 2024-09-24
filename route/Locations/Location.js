import express from "express";
import {
  getLocationAll,
  getLocationUsers,
  getLocationAllLocation,
  getLocationActiveMember,
} from "../../controller/Location.js";
// import { VerifyToken } from "../../middleware/VerifyToken.js";
const router = express.Router();

router.get("/getAllLocation", getLocationAll);
router.get("/getByLocation", getLocationUsers);
router.get("/getByLocationAll", getLocationAllLocation);
router.get("/getByLocationMembers", getLocationActiveMember);

export default router;
