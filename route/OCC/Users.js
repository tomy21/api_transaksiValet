import express from "express";
import { login, register, getUserById } from "../../controller/Ccc/Users.js";
import { protectAuth } from "../../middleware/authMidOcc.js";

const router = express.Router();

// Route HTTP untuk Gate
router.post("/login", login);
router.post("/register", register);
router.get("/getUserById", protectAuth, getUserById);

router.get("/protected", protectAuth, (req, res) => {
  const token = req.cookies.refreshToken;
  res.status(200).json({
    statusCode: 200,
    status: "success",
    message: "You have access to this route",
    token: token,
  });
});

export default router;
