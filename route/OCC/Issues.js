import express from "express";
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from "../../controller/Ccc/Issues.js";

const router = express.Router();

router.post("/issues", createIssue); // Create Issue
router.get("/issues", getAllIssues); // Get All Issues
router.get("/issues/:id", getIssueById); // Get Issue by ID
router.put("/issues/:id", updateIssue); // Update Issue by ID
router.delete("/issues/:id", deleteIssue); // Delete Issue by ID

export default router;
