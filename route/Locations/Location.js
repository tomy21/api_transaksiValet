const express = require("express");
const cors = require("cors");
const connection = require("../../config/dbConfig.js");
const router = express.Router();

// Menerapkan CORS di level router
router.use(cors());

router.get("/location", async (req, res) => {
  const query = "SELECT RefLocation.Code, RefLocation.Name FROM RefLocation";

  connection.connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ message: "Get data failed", error: err });
    }

    const response = {
      statusCode: 200,
      message: "success get locations",
      data: results,
    };
    return res.status(200).json(response);
  });
});

module.exports = router;
