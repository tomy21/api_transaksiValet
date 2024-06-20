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
import { updateOutTime } from "./controller/Scheduler.js";
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

const PORT = 3008;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  updateOutTime();
});
