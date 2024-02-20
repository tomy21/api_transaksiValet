const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const app = express();
const connection = require("./config/dbConfig.js");
const dateTimeCurrent = require("./config/currentDateTime.js");
const Locations = require("./route/Locations/Location.js");
const Issuer = require("./route/Issuer/Issuer.js");
const Payment = require("./route/Unpaid/Payment.js");
const CloseTicket = require("./route/Unpaid/CloseTicket.js");
const roleRegis = require("./route/Users/Role.js");
const userLocation = require("./route/Users/UserLocation.js");
const registerUser = require("./route/Users/Register.js");
const loginUsers = require("./route/Users/login.js");
const trxValet = require("./route/Valet/transaksiValet.js");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const HOST = "192.168.0.184";

const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));
app.use("/api", Locations);
app.use("/api", Issuer);
app.use("/api", Payment);
app.use("/api", CloseTicket);
app.use("/api", roleRegis);
app.use("/api", userLocation);
app.use("/api", registerUser);
app.use("/api", loginUsers);
app.use("/api", trxValet);

app.get("/transaction", async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const locationFilter = req.query.location || "";
  const issuerFilter = req.query.issuer || "";
  const paymentStatusFilter = req.query.paymentStatus || "";
  const offset = page * limit;
  const countDataQuery = `SELECT COUNT(tp.TransactionNo) AS totalItems 
  FROM TransactionParking tp
  LEFT JOIN RefLocation rl ON tp.LocationCode = rl.Code
  WHERE 
      tp.TransactionNo LIKE '%${search}%' OR
      tp.ReferenceNo LIKE '%${search}%' OR
      rl.Name LIKE '%${search}%'`;

  const queryDataQuery = `SELECT 
      tp.TransactionNo,
      tp.ReferenceNo,
      tp.LocationCode,
      tp.SubLocationCode,
      tp.GateInCode,
      tp.VehicleType,
      tp.ProductName,
      tp.InTime,
      tp.Duration,
      tp.Tariff,
      tp.GracePeriod,
      tp.PaymentStatus,
      tp.PaymentReferenceNo,
      tp.PaymentDate,
      tp.PaymentMethod,
      tp.IssuerID,
      tp.RetrievalReferenceNo,
      tp.ReferenceTransactionNo,
      tp.ApprovalCode,
      tp.OutTime,
      tp.GateOutCode,
      tp.InsertedDate,
      tp.FileName,
      tp.TransactionReference,
      tp.CreatedOn,
      tp.CreatedBy,
      tp.UpdatedOn,
      tp.UpdatedBy,
      tp.MatchRecon,
      tp.MatchPaymentRecon,
      rl.Name AS LocationName
  FROM 
      skybillingdb.TransactionParking AS tp
  INNER JOIN 
      RefLocation AS rl 
  ON 
      rl.Code = tp.LocationCode
  WHERE 
      tp.TransactionNo LIKE '%${search}%' OR
      tp.ReferenceNo LIKE '%${search}%' OR
      rl.Name LIKE '%${search}%'
      ${locationFilter ? `AND rl.Name = '${locationFilter}'` : ""}
      ${issuerFilter ? `AND tp.IssuerID = '${issuerFilter}'` : ""}
      ${
        paymentStatusFilter
          ? `AND tp.PaymentStatus = '${paymentStatusFilter}'`
          : ""
      }
  ORDER BY 
      tp.UpdatedOn DESC 
  LIMIT ${limit} OFFSET ${offset}`;

  try {
    connection.connection.query(
      countDataQuery,
      [search, search, search],
      (err, countResult) => {
        if (err) {
          console.error("Error fetching data from database: ", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }

        const totalRows = countResult[0].totalItems;
        const totalPage = Math.ceil(totalRows / limit);

        connection.connection.query(
          queryDataQuery,
          [search, search, search, limit, offset],
          (err, resultsData) => {
            if (err) {
              console.error("Error fetching data from database: ", err);
              res.status(500).json({ error: "Internal server error" });
              return;
            }

            const pagination = {
              current_page: page,
              total_row: limit,
              total_items: totalRows,
              total_page: totalPage,
            };

            const response = {
              statusCode: 200,
              message: "success",
              data: resultsData,
              pagination: pagination,
            };

            res.status(200).json(response);
            io.emit("updateData", response);
          }
        );
      }
    );
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/transaction", async (req, res) => {
  try {
    const transactionNo = await connection.generateUniqueTransactionCode();
    const dateCurrent = dateTimeCurrent("Asia/Jakarta");
    const noTrx = transactionNo;
    const LocationCode = "007SK";
    const InTime = dateCurrent.date_time;
    const VehicleType = "MOBIL REGULER";
    const Vehicle = "MOBIL";

    // Menggunakan placeholder untuk nilai variabel
    const insertQuery = `INSERT INTO TransactionParking (TransactionNo, ReferenceNo, LocationCode, VehicleType, ProductName, InTime, UpdatedOn) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    // Menjalankan query dengan menggunakan Promise
    connection.connection.query(
      insertQuery,
      [noTrx, noTrx, LocationCode, Vehicle, VehicleType, InTime, InTime],
      (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }

        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const offset = page * limit;
        const countDataQuery = `SELECT COUNT(tp.TransactionNo) AS totalItems 
  FROM TransactionParking tp
  LEFT JOIN RefLocation rl ON tp.LocationCode = rl.Code
  WHERE 
      tp.TransactionNo LIKE '%${search}%' OR
      tp.ReferenceNo LIKE '%${search}%' OR
      rl.Name LIKE '%${search}%'`;

        const queryDataQuery = `SELECT 
      tp.Id,
      tp.TransactionNo,
      tp.ReferenceNo,
      tp.LocationCode,
      tp.SubLocationCode,
      tp.GateInCode,
      tp.VehicleType,
      tp.ProductName,
      tp.InTime,
      tp.Duration,
      tp.Tariff,
      tp.GracePeriod,
      tp.PaymentStatus,
      tp.PaymentReferenceNo,
      tp.PaymentDate,
      tp.PaymentMethod,
      tp.IssuerID,
      tp.RetrievalReferenceNo,
      tp.ReferenceTransactionNo,
      tp.ApprovalCode,
      tp.OutTime,
      tp.GateOutCode,
      tp.InsertedDate,
      tp.FileName,
      tp.TransactionReference,
      tp.CreatedOn,
      tp.CreatedBy,
      tp.UpdatedOn,
      tp.UpdatedBy,
      tp.MatchRecon,
      tp.MatchPaymentRecon,
      rl.Name AS LocationName
  FROM 
      skybillingdb.TransactionParking AS tp
  INNER JOIN 
      RefLocation AS rl 
  ON 
      rl.Code = tp.LocationCode
  WHERE 
      tp.TransactionNo LIKE '%${search}%' OR
      tp.ReferenceNo LIKE '%${search}%' OR
      rl.Name LIKE '%${search}%'
  ORDER BY 
      tp.UpdatedOn DESC 
  LIMIT ${limit} OFFSET ${offset}`;

        try {
          connection.connection.query(
            countDataQuery,
            [search, search, search],
            (err, countResult) => {
              if (err) {
                console.error("Error fetching data from database: ", err);
                res.status(500).json({ error: "Internal server error" });
                return;
              }

              const totalRows = countResult[0].totalItems;
              const totalPage = Math.ceil(totalRows / limit);

              connection.connection.query(
                queryDataQuery,
                [search, search, search, limit, offset],
                (err, resultsData) => {
                  if (err) {
                    console.error("Error fetching data from database: ", err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                  }

                  const pagination = {
                    current_page: page,
                    total_row: limit,
                    total_items: totalRows,
                    total_page: totalPage,
                  };

                  const response = {
                    statusCode: 200,
                    message: "success",
                    data: resultsData,
                    pagination: pagination,
                  };

                  res.status(200).json(response);
                  io.emit("updateData", response);
                }
              );
            }
          );
        } catch (error) {
          console.error("Error executing SQL queries:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/transaction-payment", (req, res) => {
  try {
    const { transactionNo, locationNo } = req.body;
    const dateCurrent = dateTimeCurrent("Asia/Jakarta");
    const PaymentDate = dateCurrent.date_time;
    const PaymentStatus = "PAID";

    if (!transactionNo || !locationNo) {
      return res
        .status(400)
        .json({ message: "Nomor transaksi dan kode lokasi diperlukan" });
    }

    const updateQuery = `UPDATE TransactionParking SET LocationCode = ?, PaymentDate = ? , UpdatedOn = ?, PaymentStatus = ?  WHERE TransactionNo = ?`;

    connection.connection.query(
      updateQuery,
      [locationNo, PaymentDate, PaymentDate, PaymentStatus, transactionNo],
      (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }

        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const offset = page * limit;
        const countDataQuery = `SELECT COUNT(tp.TransactionNo) AS totalItems 
          FROM TransactionParking tp
          LEFT JOIN RefLocation rl ON tp.LocationCode = rl.Code
          WHERE 
              tp.TransactionNo LIKE '%${search}%' OR
              tp.ReferenceNo LIKE '%${search}%' OR
              rl.Name LIKE '%${search}%'`;

        const queryDataQuery = `SELECT 
          tp.Id,
          tp.TransactionNo,
          tp.ReferenceNo,
          tp.LocationCode,
          tp.SubLocationCode,
          tp.GateInCode,
          tp.VehicleType,
          tp.ProductName,
          tp.InTime,
          tp.Duration,
          tp.Tariff,
          tp.GracePeriod,
          tp.PaymentStatus,
          tp.PaymentReferenceNo,
          tp.PaymentDate,
          tp.PaymentMethod,
          tp.IssuerID,
          tp.RetrievalReferenceNo,
          tp.ReferenceTransactionNo,
          tp.ApprovalCode,
          tp.OutTime,
          tp.GateOutCode,
          tp.InsertedDate,
          tp.FileName,
          tp.TransactionReference,
          tp.CreatedOn,
          tp.CreatedBy,
          tp.UpdatedOn,
          tp.UpdatedBy,
          tp.MatchRecon,
          tp.MatchPaymentRecon,
          rl.Name AS LocationName
      FROM 
          skybillingdb.TransactionParking AS tp
      INNER JOIN 
          RefLocation AS rl 
      ON 
          rl.Code = tp.LocationCode
      WHERE 
          tp.TransactionNo LIKE '%${search}%' OR
          tp.ReferenceNo LIKE '%${search}%' OR
          rl.Name LIKE '%${search}%'
      ORDER BY 
          tp.UpdatedOn DESC 
      LIMIT ${limit} OFFSET ${offset}`;

        try {
          connection.connection.query(
            countDataQuery,
            [search, search, search],
            (err, countResult) => {
              if (err) {
                console.error("Error fetching data from database: ", err);
                res.status(500).json({ error: "Internal server error" });
                return;
              }

              const totalRows = countResult[0].totalItems;
              const totalPage = Math.ceil(totalRows / limit);

              connection.connection.query(
                queryDataQuery,
                [search, search, search, limit, offset],
                (err, resultsData) => {
                  if (err) {
                    console.error("Error fetching data from database: ", err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                  }

                  const pagination = {
                    current_page: page,
                    total_row: limit,
                    total_items: totalRows,
                    total_page: totalPage,
                  };

                  const response = {
                    statusCode: 200,
                    message: "success",
                    data: resultsData,
                    pagination: pagination,
                  };

                  res.status(200).json(response);
                  io.emit("updateData", response);
                }
              );
            }
          );
        } catch (error) {
          console.error("Error executing SQL queries:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      }
    );
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/transaction-out", (req, res) => {
  try {
    const { transactionNo, locationNo } = req.body;
    const dateCurrent = dateTimeCurrent("Asia/Jakarta");
    const PaymentDate = dateCurrent.date_time;

    if (!transactionNo || !locationNo) {
      return res
        .status(400)
        .json({ message: "Nomor transaksi dan kode lokasi diperlukan" });
    }

    const updateQuery = `UPDATE TransactionParking SET LocationCode = ?, OutTime = ? , UpdatedOn = ?  WHERE TransactionNo = ?`;

    connection.connection.query(
      updateQuery,
      [locationNo, PaymentDate, PaymentDate, transactionNo],
      (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }

        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const offset = page * limit;
        const countDataQuery = `SELECT COUNT(tp.TransactionNo) AS totalItems 
        FROM TransactionParking tp
        LEFT JOIN RefLocation rl ON tp.LocationCode = rl.Code
        WHERE 
            tp.TransactionNo LIKE '%${search}%' OR
            tp.ReferenceNo LIKE '%${search}%' OR
            rl.Name LIKE '%${search}%'`;

        const queryDataQuery = `SELECT 
            tp.Id,
            tp.TransactionNo,
            tp.ReferenceNo,
            tp.LocationCode,
            tp.SubLocationCode,
            tp.GateInCode,
            tp.VehicleType,
            tp.ProductName,
            tp.InTime,
            tp.Duration,
            tp.Tariff,
            tp.GracePeriod,
            tp.PaymentStatus,
            tp.PaymentReferenceNo,
            tp.PaymentDate,
            tp.PaymentMethod,
            tp.IssuerID,
            tp.RetrievalReferenceNo,
            tp.ReferenceTransactionNo,
            tp.ApprovalCode,
            tp.OutTime,
            tp.GateOutCode,
            tp.InsertedDate,
            tp.FileName,
            tp.TransactionReference,
            tp.CreatedOn,
            tp.CreatedBy,
            tp.UpdatedOn,
            tp.UpdatedBy,
            tp.MatchRecon,
            tp.MatchPaymentRecon,
            rl.Name AS LocationName
        FROM 
            skybillingdb.TransactionParking AS tp
        INNER JOIN 
            RefLocation AS rl 
        ON 
            rl.Code = tp.LocationCode
        WHERE 
            tp.TransactionNo LIKE '%${search}%' OR
            tp.ReferenceNo LIKE '%${search}%' OR
            rl.Name LIKE '%${search}%'
        ORDER BY 
            tp.UpdatedOn DESC 
        LIMIT ${limit} OFFSET ${offset}`;

        try {
          connection.connection.query(
            countDataQuery,
            [search, search, search],
            (err, countResult) => {
              if (err) {
                console.error("Error fetching data from database: ", err);
                res.status(500).json({ error: "Internal server error" });
                return;
              }

              const totalRows = countResult[0].totalItems;
              const totalPage = Math.ceil(totalRows / limit);

              connection.connection.query(
                queryDataQuery,
                [search, search, search, limit, offset],
                (err, resultsData) => {
                  if (err) {
                    console.error("Error fetching data from database: ", err);
                    res.status(500).json({ error: "Internal server error" });
                    return;
                  }

                  const pagination = {
                    current_page: page,
                    total_row: limit,
                    total_items: totalRows,
                    total_page: totalPage,
                  };

                  const response = {
                    statusCode: 200,
                    message: "success",
                    data: resultsData,
                    pagination: pagination,
                  };

                  res.status(200).json(response);
                  io.emit("updateData", response);
                }
              );
            }
          );
        } catch (error) {
          console.error("Error executing SQL queries:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      }
    );
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

io.on("connection", (socket) => {
  console.log(`server connected ${socket.id}`);

  socket.on("updateData", () => {
    console.log("Received updateData event");
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = page * limit;
    const countDataQuery = `SELECT COUNT(tp.TransactionNo) AS totalItems 
  FROM TransactionParking tp
  LEFT JOIN RefLocation rl ON tp.LocationCode = rl.Code
  WHERE 
      tp.TransactionNo LIKE '%${search}%' OR
      tp.ReferenceNo LIKE '%${search}%' OR
      rl.Name LIKE '%${search}%'`;

    const queryDataQuery = `SELECT 
      tp.Id,
      tp.TransactionNo,
      tp.ReferenceNo,
      tp.LocationCode,
      tp.SubLocationCode,
      tp.GateInCode,
      tp.VehicleType,
      tp.ProductName,
      tp.InTime,
      tp.Duration,
      tp.Tariff,
      tp.GracePeriod,
      tp.PaymentStatus,
      tp.PaymentReferenceNo,
      tp.PaymentDate,
      tp.PaymentMethod,
      tp.IssuerID,
      tp.RetrievalReferenceNo,
      tp.ReferenceTransactionNo,
      tp.ApprovalCode,
      tp.OutTime,
      tp.GateOutCode,
      tp.InsertedDate,
      tp.FileName,
      tp.TransactionReference,
      tp.CreatedOn,
      tp.CreatedBy,
      tp.UpdatedOn,
      tp.UpdatedBy,
      tp.MatchRecon,
      tp.MatchPaymentRecon,
      rl.Name AS LocationName
  FROM 
      skybillingdb.TransactionParking AS tp
  INNER JOIN 
      RefLocation AS rl 
  ON 
      rl.Code = tp.LocationCode
  WHERE 
      tp.TransactionNo LIKE '%${search}%' OR
      tp.ReferenceNo LIKE '%${search}%' OR
      rl.Name LIKE '%${search}%'
  ORDER BY 
      tp.UpdatedOn DESC 
  LIMIT ${limit} OFFSET ${offset}`;

    try {
      connection.connection.query(
        countDataQuery,
        [search, search, search],
        (err, countResult) => {
          if (err) {
            console.error("Error fetching data from database: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
          }

          const totalRows = countResult[0].totalItems;
          const totalPage = Math.ceil(totalRows / limit);

          connection.connection.query(
            queryDataQuery,
            [search, search, search, limit, offset],
            (err, resultsData) => {
              if (err) {
                console.error("Error fetching data from database: ", err);
                res.status(500).json({ error: "Internal server error" });
                return;
              }

              const pagination = {
                current_page: page,
                total_row: limit,
                total_items: totalRows,
                total_page: totalPage,
              };

              const response = {
                statusCode: 200,
                message: "success",
                data: resultsData,
                pagination: pagination,
              };

              res.status(200).json(response);
              io.emit("updateData", response);
            }
          );
        }
      );
    } catch (error) {
      console.error("Error executing SQL queries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

server.listen(PORT, HOST, "", () => {
  console.log(`Server is running on port ${PORT}`);
});
