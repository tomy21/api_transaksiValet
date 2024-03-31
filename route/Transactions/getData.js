const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const cryptoJs = require("crypto-js");
const connection = require("../../config/dbConfig.js");
const response = require("../../config/response.js");
const currentDate = require("../../config/formatCurrentDate.js");
const socketIo = require("socket.io");
const router = express.Router();
const server = http.createServer(app);
const io = socketIo(server);

router.use(cors());

const secretKey = currentDate + "PARTNER_KEY";

router.get("/transaction", async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const offset = (page - 1) * limit;

  // Query untuk mendapatkan data dari database
  const sql = `SELECT * FROM skybillingdb.TransactionParking ORDER BY UpdatedOn DESC LIMIT ${limit} OFFSET ${offset}`;
  const countData =
    "SELECT COUNT(TransactionNo) AS totalItems FROM skybillingdb.TransactionParking";
  connection.connection.query(
    sql,
    [parseInt(limit), parseInt(offset)],
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return response(500, result, "Get data failed", res);
      }

      // Menghitung jumlah total item di database
      connection.connection.query(countData, (err, countResult) => {
        if (err) {
          console.error("Error counting total items:", err);
          return response(500, result, "Counting total items failed", res);
        }

        const totalItems = countResult[0].totalItems;

        const nextPage =
          offset + parseInt(limit) < totalItems ? parseInt(page) + 1 : null;

        const encryptedResult = cryptoJs.AES.encrypt(
          JSON.stringify(result),
          secretKey
        ).toString();

        // Membuat metadata untuk paginasi
        const pagination = {
          current_page: page,
          total_row: limit,
          total_items: totalItems,
          next_page: nextPage,
          total_page: Math.ceil(totalItems / 10),
        };

        io.emit("updateData", result);
        return response(
          200,
          encryptedResult,
          "Get data successfully",
          res,
          pagination
        );
      });
    }
  );
});

router.get("/generateKey", async (req, res) => {
  const locationCode = req.query.locationCode;

  try {
    const codeKey = await connection.generateKeyNumber(locationCode);
    res.status(200).json({ codeKey });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
