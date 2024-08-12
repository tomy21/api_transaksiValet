import express from "express";
import {
  createPaymentGateway,
  getAllPaymentGateways,
  getPaymentGateway,
  updatePaymentGateway,
  getProviderByisOpen,
} from "../../../controller/v01/member/MemberProvider.js";

const router = express.Router();

router
  .route("/listProvider")
  .post(createPaymentGateway)
  .get(getAllPaymentGateways);

router.route("/listProvider/list").get(getProviderByisOpen);

router
  .route("/listProvider/:id")
  .get(getPaymentGateway)
  .patch(updatePaymentGateway);

export default router;
