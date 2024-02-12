const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const connection = require("../../config/dbConfig.js");
const response = require("../../config/response.js");
const dateTimeCurrent = require("../../config/currentDateTime.js");
const router = express.Router();

router.use(cors());

router.put("/transaction/:id", async (req, res) => {
  const dateCurrent = dateTimeCurrent("Asia/Jakarta");
  const { id } = req.params;
  const PaymentDate = dateCurrent.date_time;
  const PaymentStatus = "PAID";
  try {
    const updateQuery = `UPDATE TransactionParking SET PaymentDate = ?, UpdatedOn = ?, PaymentStatus = ? WHERE Id = ?`;

    connection.connection.query(
      updateQuery,
      [PaymentDate, PaymentDate, PaymentStatus, id],
      (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }

        const selectQuery = `SELECT * FROM TransactionParking WHERE Id = ?`;
        connection.connection.query(selectQuery, [id], (err, data) => {
          if (err) {
            console.error("Error executing query:", err);
            res.status(500).json({ error: "Internal server error" });
            return;
          }
          response(200, data, "Data successfully updated", res);
        });
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
