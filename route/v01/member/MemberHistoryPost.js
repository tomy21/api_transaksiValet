import express from "express";
import {
  getAllMemberPoints,
  getMemberPointById,
  getMemberPointByCardId,
} from "../../../controller/v01/member/MemberHistoryPost.js";

const router = express.Router();

// Get all with pagination and search
router.get("/history-post", getAllMemberPoints);

// Get by ID
router.get("/history-post/:id", getMemberPointById);

// Get by CardId
router.get("/history-post/card/:cardId", getMemberPointByCardId);

export default router;
