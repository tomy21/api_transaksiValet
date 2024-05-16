import express from "express";
import {
  getQrisAll,
  QrisDetail,
  addQris,
  updatedQris,
  softDelete,
} from "../../controller/QrisLocation.js";
// import { VerifyToken } from "../../middleware/VerifyToken.js";
const router = express.Router();

router.get("/qris", getQrisAll);
router.get("/qris/:id", QrisDetail);
router.post("/qris", addQris);
router.put("/qris/:id", updatedQris);
router.put("/qrisDelete/:id", softDelete);

export default router;
