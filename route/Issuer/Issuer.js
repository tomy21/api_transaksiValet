import express from "express";
import { getIssuer } from "../../controller/Issuer.js";
// import { VerifyToken } from "../../middleware/VerifyToken.js";
const router = express.Router();

router.get("/getAllIssuer", getIssuer);

export default router;
