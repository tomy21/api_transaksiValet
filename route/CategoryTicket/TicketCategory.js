import express from "express";
import {
  getAllCategory,
  CategoryDetail,
  addCategory,
  updateCategory,
  softDelete,
} from "../../controller/TicketCategory.js";
// import { VerifyToken } from "../../middleware/VerifyToken.js";
const router = express.Router();

router.get("/categoryTicket", getAllCategory);
router.get("/categoryTicket/:id", CategoryDetail);
router.post("/categoryTicket", addCategory);
router.put("/categoryTicket/:id", updateCategory);
router.put("/categoryDelete/:id", softDelete);

export default router;
