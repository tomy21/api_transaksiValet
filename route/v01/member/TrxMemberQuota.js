// routes/v01/member/TrxMemberQuota.js
import express from "express";
import {
  getAllQuotes,
  createQuote,
  getQuoteById,
  updateQuote,
  deleteQuote,
} from "../../../controller/v01/member/TrxMemberQuota.js";

const router = express.Router();

// Route untuk mendapatkan semua data atau membuat data baru
router.route("/quota").get(getAllQuotes).post(createQuote);

// Route untuk mendapatkan, memperbarui, atau menghapus data berdasarkan ID
router
  .route("/quota/:id")
  .get(getQuoteById)
  .put(updateQuote)
  .delete(deleteQuote);

export default router;
