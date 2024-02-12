const express = require("express");
const router = express.Router();
const verifyToken = require("../../config/auth.js");
const connection = require("../../config/dbConfig.js");

// Endpoint untuk mendapatkan transaksi berdasarkan codeLocations
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

module.exports = router;
