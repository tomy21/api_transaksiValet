const express = require("express");
const router = express.Router();
const verifyToken = require("../../config/auth.js");
const connection = require("../../config/dbConfig.js");
const multer = require("multer");
const dateTimeCurrent = require("../../config/currentDateTime.js");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/transactions/:codeLocations", verifyToken, (req, res) => {
  const codeLocations = req.params.codeLocations;
  const query = `
    SELECT 
        TransactionParkingValet.Id,
        TransactionParkingValet.LocationCode,
        TransactionParkingValet.TrxNo,
        TransactionParkingValet.TicketNumber,
        TransactionParkingValet.VehiclePlate,
        TransactionParkingValet.InTime,
        TransactionParkingValet.OutTime,
        TransactionParkingValet.ReceivedOn,
        TransactionParkingValet.ReceivedBy,
        TransactionParkingValet.ReqPickupOn,
        TransactionParkingValet.ConfirmReqPickupOn,
        TransactionParkingValet.ConfirmReqPickupUserId,
        TransactionParkingValet.CreatedBy,
        TransactionParkingValet.ArrivedTimeStart,
        TransactionParkingValet.ArrivedTimeFinish
    FROM 
        TransactionParkingValet
    WHERE 
        LocationCode = ?
        AND DATE(CreatedOn) = CURDATE()
    ORDER BY 
        UpdatedOn 
    DESC`;

  connection.connection.query(query, [codeLocations], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    } else {
      const response = {
        code: 200,
        message: "Success Login",
        data: results,
      };
      res.status(200).json(response);
    }
  });
});

router.post(
  "/transactions",
  verifyToken,
  upload.fields([
    { name: "foto1" },
    { name: "foto2" },
    { name: "foto3" },
    { name: "foto4" },
    { name: "foto5" },
    { name: "foto6" },
    { name: "foto7" },
    { name: "foto8" },
    { name: "foto9" },
    { name: "foto10" },
    { name: "foto11" },
    { name: "foto12" },
  ]),
  async (req, res) => {
    // Urutan parameter req dan res
    try {
      const dateCurrent = dateTimeCurrent("Asia/Jakarta");
      const LocationCode = req.body.LocationCode || null;
      const TrxNo = await connection.generateUniqueTransactionCodeValet();
      const TicketNumber = req.body.TicketNumber || null;
      const ParkingValetStatusId = 4;
      const ParkingType = 2;
      const Tariff = 25000;
      const InTime = dateCurrent.date_time;
      const ReceivedOn = dateCurrent.date_time;
      const ReceivedBy = 1;
      const ReceivedUserId = req.body.ReceivedUserId || null;
      const CreatedOn = dateCurrent.date_time;
      const UpdatedOn = dateCurrent.date_time;
      const CreatedBy = req.body.CreatedBy || null;
      let VehiclePlate = null;
      const photoPaths = [];

      for (let i = 1; i <= 12; i++) {
        const fieldName = "foto" + i;
        if (req.files[fieldName] && req.files[fieldName].length > 0) {
          photoPaths.push(req.files[fieldName][0].path);
        } else {
          photoPaths.push(null); // Jika foto tidak ada, masukkan null ke dalam array
        }
      }

      if (req.files["foto1"] && req.files["foto1"].length > 0) {
        const imageData = req.files["foto1"][0].path;
        // const imagePath = imageData.path; // Mendapatkan path dari gambar yang diunggah
        const url = "https://api.platerecognizer.com/v1/plate-reader/";
        const apiKey = "2ee83fb34e74d1bd32772ac11129862e8f8161e1";
        const formData = new FormData();
        formData.append("upload", fs.createReadStream(imageData));

        try {
          const response = await axios.post(url, formData, {
            headers: {
              Authorization: `Token ${apiKey}`,
              ...formData.getHeaders(),
            },
          });

          if (response.data.results && response.data.results.length > 0) {
            // Jika plat nomor terdeteksi, gunakan hasilnya
            VehiclePlate = response.data.results[0].plate.toUpperCase();
          }
        } catch (error) {
          console.error("Error recognizing plate:", error);
        }
      }
      // console.log(VehiclePlate);
      const query = `
      INSERT INTO
        TransactionParkingValet
      (
        LocationCode,
        TrxNo,
        TicketNumber,
        VehiclePlate,
        ParkingValetStatusId,
        ParkingType,
        Tariff,
        InTime,
        ReceivedOn,
        ReceivedBy,
        ReceivedUserId,
        CreatedOn,
        UpdatedOn,
        CreatedBy,
        foto1,
        foto2,
        foto3,
        foto4,
        foto5,
        foto6,
        foto7,
        foto8,
        foto9,
        foto10,
        foto11,
        foto12
      ) VALUES
      (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`; // Perbaikan penulisan kolom foto

      connection.connection.query(
        query,
        [
          LocationCode,
          TrxNo,
          TicketNumber,
          VehiclePlate,
          ParkingValetStatusId,
          ParkingType,
          Tariff,
          InTime,
          ReceivedOn,
          ReceivedBy,
          ReceivedUserId,
          CreatedOn,
          UpdatedOn,
          CreatedBy,
          ...photoPaths,
        ],
        (err, result) => {
          // Ubah 'res' menjadi 'result' untuk menghindari kebingungan
          if (err) {
            console.error("Error executing query:", err);
            res.status(500).json({ error: "Internal server error" });
            return;
          }

          const response = {
            statusCode: 200,
            message: "success",
          };

          res.status(200).json(response);
        }
      );
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
