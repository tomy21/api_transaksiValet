const express = require("express");
const cors = require("cors");
const router = express.Router();
const connection = require("../../config/dbConfig.js");
const dateTimeCurrent = require("../../config/currentDateTime.js");

router.use(cors());

router.post("/addRole", (req, res) => {
  const formatDateNow = dateTimeCurrent("Asia/Jakarta");
  const createdOn = formatDateNow.date_time;
  const updateBy = 1;
  const description = req.body.description;

  const sqlQuery =
    "INSERT INTO SetupRole (Description, CreatedOn, CreatedBy, UpdatedOn, UpdatedBy) VALUES (?, ?, ?, ?, ?) ";

  connection.connection.query(
    sqlQuery,
    [description, createdOn, updateBy, createdOn, updateBy],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      const response = {
        code: 200,
        message: "Success register",
        data: {
          description: description,
          Created_at: createdOn,
        },
      };

      res.status(200).json(response);
    }
  );
});

module.exports = router;
