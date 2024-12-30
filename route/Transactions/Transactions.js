import express from "express";
import {
  getTransaction,
  addTransaction,
  getNumberKyeSlot,
  getTransactionByLocation,
  updatePayment,
  cancelTransaction,
  getTransactionById,
  getTransaskiHistory,
} from "../../controller/TransactionParkingValet.js";
import { protectAuth } from "../../middleware/authMidOcc.js";
const router = express.Router();

router.get("/transaction", getTransaction);
router.get("/getKeySlot", protectAuth, getNumberKyeSlot);
router.get("/getTransactionByLocation", getTransactionByLocation);
router.get("/getTransactionHistory", getTransaskiHistory);
router.get("/getTransactionById/:id", getTransactionById);
router.put("/updatePayment/:id", updatePayment);
router.put("/cancelTransaction/:id", cancelTransaction);
router.post("/transaction", addTransaction);

export default router;
