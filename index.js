import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import UsersRoute from "./route/Users/Users.js";
import LocationRoute from "./route/Locations/Location.js";
import IssuerRoute from "./route/Issuer/Issuer.js";
import QrisRoute from "./route/Qris/Qris.js";
import TicketCategory from "./route/CategoryTicket/TicketCategory.js";
import Transactions from "./route/Transactions/Transactions.js";
import ReportOprational from "./route/Report/ReportOprational.js";
import OverNight from "./route/OverNight/transaction.js";
import CountingVihicle from "./route/CountingVihicle/CountingVihicle.js";
import path from "path";
import authRoutes from "./route/v01/member/authRoute.js";
import ProductMemberRoute from "./route/v01/member/ProductMemberRoute.js";
import MemberProvider from "./route/v01/member/MemberProviderRoute.js";
import MemberUserProduct from "./route/v01/member/MemberUserProduct.js";
import MemberHistoryTransaction from "./route/v01/member/MemberHistoryTransaction.js";
import TrxHistoryMemberProduct from "./route/v01/member/TrxHistoryMemberProduct.js";
import MemberProductBundle from "./route/v01/member/MemberProductBundle.js";
import MemberTenants from "./route/v01/member/MemberTenants.js";
import TrxMemberPayment from "./route/v01/member/TrxMemberPayments.js";
import TempMemberTenantTransaction from "./route/v01/member/TempTransactionMemberTenant.js";
import TrxMemberQuote from "./route/v01/member/TrxMemberQuota.js";
// import getReport from "./route/Valet/report.js";
// import connect from "./config/dbConfig";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://147.139.135.195:8091",
      "https://dev-valet.skyparking.online",
      "https://dev-on.skyparking.online",
      "https://dev-membership.skyparking.online",
      "https://dump-membership.vercel.app",
    ],
  })
);

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());
app.use(bodyParser.json());
app.use("/api", UsersRoute);
app.use("/api", LocationRoute);
app.use("/api", IssuerRoute);
app.use("/api", QrisRoute);
app.use("/api", TicketCategory);
app.use("/api", Transactions);
app.use("/api", ReportOprational);
app.use("/api", OverNight);
app.use("/api", CountingVihicle);

// member
app.use("/v01/member/api/auth", authRoutes);
app.use("/v01/member/api", ProductMemberRoute);
app.use("/v01/member/api", MemberProvider);
app.use("/v01/member/api", MemberUserProduct);
app.use("/v01/member/api", MemberHistoryTransaction);
app.use("/v01/member/api", TrxHistoryMemberProduct);
app.use("/v01/member/api", MemberProductBundle);
app.use("/v01/member/api", MemberTenants);
app.use("/v01/member/api", TrxMemberPayment);
app.use("/v01/member/api", TempMemberTenantTransaction);
app.use("/v01/member/api", TrxMemberQuote);

const PORT = 3008;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // updateOutTime();
});
