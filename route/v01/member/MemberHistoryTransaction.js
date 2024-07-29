import express from "express";
import {
  createMemberHistoryTransaction,
  getAllMemberHistoryTransactions,
  getMemberHistoryTransaction,
  getHistoryByUserId,
} from "../../../controller/v01/member/MemberHistoryTransaction.js";

const router = express.Router();

router
  .route("/memberHistoryTransactions")
  .post(createMemberHistoryTransaction)
  .get(getAllMemberHistoryTransactions);

router.route("/memberHistoryTransactions/:id").get(getMemberHistoryTransaction);
router.route("/memberHistory/users").get(getHistoryByUserId);

export default router;
