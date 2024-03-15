const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto-js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const connection = require("../../config/dbConfig.js");
const currentdate = require("../../config/formatCurrentDate.js");
const dateTimeCurrent = require("../../config/currentDateTime.js");
const app = express();
const SECRET_KEY = "skyparking12345";

router.use(bodyParser.json());
router.use(cors());
const secretKey = "PARTNER_KEY";
// const secretKey = currentdate + "PARTNER_KEY";

// Route untuk login
router.post("/login", (req, res) => {
  const encryptedData = req.body.data;
  const decryptedResult = crypto.AES.decrypt(encryptedData, secretKey).toString(
    crypto.enc.Utf8
  );
  const dateCurrent = dateTimeCurrent("Asia/Jakarta");
  const lastUpdated = dateCurrent.date_time;
  const decryptedObject = JSON.parse(decryptedResult);
  const email = decryptedObject.email;
  const password = decryptedObject.password;

  try {
    const findUser = `
    SELECT  
        U.id, 
        U.SetupRoleId, 
        U.Email, 
        U.Password, 
        U.Username, 
        U.Photo, 
        U.HandPhone,
        RL.Name,
        UL.LocationCode,
        UL.typeValet,
        UL.qrisVVIP,
        UL.qrisCasualValet,
        UL.tariffVVIP,
        UL.tariffCasualValet,
        UL.NMIDVIP,
        UL.NameRekVIP,
        UL.NMIDValet,
        UL.NameRekValet,
        COUNT(CASE WHEN DATE(TPV.InTime) = CURDATE() THEN 1 END) AS CountInTime,
        COUNT(CASE WHEN DATE(TPV.OutTime) = CURDATE() THEN 1 END) AS CountOutTime
    FROM 
        Users U
    JOIN 
        UsersLocation UL ON U.id = UL.UserId
    JOIN 
        RefLocation RL ON UL.LocationCode = RL.Code
    LEFT JOIN
        TransactionParkingValet TPV ON UL.LocationCode = TPV.LocationCode    
    WHERE Email = ?`;

    connection.connection.query(findUser, [email], async (err, results) => {
      try {
        if (err) {
          console.error(err);
          return res.status(500).send("Error retrieving user data");
        }

        if (results.length === 0) {
          return res.status(400).send("Invalid email or password");
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.Password);
        if (!isPasswordValid) {
          return res.status(400).send("Invalid username or password");
        }

        // Buat token JWT
        const token = jwt.sign(
          { id: user.id, username: user.Username },
          SECRET_KEY
        );

        const keyAES = "PARTNER_KEY";
        // const keyAES = currentdate + "PARTNER_KEY";

        const data = user;

        const encryptedResult = crypto.AES.encrypt(
          JSON.stringify(data),
          keyAES
        ).toString();

        const query = `
        UPDATE 
          Users 
        SET 
          LastActivity = ? 
        WHERE 
          Id = ? 
        `;
        connection.connection.query(
          query,
          [lastUpdated, user.id],
          async (err, results) => {
            if (err) {
              console.error(err);
              return res.status(500).send("Error retrieving user data");
            }

            const response = {
              code: 200,
              message: "Success Login",
              token: token,
              data: encryptedResult,
            };
            res.status(200).json(response);
          }
        );
      } catch (err) {
        console.error(err);
        res.status(500).send("Error logging in");
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

module.exports = router;
