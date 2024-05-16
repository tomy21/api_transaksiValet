import express from "express";
import { getLocationAll } from "../../controller/Location.js";
// import { VerifyToken } from "../../middleware/VerifyToken.js";
const router = express.Router();

router.get("/getAllLocation", getLocationAll);

export default router;
