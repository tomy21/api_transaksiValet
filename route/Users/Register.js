const express = require("express");
const cors = require("cors");
const router = express.Router();
const bcrypt = require("bcrypt");
const { addYears, format } = require("date-fns");
const connection = require("../../config/dbConfig.js");
const dateTimeCurrent = require("../../config/currentDateTime.js");

router.use(cors());
router.post("/registerUser", async (req, res) => {
  try {
    const formatDateNow = dateTimeCurrent("Asia/Jakarta");
    const currentDate = formatDateNow.date_time;
    const roleId = req.body.roleId;
    const ipAddress = req.ip.includes("::ffff:")
      ? req.ip.split(":").pop()
      : req.ip;
    const locationCode = req.body.locationCode;
    const uniqueId = await connection.generateUniqueTransactionCode(
      locationCode
    );
    const userCode = "USVAL" + uniqueId;
    const name = req.body.name;
    const gender = req.body.gender;
    const userName = req.body.userName;
    const email = req.body.email;
    const handphone = req.body.handphone;
    const password = "sky123";
    const passwordBcrypt = await bcrypt.hash(password, 10);
    const createdOn = currentDate;
    const createdBy = "admin";
    const updatedOn = currentDate;
    const updatedBy = "admin";
    const isFirstPassword = 0;
    const merchantId = 0;

    const nowDate = new Date();
    const expiredPassDate = addYears(nowDate, 1);
    const expiredPass = format(expiredPassDate, "yyyy-MM-dd HH:mm:ss");

    const insertUserQuery =
      "INSERT INTO Users (SetupRoleId, IpAddress, UserCode, Name, Gender, Username, Email, HandPhone, Whatsapp, Password, PasswordExpired, IsFirstpassword, MerchantId , CreatedOn, CreatedBy, UpdatedOn, UpdatedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const insertUserLocationQuery =
      "INSERT INTO UsersLocation (UserId, LocationCode, CreatedBy, UpdatedOn, UpdatedBy) VALUES (?, ?, ?, ?, ?)";

    connection.connection.query(
      insertUserQuery,
      [
        roleId,
        ipAddress,
        userCode,
        name,
        gender,
        userName,
        email,
        handphone,
        handphone,
        passwordBcrypt,
        expiredPass,
        isFirstPassword,
        merchantId,
        createdOn,
        createdBy,
        updatedOn,
        updatedBy,
      ],
      (err, results) => {
        if (err) {
          console.error("Error inserting user:", err);
          return res.status(500).json({ error: "Failed to insert user" });
        }

        const newUserId = results.insertId;

        connection.connection.query(
          insertUserLocationQuery,
          [newUserId, locationCode, createdBy, updatedOn, updatedBy],
          (err, result) => {
            if (err) {
              console.error("Error inserting user location:", err);
              return res
                .status(500)
                .json({ error: "Failed to insert user location" });
            }

            const response = {
              code: 200,
              message: "Success add user location",
              data: {
                id: newUserId,
                roleId,
                ipAddress,
                locationCode,
                userCode,
                name,
                gender,
                userName,
                email,
                handphone,
                whatsApp: handphone,
                createdOn,
                createdBy,
                updatedOn,
                updatedBy,
              },
            };
            res.status(200).json(response);
          }
        );
      }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
