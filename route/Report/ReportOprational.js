import express from "express";
import {
  ReportInOut,
  dataDailyDashboard,
  exportExcel,
  dataMonthDashboard,
  dataYearlyDashboard,
} from "../../controller/DataReportInOut.js";
// import { VerifyToken } from "../../middleware/VerifyToken.js";
const router = express.Router();

router.get("/reportOps", ReportInOut);
router.get("/dailyDashboard", dataDailyDashboard);
router.get("/dataMonthDashboard", dataMonthDashboard);
router.get("/dataYearlyDashboard", dataYearlyDashboard);
router.get("/exportdata", exportExcel);

export default router;
