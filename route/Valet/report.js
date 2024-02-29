const express = require("express");
const http = require("http");
const cors = require("cors");
const router = express.Router();
const verifyToken = require("../../config/auth.js");
const connection = require("../../config/dbConfig.js");
const multer = require("multer");
const dateTimeCurrent = require("../../config/currentDateTime.js");

router.get("/report", verifyToken, (req, res) => {
  const locationCode = req.query.LocationCode;
  const queryHourly = `
    SELECT 
        HOUR(CreatedOn) AS Hour,
        SUM(Tariff) AS TotalTariff,
        COUNT(1) AS TotalTransactions,
        SUM(IF(OutTime IS NULL, TIMESTAMPDIFF(SECOND, CreatedOn, NOW()), 0)) AS TotalPendingOutTime
    FROM 
        TransactionParkingValet
    WHERE 
        LocationCode = ? 
    GROUP BY
        Hour
    `;
  const queryDayly = `
    SELECT 
        DATE(CreatedOn) AS Day,
        SUM(Tariff) AS TotalTariff,
        COUNT(1) AS TotalTransactions,
        SUM(IF(OutTime IS NULL, TIMESTAMPDIFF(SECOND, CreatedOn, NOW()), 0)) AS TotalPendingOutTime
    FROM 
        TransactionParkingValet
    WHERE 
        LocationCode = ?     
    GROUP BY
        Day
    `;

  const queryMonthly = `
    SELECT 
        YEAR(CreatedOn) AS Year,
        MONTH(CreatedOn) AS Month,
        SUM(Tariff) AS TotalTariff,
        COUNT(*) AS TotalTransactions,
        SUM(IF(OutTime IS NULL, TIMESTAMPDIFF(SECOND, CreatedOn, NOW()), 0)) AS TotalPendingOutTime
    FROM 
        TransactionParkingValet
    WHERE 
        LocationCode = ? 
    GROUP BY
        Year, Month
    `;

  const queryYearly = `
    SELECT 
        YEAR(CreatedOn) AS Year,
        SUM(Tariff) AS TotalTariff,
        COUNT(*) AS TotalTransactions,
        SUM(IF(OutTime IS NULL, TIMESTAMPDIFF(SECOND, CreatedOn, NOW()), 0)) AS TotalPendingOutTime
    FROM 
        TransactionParkingValet
    WHERE 
        LocationCode = ? 
    GROUP BY
        Year
    `;

  connection.connection.query(queryHourly, [locationCode], (err, resHourly) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    } else {
      connection.connection.query(
        queryDayly,
        [locationCode],
        (err, resDayly) => {
          if (err) {
            console.error(err);
            res.status(500).send("Internal server error");
          } else {
            connection.connection.query(
              queryMonthly,
              [locationCode],
              (err, resMonthly) => {
                if (err) {
                  console.error(err);
                  res.status(500).send("Internal server error");
                } else {
                  connection.connection.query(
                    queryYearly,
                    [locationCode],
                    (err, resYearly) => {
                      if (err) {
                        console.error(err);
                        res.status(500).send("Internal server error");
                      } else {
                        const response = {
                          code: 200,
                          message: "Success Get Report",
                          hourly: resHourly,
                          dayly: resDayly,
                          monthly: resMonthly,
                          yearly: resYearly,
                        };
                        res.status(200).json(response);
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  });
});

module.exports = router;
