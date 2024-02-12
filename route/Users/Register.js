const express = require("express");
const cors = require("cors");
const router = express.Router();
const bcrypt = require("bcrypt");
const { addYears, format } = require("date-fns");
const connection = require("../../config/dbConfig.js");
const dateTimeCurrent = require("../../config/currentDateTime.js");

router.use(cors());
router.post("/registerUser", async (req, res) => {
  const formatDateNow = dateTimeCurrent("Asia/Jakarta");
  const currentDate = formatDateNow.date_time;
  const roleId = req.body.roleId;
  const ipAdress = req.ip;
  if (ipAdress.includes("::ffff:")) {
    ipv4Address = ipAdress.split(":").pop();
  } else {
    ipv4Address = ipAdress;
  }
  const uniqueId = await connection.generateUniqueTransactionCode();
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
  const IsFirstpassword = 0;
  const MerchantId = 0;

  const nowDate = new Date();
  const expiredPassDate = addYears(nowDate, 1);
  const expiredPass = format(expiredPassDate, "yyyy-MM-dd HH:mm:ss");

  const querySql =
    "INSERT INTO Users (SetupRoleId, IpAddress, UserCode, Name, Gender, Username, Email, HandPhone, Whatsapp, Password, PasswordExpired, IsFirstpassword, MerchantId , CreatedOn, CreatedBy, UpdatedOn, UpdatedBy) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";

  connection.connection.query(
    querySql,
    [
      roleId,
      ipv4Address,
      userCode,
      name,
      gender,
      userName,
      email,
      handphone,
      handphone,
      passwordBcrypt,
      expiredPass,
      IsFirstpassword,
      MerchantId,
      createdOn,
      createdBy,
      updatedOn,
      updatedBy,
    ],
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
          roleId: roleId,
          ipAdress: ipAdress,
          userCode: userCode,
          name: name,
          gender: gender,
          userName: userName,
          email: email,
          handphone: handphone,
          whatsApp: handphone,
          createdOn: createdOn,
          createdBy: createdBy,
          updatedOn: updatedOn,
          updatedBy: updatedBy,
        },
      };

      res.status(200).json(response);
    }
  );
});

module.exports = router;
