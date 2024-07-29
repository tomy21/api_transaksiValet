import express from "express";
import {
  register,
  login,
  logout,
  activateAccount,
  getUserById,
} from "../../../controller/v01/member/AuthController.js";
import { protect } from "../../../middleware/v01/member/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/user/:id", getUserById);
router.get("/activate/:token", activateAccount);

router.get("/protected", protect, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "You have access to this route",
  });
});

export default router;
