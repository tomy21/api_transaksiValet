import express from "express";
import { getUsers, login, logout, register } from "../../controller/Users.js";
import { VerifyToken } from "../../middleware/VerifyToken.js";
import { refreshToken } from "../../controller/RefreshToken.js";
const router = express.Router();

router.get("/getUsers", VerifyToken, getUsers);
router.post("/register", register);
router.post("/login", login);
router.get("/token", refreshToken);
router.get("/logout", logout);

export default router;
