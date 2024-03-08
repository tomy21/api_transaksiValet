const express = require("express");
const http = require("http");
const cors = require("cors");
const router = express.Router();
const verifyToken = require("../../config/auth.js");
const connection = require("../../config/dbConfig.js");
const multer = require("multer");
const dateTimeCurrent = require("../../config/currentDateTime.js");
const exceljs = require("exceljs");

router.get("/report", verifyToken, (req, res) => {
  const locationCode = req.query.LocationCode;
  const queryHourly = `
    SELECT 
        CONCAT(HOUR(CreatedOn), ':00') AS Hour,
        SUM(Tariff) AS TotalTariff,
        COUNT(1) AS TotalTransactions,
        SUM(IF(OutTime IS NULL, TIMESTAMPDIFF(SECOND, CreatedOn, NOW()), 0)) AS TotalPendingOutTime
    FROM 
        TransactionParkingValet
    WHERE 
        LocationCode = ? AND
        DATE(CreatedOn) = CURDATE()
    GROUP BY
        Hour
    ORDER BY
        UpdatedOn DESC    
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
        LocationCode = ? AND
        YEAR(CreatedOn) = YEAR(NOW()) AND
        MONTH(CreatedOn) = MONTH(NOW())   
    GROUP BY
        Day
    ORDER BY
        UpdatedOn DESC    
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
    ORDER BY
        UpdatedOn DESC    
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
    ORDER BY
        UpdatedOn DESC    
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

router.get("/exportExcelDayly", async (req, res) => {
  try {
    const date = req.query.date;
    const locationCode = req.query.locationCode;
    const query = `
          SELECT
              DATE_FORMAT(CreatedOn, '%Y-%m-%d %H:%i:%s') AS DateTime,
              COUNT(CASE WHEN ParkingType = 2 THEN 1 ELSE NULL END) AS QtyReguler,
              COUNT(CASE WHEN ParkingType = 3 THEN 1 ELSE NULL END) AS QtyVVIP,
              COUNT(CASE WHEN ParkingType = 1 THEN 1 ELSE NULL END) AS QtyLT,
              SUM(CASE WHEN ParkingType = 2 THEN Tariff ELSE 0 END) AS IncomeReguler,
              SUM(CASE WHEN ParkingType = 3 THEN Tariff ELSE 0 END) AS IncomeVVIP,
              SUM(CASE WHEN ParkingType = 1 THEN Tariff ELSE 0 END) AS IncomeLT,
              SUM(Tariff) AS TotalIncome
          FROM
              TransactionParkingValet
          WHERE
              DATE(CreatedOn) = ? AND
              LocationCode = ?
          GROUP BY
              DATE_FORMAT(CreatedOn, '%Y-%m-%d %H:%i:%s');
      `;

    connection.connection.query(
      query,
      [date, locationCode],
      async (err, result) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).send("Failed to fetch summary data");
        } else {
          const workbook = new exceljs.Workbook();
          const worksheet = workbook.addWorksheet(date + "_" + locationCode);

          // Tambahkan header
          worksheet.addRow([
            "Date",
            "Qty Reguler",
            "Qty VVIP",
            "Qty LT",
            "Income Reguler",
            "Income VVIP",
            "Income LT",
            "Total Income",
          ]);

          // Tambahkan data
          result.forEach((row) => {
            const data = [
              row.DateTime,
              row.QtyReguler,
              row.QtyVVIP,
              row.QtyLT,
              row.IncomeReguler,
              row.IncomeVVIP,
              row.IncomeLT,
              row.TotalIncome,
            ];
            worksheet.addRow(data);
          });

          // Set header agar dapat diunduh sebagai file Excel
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            "attachment; filename=data.xlsx"
          );

          // Kembalikan file Excel ke client
          await workbook.xlsx.write(res);
          res.end();
        }
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/exportExcelMonthly", async (req, res) => {
  try {
    const date = req.query.date;
    const locationCode = req.query.locationCode;
    const query = `
          SELECT
              DATE_FORMAT(CreatedOn, '%Y-%m-%d %H:%i:%s') AS DateTime,
              COUNT(CASE WHEN ParkingType = 2 THEN 1 ELSE NULL END) AS QtyReguler,
              COUNT(CASE WHEN ParkingType = 3 THEN 1 ELSE NULL END) AS QtyVVIP,
              COUNT(CASE WHEN ParkingType = 1 THEN 1 ELSE NULL END) AS QtyLT,
              SUM(CASE WHEN ParkingType = 2 THEN Tariff ELSE 0 END) AS IncomeReguler,
              SUM(CASE WHEN ParkingType = 3 THEN Tariff ELSE 0 END) AS IncomeVVIP,
              SUM(CASE WHEN ParkingType = 1 THEN Tariff ELSE 0 END) AS IncomeLT,
              SUM(Tariff) AS TotalIncome
          FROM
              TransactionParkingValet
          WHERE
              DATE(CreatedOn) = ? AND
              LocationCode = ?
          GROUP BY
              DATE_FORMAT(CreatedOn, '%Y-%m-%d');
      `;

    connection.connection.query(
      query,
      [date, locationCode],
      async (err, result) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).send("Failed to fetch summary data");
        } else {
          const workbook = new exceljs.Workbook();
          const worksheet = workbook.addWorksheet(date + "_" + locationCode);

          // Tambahkan header
          worksheet.addRow([
            "Date",
            "Qty Reguler",
            "Qty VVIP",
            "Qty LT",
            "Income Reguler",
            "Income VVIP",
            "Income LT",
            "Total Income",
          ]);

          // Tambahkan data
          result.forEach((row) => {
            const data = [
              row.DateTime,
              row.QtyReguler,
              row.QtyVVIP,
              row.QtyLT,
              row.IncomeReguler,
              row.IncomeVVIP,
              row.IncomeLT,
              row.TotalIncome,
            ];
            worksheet.addRow(data);
          });

          // Set header agar dapat diunduh sebagai file Excel
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            "attachment; filename=data.xlsx"
          );

          // Kembalikan file Excel ke client
          await workbook.xlsx.write(res);
          res.end();
        }
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
