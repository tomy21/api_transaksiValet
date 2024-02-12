const express = require("express");
const cors = require("cors");
const router = express.Router();
const connection = require("../../config/dbConfig.js");
const dateTimeCurrent = require("../../config/currentDateTime.js");

router.use(cors());

router.use("/users", (req, res) => {
  const queryData =
    "SELECT Users.CreatedOn, Users.UserCode, Users.Name, Users.Username, Users.Email, Users.HandPhone, Users.Photo FROM Users WHERE SetupRoleId = '9' ORDER BY CreatedOn DESC ";

  connection.connection.query(queryData, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const response = {
      code: 200,
      message: "Success add user location",
      data: results,
    };

    res.status(200).json(response);
  });
});

router.post("/addUserLocation", (req, res) => {
  const formatDateNow = dateTimeCurrent("Asia/Jakarta");
  const currentDate = formatDateNow.date_time;
  const updateBy = req.body.createdBy;
  const userId = req.body.UserId;
  const locationCode = req.body.LocationCode;

  const sqlQuery =
    "INSERT INTO UsersLocation (UserId, LocationCode,CreatedOn, CreatedBy, UpdatedOn) VALUES (?, ?, ?, ?, ?) ";

  connection.connection.query(
    sqlQuery,
    [userId, locationCode, currentDate, updateBy, currentDate],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      const response = {
        code: 200,
        message: "Success add user location",
        data: {
          userId: userId,
          LocationCode: locationCode,
        },
      };

      res.status(200).json(response);
    }
  );
});

module.exports = router;
