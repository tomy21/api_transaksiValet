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

router.get("/exportDailyData", async (req, res) => {
  try {
    let startDate =
      req.query.startDate || new Date().toISOString().split("T")[0];
    let endDate = req.query.endDate || startDate;
    const locationCode = req.query.locationCode;

    let query;
    let queryParams;

    if (!locationCode) {
      // Jika locationCode tidak diberikan, ambil semua data tanpa klausa WHERE
      query = `
        SELECT
            DATE_FORMAT(TransactionParkingValet.CreatedOn, '%Y-%m-%d %H:%i:%s') AS DateTime,
            VehiclePlate,
            RefLocation.Name,
            DATE_FORMAT(TransactionParkingValet.InTime, '%Y-%m-%d %H:%i:%s') AS InTime,
            DATE_FORMAT(TransactionParkingValet.OutTime, '%Y-%m-%d %H:%i:%s') AS OutTime,
            CONCAT(
              FLOOR(TIMESTAMPDIFF(MINUTE, TransactionParkingValet.InTime, TransactionParkingValet.OutTime) / 60), ' jam ',
              TIMESTAMPDIFF(MINUTE, TransactionParkingValet.InTime, TransactionParkingValet.OutTime) % 60, ' menit'
            ) AS Duration,
            (COUNT(CASE WHEN ParkingType = '1' THEN TrxNo END) + COUNT(CASE WHEN ParkingType = '2' THEN TrxNo END)) AS QtyReguler,
            COUNT(CASE WHEN ParkingType = 3 THEN 1 ELSE NULL END) AS QtyVVIP,
            COUNT(CASE WHEN ParkingType = 4 THEN 1 ELSE NULL END) AS QtyLT,
            (SUM(CASE WHEN ParkingType = 1 THEN Tariff ELSE 0 END)+ SUM(CASE WHEN ParkingType = 2 THEN Tariff ELSE 0 END)) AS IncomeReguler,
            SUM(CASE WHEN ParkingType = 3 THEN Tariff ELSE 0 END) AS IncomeVVIP,
            SUM(CASE WHEN ParkingType = 4 THEN Tariff ELSE 0 END) AS IncomeLT,
            SUM(Tariff) AS TotalIncome
        FROM
            TransactionParkingValet
        JOIN
            RefLocation ON TransactionParkingValet.LocationCode = RefLocation.Code    
        WHERE
            DATE(TransactionParkingValet.CreatedOn) BETWEEN ? AND ?
        GROUP BY
            DATE_FORMAT(TransactionParkingValet.CreatedOn, '%Y-%m-%d %H:%i:%s');
      `;
      queryParams = [startDate, endDate];
    } else {
      // Jika locationCode diberikan, tambahkan klausa WHERE untuk LocationCode
      query = `
        SELECT
            DATE_FORMAT(TransactionParkingValet.CreatedOn, '%Y-%m-%d %H:%i:%s') AS DateTime,
            VehiclePlate,
            RefLocation.Name,
            (COUNT(CASE WHEN ParkingType = '1' THEN TrxNo END) + COUNT(CASE WHEN ParkingType = '2' THEN TrxNo END)) AS QtyReguler,
            COUNT(CASE WHEN ParkingType = 3 THEN 1 ELSE NULL END) AS QtyVVIP,
            COUNT(CASE WHEN ParkingType = 4 THEN 1 ELSE NULL END) AS QtyLT,
            (SUM(CASE WHEN ParkingType = 1 THEN Tariff ELSE 0 END)+ SUM(CASE WHEN ParkingType = 2 THEN Tariff ELSE 0 END)) AS IncomeReguler,
            SUM(CASE WHEN ParkingType = 3 THEN Tariff ELSE 0 END) AS IncomeVVIP,
            SUM(CASE WHEN ParkingType = 4 THEN Tariff ELSE 0 END) AS IncomeLT,
            SUM(Tariff) AS TotalIncome
        FROM
            TransactionParkingValet
        JOIN
            RefLocation ON TransactionParkingValet.LocationCode = RefLocation.Code    
        WHERE
            DATE(TransactionParkingValet.CreatedOn) BETWEEN ? AND ? AND LocationCode = ?
        GROUP BY
            DATE_FORMAT(TransactionParkingValet.CreatedOn, '%Y-%m-%d %H:%i:%s');
      `;
      queryParams = [startDate, endDate, locationCode];
    }

    connection.connection.query(query, queryParams, (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Failed to fetch summary data" });
      } else {
        res.json(result);
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.get("/exportExcelMonthly", async (req, res) => {
//   try {
//     const date = req.query.date;
//     const locationCode = req.query.locationCode;
//     const query = `
//           SELECT
//               DATE_FORMAT(CreatedOn, '%Y-%m-%d %H:%i:%s') AS DateTime,
//               COUNT(CASE WHEN ParkingType = 2 THEN 1 ELSE NULL END) AS QtyReguler,
//               COUNT(CASE WHEN ParkingType = 3 THEN 1 ELSE NULL END) AS QtyVVIP,
//               COUNT(CASE WHEN ParkingType = 1 THEN 1 ELSE NULL END) AS QtyLT,
//               SUM(CASE WHEN ParkingType = 2 THEN Tariff ELSE 0 END) AS IncomeReguler,
//               SUM(CASE WHEN ParkingType = 3 THEN Tariff ELSE 0 END) AS IncomeVVIP,
//               SUM(CASE WHEN ParkingType = 1 THEN Tariff ELSE 0 END) AS IncomeLT,
//               SUM(Tariff) AS TotalIncome
//           FROM
//               TransactionParkingValet
//           WHERE
//               DATE(CreatedOn) = ? AND
//               LocationCode = ?
//           GROUP BY
//               DATE_FORMAT(CreatedOn, '%Y-%m-%d');
//       `;

//     connection.connection.query(
//       query,
//       [date, locationCode],
//       async (err, result) => {
//         if (err) {
//           console.error("Error executing query:", err);
//           res.status(500).send("Failed to fetch summary data");
//         } else {
//           const workbook = new exceljs.Workbook();
//           const worksheet = workbook.addWorksheet(date + "_" + locationCode);

//           // Tambahkan header
//           worksheet.addRow([
//             "Date",
//             "Qty Reguler",
//             "Qty VVIP",
//             "Qty LT",
//             "Income Reguler",
//             "Income VVIP",
//             "Income LT",
//             "Total Income",
//           ]);

//           // Tambahkan data
//           result.forEach((row) => {
//             const data = [
//               row.DateTime,
//               row.QtyReguler,
//               row.QtyVVIP,
//               row.QtyLT,
//               row.IncomeReguler,
//               row.IncomeVVIP,
//               row.IncomeLT,
//               row.TotalIncome,
//             ];
//             worksheet.addRow(data);
//           });

//           // Set header agar dapat diunduh sebagai file Excel
//           res.setHeader(
//             "Content-Type",
//             "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//           );
//           res.setHeader(
//             "Content-Disposition",
//             "attachment; filename=data.xlsx"
//           );

//           // Kembalikan file Excel ke client
//           await workbook.xlsx.write(res);
//           res.end();
//         }
//       }
//     );
//   } catch (e) {
//     console.error(e);
//     res.status(500).send("Internal Server Error");
//   }
// });

router.get("/hourlyreport", async (req, res) => {
  try {
    const locationCode = req.query.locationCode ? req.query.locationCode : "*";
    const query = `
    SELECT HOUR(InTime) AS Jam,
        SUM(Tariff) AS TotalIncome
    FROM TransactionParkingValet
    ${locationCode === "*" ? "" : "WHERE LocationCode = ?"}
    GROUP BY HOUR(InTime);
    `;
    const queryParams = locationCode === "*" ? [] : [locationCode];
    connection.connection.query(query, queryParams, async (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to fetch summary data");
      } else {
        const response = {
          code: 200,
          message: "Success Get Report",
          hourly: results,
        };
        res.status(200).json(response);
      }
    });
  } catch (err) {}
});

router.get("/dailyreport", async (req, res) => {
  try {
    const locationCode = req.query.locationCode ? req.query.locationCode : "*";
    const date = req.query.date || null;
    const query = `
    SET @selectedDate = IFNULL(?, CURDATE());

    SELECT 
        DATE_FORMAT(InTime, '%H:00') AS Jam,
        SUM(Tariff) AS TotalIncome,
        COUNT(TrxNo) AS TotalTrx
    FROM TransactionParkingValet
    WHERE ${locationCode === "*" ? "1" : "LocationCode = ? "}
    AND DATE(InTime) = @selectedDate
    GROUP BY DATE_FORMAT(InTime, '%H');
    `;

    const queryCount = `
    SET @selectedDate = IFNULL(?, CURDATE());

    SELECT 
        COALESCE(SUM(TotalIncome), 0) AS TotalIncome,
        COALESCE(SUM(TotalIncomePrevious), 0) AS TotalIncomePrevious,
        COALESCE(SUM(TotalTrx), 0) AS TotalTrx,
        COALESCE(SUM(TotalTrxPrevious), 0) AS TotalTrxPrevious,
        COALESCE(SUM(TotalVIPTrx), 0) AS TotalVIPTrx,
        COALESCE(SUM(TotalVIPTrxPrevious), 0) AS TotalVIPTrxPrevious,
        COALESCE(SUM(TotalValetTrx), 0) AS TotalValetTrx,
        COALESCE(SUM(TotalValetTrxPrevious), 0) AS TotalValetTrxPrevious,
        COALESCE(AVG(DurationAvg), 0) AS DurationAvg,
        COALESCE(AVG(DurationAvgPrevious), 0) AS DurationAvgPrevious
    FROM (
        SELECT 
            SUM(CASE WHEN DATE(InTime) = @selectedDate THEN Tariff ELSE 0 END) AS TotalIncome,
            SUM(CASE WHEN DATE(InTime) = DATE_SUB(@selectedDate, INTERVAL 1 DAY) THEN Tariff ELSE 0 END) AS TotalIncomePrevious,
            COUNT(CASE WHEN DATE(InTime) = @selectedDate THEN TrxNo END) AS TotalTrx,
            COUNT(CASE WHEN DATE(InTime) = DATE_SUB(@selectedDate, INTERVAL 1 DAY) THEN TrxNo END) AS TotalTrxPrevious,
            COUNT(CASE WHEN DATE(InTime) = @selectedDate AND ParkingType = '3' THEN TrxNo END) AS TotalVIPTrx,
            COUNT(CASE WHEN DATE(InTime) = DATE_SUB(@selectedDate, INTERVAL 1 DAY) AND ParkingType = '3' THEN TrxNo END) AS TotalVIPTrxPrevious,
            COUNT(CASE WHEN DATE(InTime) = @selectedDate AND ParkingType IN ('1', '2') THEN TrxNo END) AS TotalValetTrx,
            COUNT(CASE WHEN DATE(InTime) = DATE_SUB(@selectedDate, INTERVAL 1 DAY) AND ParkingType IN ('1', '2') THEN TrxNo END) AS TotalValetTrxPrevious,
            AVG(CASE WHEN DATE(InTime) = @selectedDate THEN TIMESTAMPDIFF(SECOND, InTime, OutTime) END) AS DurationAvg,
            AVG(CASE WHEN DATE(InTime) = DATE_SUB(@selectedDate, INTERVAL 1 DAY) THEN TIMESTAMPDIFF(SECOND, InTime, OutTime) END) AS DurationAvgPrevious
        FROM TransactionParkingValet
        WHERE ${locationCode === "*" ? "1" : "LocationCode = ? "}
        AND DATE(InTime) IN (@selectedDate, DATE_SUB(@selectedDate, INTERVAL 1 DAY))
    ) AS subquery;
    `;

    const listLocation = `
    SET @selectedDate = IFNULL(?, NOW());

    SELECT 
        COUNT(TrxNo) AS TotalTrx,
        SUM(Tariff) AS TotalTariff,
        RefLocation.Name
    FROM TransactionParkingValet
    JOIN
        RefLocation ON TransactionParkingValet.LocationCode = RefLocation.Code
    WHERE ${locationCode === "*" ? "1" : "LocationCode = ? "}
    AND DATE(InTime) = @selectedDate
    GROUP BY RefLocation.Name
    ORDER BY TotalTrx DESC;
    `;

    const queryParams = locationCode === "*" ? [date] : [locationCode, date];
    connection.connection.query(query, queryParams, async (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to fetch summary data");
      } else {
        connection.connection.query(
          queryCount,
          queryParams,
          async (err, result) => {
            if (err) {
              console.error("Error executing query:", err);
              res.status(500).send("Failed to fetch summary data");
            } else {
              connection.connection.query(
                listLocation,
                queryParams,
                async (err, listTrx) => {
                  if (err) {
                    console.error("Error executing query:", err);
                    res.status(500).send("Failed to fetch summary data");
                  } else {
                    const response = {
                      code: 200,
                      message: "Success Get Report",
                      totalTrx: result,
                      summary: results,
                      listArea: listTrx,
                    };
                    res.status(200).json(response);
                  }
                }
              );
            }
          }
        );
      }
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Failed to process request");
  }
});

router.get("/monthlyreport", async (req, res) => {
  try {
    const locationCode = req.query.locationCode ? req.query.locationCode : "*";
    const month = req.query.month || null;
    const query = `
    SET @selectedMonth = IFNULL(?, MONTH(NOW()));

    SELECT 
        DATE_FORMAT(InTime, '%d-%m') AS Hari,
        SUM(Tariff) AS TotalIncome,
        COUNT(TrxNo) AS TotalTrx
    FROM TransactionParkingValet
    WHERE ${locationCode === "*" ? "1" : "LocationCode = ? "}
    AND MONTH(InTime) = @selectedMonth
    GROUP BY DATE(InTime);
    `;

    const queryCount = `
    SET @selectedMonth = IFNULL(?, MONTH(NOW()));

    SELECT 
        COALESCE(SUM(TotalIncome), 0) AS TotalIncome,
        COALESCE(SUM(TotalIncomePrevious), 0) AS TotalIncomePrevious,
        COALESCE(SUM(TotalTrx), 0) AS TotalTrx,
        COALESCE(SUM(TotalTrxPrevious), 0) AS TotalTrxPrevious,
        COALESCE(SUM(TotalVIPTrx), 0) AS TotalVIPTrx,
        COALESCE(SUM(TotalVIPTrxPrevious), 0) AS TotalVIPTrxPrevious,
        COALESCE(SUM(TotalValetTrx), 0) AS TotalValetTrx,
        COALESCE(SUM(TotalValetTrxPrevious), 0) AS TotalValetTrxPrevious,
        COALESCE(AVG(DurationAvg), 0) AS DurationAvg,
        COALESCE(AVG(DurationAvgPrevious), 0) AS DurationAvgPrevious
    FROM (
        SELECT 
            SUM(CASE WHEN MONTH(InTime) = @selectedMonth THEN Tariff ELSE 0 END) AS TotalIncome,
            SUM(CASE WHEN MONTH(InTime) = @selectedMonth - 1 THEN Tariff ELSE 0 END) AS TotalIncomePrevious,
            COUNT(CASE WHEN MONTH(InTime) = @selectedMonth THEN TrxNo END) AS TotalTrx,
            COUNT(CASE WHEN MONTH(InTime) = @selectedMonth - 1 THEN TrxNo END) AS TotalTrxPrevious,
            COUNT(CASE WHEN MONTH(InTime) = @selectedMonth AND ParkingType = '3' THEN TrxNo END) AS TotalVIPTrx,
            COUNT(CASE WHEN MONTH(InTime) = @selectedMonth - 1 AND ParkingType = '3' THEN TrxNo END) AS TotalVIPTrxPrevious,
            COUNT(CASE WHEN MONTH(InTime) = @selectedMonth AND ParkingType IN ('1', '2') THEN TrxNo END) AS TotalValetTrx,
            COUNT(CASE WHEN MONTH(InTime) = @selectedMonth - 1 AND ParkingType IN ('1', '2') THEN TrxNo END) AS TotalValetTrxPrevious,
            AVG(CASE WHEN MONTH(InTime) = @selectedMonth THEN TIMESTAMPDIFF(SECOND, InTime, OutTime) END) AS DurationAvg,
            AVG(CASE WHEN MONTH(InTime) = @selectedMonth - 1 THEN TIMESTAMPDIFF(SECOND, InTime, OutTime) END) AS DurationAvgPrevious
        FROM TransactionParkingValet
        WHERE ${locationCode === "*" ? "1" : "LocationCode = ? "}
        AND MONTH(InTime) IN (@selectedMonth, @selectedMonth - 1)
    ) AS subquery;
    `;

    const listLocation = `
    SET @selectedMonth = IFNULL(?, MONTH(NOW()));

    SELECT 
        COUNT(TrxNo) AS TotalTrx,
        SUM(Tariff) AS TotalTariff,
        RefLocation.Name
    FROM TransactionParkingValet
    JOIN
        RefLocation ON TransactionParkingValet.LocationCode = RefLocation.Code
        WHERE ${locationCode === "*" ? "1" : "LocationCode = ? "}
        AND MONTH(InTime) = @selectedMonth
        GROUP BY RefLocation.Name
        ORDER BY TotalTrx DESC;
    `;

    const queryParams = locationCode === "*" ? [month] : [locationCode, month];
    connection.connection.query(query, queryParams, async (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to fetch summary data");
      } else {
        connection.connection.query(
          queryCount,
          queryParams,
          async (err, result) => {
            if (err) {
              console.error("Error executing query:", err);
              res.status(500).send("Failed to fetch summary data");
            } else {
              connection.connection.query(
                listLocation,
                queryParams,
                async (err, listTrx) => {
                  if (err) {
                    console.error("Error executing query:", err);
                    res.status(500).send("Failed to fetch summary data");
                  } else {
                    const response = {
                      code: 200,
                      message: "Success Get Report",
                      totalTrx: result,
                      summary: results,
                      listArea: listTrx,
                    };
                    res.status(200).json(response);
                  }
                }
              );
            }
          }
        );
      }
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Failed to process request");
  }
});

router.get("/yearlyreport", async (req, res) => {
  try {
    const locationCode = req.query.locationCode ? req.query.locationCode : "*";
    const year = req.query.year || null;
    const query = `
    SET @selectedYear = IFNULL(?, YEAR(NOW()));

    SELECT 
        MONTH(InTime) AS Bulan,
        SUM(Tariff) AS TotalIncome,
        COUNT(TrxNo) AS TotalTrx
    FROM TransactionParkingValet
    WHERE ${locationCode === "*" ? "1" : "LocationCode = ? "}
    AND YEAR(InTime) = @selectedYear
    GROUP BY MONTH(InTime);
    `;

    const queryCount = `
    SET @selectedYear = IFNULL(?, YEAR(NOW()));

    SELECT 
        COALESCE(SUM(TotalIncome), 0) AS TotalIncome,
        COALESCE(SUM(TotalIncomePrevious), 0) AS TotalIncomePrevious,
        COALESCE(SUM(TotalTrx), 0) AS TotalTrx,
        COALESCE(SUM(TotalTrxPrevious), 0) AS TotalTrxPrevious,
        COALESCE(SUM(TotalVIPTrx), 0) AS TotalVIPTrx,
        COALESCE(SUM(TotalVIPTrxPrevious), 0) AS TotalVIPTrxPrevious,
        COALESCE(SUM(TotalValetTrx), 0) AS TotalValetTrx,
        COALESCE(SUM(TotalValetTrxPrevious), 0) AS TotalValetTrxPrevious,
        COALESCE(AVG(DurationAvg), 0) AS DurationAvg,
        COALESCE(AVG(DurationAvgPrevious), 0) AS DurationAvgPrevious
    FROM (
        SELECT 
            SUM(Tariff) AS TotalIncome,
            0 AS TotalIncomePrevious,
            COUNT(TrxNo) AS TotalTrx,
            0 AS TotalTrxPrevious,
            COUNT(CASE WHEN ParkingType = '3' THEN TrxNo END) AS TotalVIPTrx,
            0 AS TotalVIPTrxPrevious,
            COUNT(CASE WHEN ParkingType IN ('1', '2') THEN TrxNo END) AS TotalValetTrx,
            0 AS TotalValetTrxPrevious,
            AVG(TIMESTAMPDIFF(SECOND, InTime, OutTime)) AS DurationAvg,
            0 AS DurationAvgPrevious
        FROM TransactionParkingValet
        WHERE ${locationCode === "*" ? "1" : "LocationCode = ? "}
        AND YEAR(InTime) = @selectedYear
        UNION ALL
        SELECT 
            0 AS TotalIncome,
            SUM(Tariff) AS TotalIncomePrevious,
            0 AS TotalTrx,
            COUNT(TrxNo) AS TotalTrxPrevious,
            0 AS TotalVIPTrx,
            COUNT(CASE WHEN ParkingType = '3' THEN TrxNo END) AS TotalVIPTrxPrevious,
            0 AS TotalValetTrx,
            COUNT(CASE WHEN ParkingType IN ('1', '2') THEN TrxNo END) AS TotalValetTrxPrevious,
            0 AS DurationAvg,
            AVG(TIMESTAMPDIFF(SECOND, InTime, OutTime)) AS DurationAvgPrevious
        FROM TransactionParkingValet
        WHERE ${locationCode === "*" ? "1" : "LocationCode = ? "}
        AND YEAR(InTime) = @selectedYear - 1
    ) AS subquery;
    `;

    const listLocation = `
    SET @selectedYear = IFNULL(?, YEAR(NOW()));

    SELECT 
        MONTH(InTime) AS Bulan,
        COUNT(TrxNo) AS TotalTrx,
        SUM(Tariff) AS TotalTariff,
        RefLocation.Name
    FROM TransactionParkingValet
    JOIN
        RefLocation ON TransactionParkingValet.LocationCode = RefLocation.Code
        WHERE ${locationCode === "*" ? "1" : "LocationCode = ? "}
        AND YEAR(InTime) = @selectedYear
        GROUP BY RefLocation.Name
        ORDER BY Bulan, TotalTrx DESC;
    `;

    const queryParams = locationCode === "*" ? [year] : [locationCode, year];
    connection.connection.query(query, queryParams, async (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Failed to fetch summary data");
      } else {
        connection.connection.query(
          queryCount,
          queryParams,
          async (err, result) => {
            if (err) {
              console.error("Error executing query:", err);
              res.status(500).send("Failed to fetch summary data");
            } else {
              connection.connection.query(
                listLocation,
                queryParams,
                async (err, listTrx) => {
                  if (err) {
                    console.error("Error executing query:", err);
                    res.status(500).send("Failed to fetch summary data");
                  } else {
                    const response = {
                      code: 200,
                      message: "Success Get Report",
                      totalTrx: result,
                      summary: results,
                      listArea: listTrx,
                    };
                    res.status(200).json(response);
                  }
                }
              );
            }
          }
        );
      }
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Failed to process request");
  }
});

module.exports = router;
