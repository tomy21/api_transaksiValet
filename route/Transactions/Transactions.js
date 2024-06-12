import express from "express";
import {
  getTransaction,
  addTransaction,
  getNumberKyeSlot,
  getTransactionByLocation,
  updatePayment,
  cancelTransaction,
  getTransactionById,
} from "../../controller/TransactionParkingValet.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
const router = express.Router();

router.get("/transaction", getTransaction);
router.get("/getKeySlot", VerifyToken, getNumberKyeSlot);
router.get("/getTransactionByLocation", VerifyToken, getTransactionByLocation);
router.get("/getTransactionById/:id", VerifyToken, getTransactionById);
router.put("/updatePayment/:id", VerifyToken, updatePayment);
router.put("/cancelTransaction/:id", VerifyToken, cancelTransaction);
router.post("/transaction", VerifyToken, addTransaction);

export default router;
