import express from "express";
import {
  createMemberProductBundle,
  getAllMemberProductBundles,
  getMemberProductBundle,
  updateMemberProductBundle,
  deleteMemberProductBundle,
  getProductByType,
  getProductByIdProduct,
} from "../../../controller/v01/member/MemberProductBundle.js";

const router = express.Router();

router
  .route("/memberProductBundles")
  .post(createMemberProductBundle)
  .get(getAllMemberProductBundles);
router.get("/products/type/:vehicleType", getProductByType);
router.route("/product/getByProductId/:id").get(getProductByIdProduct);
router
  .route("/memberProductBundles/:id")
  .get(getMemberProductBundle)
  .put(updateMemberProductBundle);

router.route("/memberProductBundles/delete/:id").put(deleteMemberProductBundle);

export default router;
