import express from "express";
import {
  createMemberProductBundle,
  getAllMemberProductBundles,
  getMemberProductBundle,
  updateMemberProductBundle,
  deleteMemberProductBundle,
  getProductByType,
} from "../../../controller/v01/member/MemberProductBundle.js";

const router = express.Router();

router
  .route("/memberProductBundles")
  .post(createMemberProductBundle)
  .get(getAllMemberProductBundles);
router.get("/products/type/:vehicleType", getProductByType);
router
  .route("/memberProductBundles/:id")
  .get(getMemberProductBundle)
  .put(updateMemberProductBundle)
  .delete(deleteMemberProductBundle);

export default router;
