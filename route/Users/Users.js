import express from "express";
import {
  getUsers,
  login,
  logout,
  register,
  getUsersById,
} from "../../controller/Users.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
import { refreshToken } from "../../controller/RefreshToken.js";
import { protectAuth } from "../../middleware/authMidOcc.js";
const router = express.Router();

router.get("/getUsers", VerifyToken, getUsers);
router.get("/getUsersById", protectAuth, getUsersById);
router.post("/register", register);
router.post("/login", login);
router.get("/token", refreshToken);
router.get("/logout", logout);

router.get("/protected", protectAuth, (req, res) => {
  const token = req.cookies.refreshToken;
  console.log(token);
  res.status(200).json({
    status: "success",
    message: "You have access to this route",
    token: token,
  });
});

export default router;
