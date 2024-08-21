import express from "express";
import { getMemberMasterData } from "../../../controller/v01/member/MemberMaster.js";

const router = express.Router();

router.get("/member-master-data", getMemberMasterData);

export default router;
