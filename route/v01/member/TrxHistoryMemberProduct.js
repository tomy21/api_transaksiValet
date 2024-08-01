// routes/trxHistoryRoutes.js
import express from "express";
import {
  createTrxHistory,
  getAllTrxHistories,
  // getTrxHistoryById,
  // updateTrxHistory,
  // deleteTrxHistory,
} from "../../../controller/v01/member/TrxHistoryMemberProduct.js";

const router = express.Router();

router.post("/trxhistories", createTrxHistory);
router.get("/trxhistories", getAllTrxHistories);
// router.get("/trxhistories/:id", getTrxHistoryById);
// router.put("/trxhistories/:id", updateTrxHistory);
// router.delete("/trxhistories/:id", deleteTrxHistory);

export default router;
