import express from "express";
import { getAllData, storeGateIn } from "../../controller/CountingVihicle.js";
// import { VerifyToken } from "../../middleware/VerifyToken.js";
const router = express.Router();

router.get("/getAllData", getAllData);
router.post("/addData", storeGateIn);

export default router;
