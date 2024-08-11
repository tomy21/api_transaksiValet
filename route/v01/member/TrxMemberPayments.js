import express from "express";
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "../../../controller/v01/member/TrxMemberPayment.js";

const router = express.Router();

router.route("/payments").get(getAllPayments).post(createPayment);

router
  .route("/payments/:id")
  .get(getPaymentById)
  .patch(updatePayment)
  .delete(deletePayment);

export default router;
