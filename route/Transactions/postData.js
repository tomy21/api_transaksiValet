const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const connection = require("../../config/dbConfig.js");
const response = require("../../config/response.js");
const dateTimeCurrent = require("../../config/currentDateTime.js");
const router = express.Router();
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

router.use(cors());

router.post("/transaction", async (req, res) => {
  try {
    const transactionNo = await connection.generateUniqueTransactionCode();
    const dateCurrent = dateTimeCurrent("Asia/Jakarta");
    const noTrx = transactionNo;
    const LocationCode = "007SK";
    const InTime = dateCurrent.date_time;
    const VehicleType = "MOBIL REGULER";
    const Vehicle = "MOBIL";

    // Menggunakan placeholder untuk nilai variabel
    const insertQuery = `INSERT INTO TransactionParking (TransactionNo, ReferenceNo, LocationCode, VehicleType, ProductName, InTime, UpdatedOn) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    // Menjalankan query dengan menggunakan Promise
    connection.connection.query(
      insertQuery,
      [noTrx, noTrx, LocationCode, VehicleType, Vehicle, InTime, InTime],
      (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }

        const selectQuery = `SELECT * FROM skybillingdb.TransactionParking ORDER BY UpdatedOn DESC`;

        connection.connection.query(selectQuery, (err, data) => {
          if (err) {
            console.error("Error executing query:", err);
            res.status(500).json({ error: "Internal server error" });
            return;
          }
          // Kirim kembali data yang telah di-insert
          io.emit("updateData", data);
          response(200, data, "POST data successfully", res);
        });
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
