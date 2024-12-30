import { TransactionValet } from "../models/TransactionValet.js";
import { RefLastTransaction } from "../models/RefLastTransaction.js";
import { TicketCategory } from "../models/RefTicketCategory.js";
import { Qris } from "../models/RefQris.js";
import { Location } from "../models/RefLocation.js";
import { Op, where, QueryTypes } from "sequelize";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../config/dbConfig.js";
import { Users } from "../models/Users.js";
import { transactionValetHistory } from "../models/TransactionValteHistory.js";
import moment from "moment";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

export const getTransaction = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const orderBy = req.query.orderBy || "UpdatedOn";
  const sortBy = req.query.sortBy || "DESC";
  const keyword = req.query.keyword || "";
  const locationCode = req.query.location || "";

  const today = new Date().toISOString().split("T")[0];
  const startDate = req.query.startDate || today;
  const endDate = req.query.endDate || today;

  try {
    const whereConditions = locationCode ? { LocationCode: locationCode } : {};

    if (keyword) {
      whereConditions[Op.or] = [
        { LocationCode: { [Op.like]: `%${keyword}%` } },
        { TrxNo: { [Op.like]: `%${keyword}%` } },
        { TicketNumber: { [Op.like]: `%${keyword}%` } },
        { VehiclePlate: { [Op.like]: `%${keyword}%` } },
        { ReferenceNo: { [Op.like]: `%${keyword}%` } },
        // Add more columns if needed
      ];
    }

    if (startDate && endDate) {
      whereConditions.UpdatedOn = {
        [Op.between]: [startDate, endDate],
      };
    }

    const queries = {
      where: whereConditions,
      offset: (page - 1) * limit,
      limit,
      order: [[orderBy, sortBy]],
    };

    const result = await TransactionValet.findAndCountAll(queries);

    const totalTrx = await TransactionValet.count(queries);
    const totalTariff = await TransactionValet.sum("Tariff", queries);

    if (result) {
      const response = {
        success: true,
        summary: {
          totalTrx: totalTrx,
          totalTarif: totalTariff || 0,
        },
        totalPages: Math.ceil(result.count / limit),
        totalItems: result.count,
        data: result.rows,
      };
      res.status(201).json(response);
    } else {
      res.status(400).json({ success: false, message: "Get data failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Get data failed",
      error: error.message,
    });
  }
};

export const getTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await TransactionValet.findOne({
      where: {
        Id: id,
      },
      attributes: [
        "Id",
        "TrxNo",
        "TicketNumber",
        "VehiclePlate",
        "InTime",
        "OutTime",
        "foto1",
        "fotoBuktiPayment1",
        "NoKeySlot",
        "LocationCode",
        "ParkingType",
        "CreatedBy",
        "RecordStatus",
      ],
      include: [
        {
          model: Location,
          attributes: ["Code", "Name"],
        },
      ],
    });
    const response = {
      statusCode: 200,
      message: "Get Data Successfuly",
      data: data,
    };
    res.json(response);
  } catch (error) {
    console.log(error);
  }
};

export const getTransactionByLocation = async (req, res) => {
  const { LocationCode, startDate, endDate } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const orderBy = req.query.orderBy || "InTime";
  const sortBy = req.query.sortBy || "DESC";
  const keyword = req.query.keyword || "";

  try {
    // Tentukan tanggal default jika tidak ada filter tanggal
    let filterStartDate, filterEndDate;
    if (startDate && endDate) {
      filterStartDate = new Date(startDate);
      filterEndDate = new Date(endDate);
    } else {
      // Set ke tanggal hari ini
      const today = moment();
      filterStartDate = today.clone().startOf("day").toISOString(); // Mulai hari ini
      filterEndDate = today.clone().endOf("day").toISOString();
    }

    const today = new Date();
    console.log(new Date(today.setHours(0, 0, 0, 0)).toLocaleString());
    console.log(new Date(today.setHours(23, 59, 59, 999)).toLocaleString());
    // Bangun kondisi where
    const whereConditions = {
      LocationCode: LocationCode,
      InTime: {
        [Op.between]: [filterStartDate, filterEndDate],
      },
    };

    // Tambahkan kondisi keyword jika ada
    if (keyword) {
      whereConditions[Op.or] = [
        { LocationCode: { [Op.like]: `%${keyword}%` } },
        { TrxNo: { [Op.like]: `%${keyword}%` } },
        { TicketNumber: { [Op.like]: `%${keyword}%` } },
        { VehiclePlate: { [Op.like]: `%${keyword}%` } },
        { ReferenceNo: { [Op.like]: `%${keyword}%` } },
        // Tambahkan kolom lainnya jika diperlukan
      ];
    }

    const queries = {
      where: whereConditions,
      offset: (page - 1) * limit,
      limit,
      attributes: [
        "Id",
        "TrxNo",
        "TicketNumber",
        "VehiclePlate",
        "InTime",
        "OutTime",
        "foto1",
        "ParkingType",
        "fotoBuktiPayment1",
        "CreatedBy",
      ],
      include: [
        {
          model: Location,
          attributes: ["Code", "Name"],
        },
      ],
    };

    if (orderBy) {
      queries.order = [[orderBy, sortBy]];
    }

    const result = await TransactionValet.findAndCountAll(queries);
    const countIn = await TransactionValet.count({
      where: {
        LocationCode: LocationCode,
        OutTime: null,
        InTime: {
          [Op.between]: [filterStartDate, filterEndDate],
        },
      },
      order: [["InTime", "ASC"]],
    });
    const countOut = await TransactionValet.count({
      where: {
        LocationCode: LocationCode,
        OutTime: { [Op.not]: null },
        InTime: {
          [Op.between]: [filterStartDate, filterEndDate],
        },
      },
      order: [["OutTime", "ASC"]],
    });

    if (result) {
      const response = {
        success: true,
        totalPages: Math.ceil(result.count / limit),
        totalItems: result.count,
        currentPage: page,
        countIn: countIn,
        countOut: countOut,
        data: result.rows,
      };
      res.status(200).json(response); // Ubah status ke 200 untuk permintaan GET yang berhasil
    } else {
      res.status(400).json({ success: false, message: "Get data failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const addTransaction = async (req, res) => {
  upload.fields([
    { name: "foto1" },
    { name: "foto2" },
    { name: "foto3" },
    { name: "foto4" },
    { name: "foto5" },
    { name: "foto6" },
  ])(req, res, async (err) => {
    const {
      LocationCode,
      TicketNumber,
      VehiclePlate,
      ParkingValetStatusId,
      ParkingType,
      ReceivedBy,
      ReceivedUserId,
      CreatedBy,
    } = req.body;
    // const userId = req.userId;
    // const userData = await Users.findByPk(userId);

    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ success: false, message: "Error uploading files" });
    } else if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }

    const photoPaths = [];

    for (let i = 1; i <= 6; i++) {
      let fieldName = "foto" + i;
      if (req.files[fieldName] && req.files[fieldName].length > 0) {
        photoPaths.push(req.files[fieldName][0].path);
      } else {
        photoPaths.push(null); // Jika foto tidak ada, masukkan null ke dalam array
      }
    }
    // console.log(photoPaths);
    const todayDate = new Date().toISOString().split("T")[0];
    const todayDateFormat = new Date()
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");

    try {
      const countTransaction = await TransactionValet.findAndCountAll({
        where: {
          LocationCode: LocationCode,
          InTime: {
            [Op.between]: [`${todayDate} 00:00:00`, `${todayDate} 23:59:59`],
          },
        },
      });

      const nameLocation = await Location.findAll({
        where: { Code: LocationCode },
        attributes: ["Name", "Region"],
      });

      const locationNames = nameLocation.map((location) => {
        if (typeof location.Name === "string") {
          return location.Name;
        } else {
          return "";
        }
      });

      const ticketCategory = await TicketCategory.findByPk(ParkingType);

      const resultQris = await Qris.findAll({
        where: {
          [Op.and]: { TypeValet: ticketCategory.Code },
          LocationCode: LocationCode,
        },
        attributes: ["TypeValet", "Name", "Tariff", "QrisCode", "NMID"],
      });

      const typeValet = resultQris.map((qris) => qris.TypeValet);
      const tariffValet = resultQris.map((qris) => qris.Tariff);

      let numberSeq;

      if (countTransaction?.count === 0) {
        const newLastTransaction = await RefLastTransaction.create({
          Code: LocationCode,
          Name: locationNames.toString(),
          Numbers: countTransaction?.count + 1,
          Description: `Sequence Number Ticket Valet in ${locationNames}`,
          CreatedBy: CreatedBy,
        });

        numberSeq = newLastTransaction.Numbers;
      } else {
        const idLastTransaction = await RefLastTransaction.findAll({
          where: { Code: LocationCode },
          attributes: ["Id", "Numbers"],
        });
        const IdLastTrx = idLastTransaction.map((idTrx) => idTrx.Id);

        await RefLastTransaction.update(
          { Numbers: countTransaction?.count + 1 },
          { where: { Id: parseInt(IdLastTrx) } }
        );
      }

      const codeTransaction = `${LocationCode}-${typeValet}-${todayDateFormat}-${(
        countTransaction?.count + 1
      )
        .toString()
        .padStart(4, "0")}`;

      const addTransaction = await TransactionValet.create({
        LocationCode: LocationCode,
        TrxNo: codeTransaction,
        TicketNumber: TicketNumber,
        VehiclePlate: VehiclePlate,
        ParkingValetStatusId: ParkingValetStatusId,
        ParkingType: ParkingType,
        Tariff: parseInt(tariffValet),
        InTime: new Date(),
        ReceivedBy: ReceivedBy,
        ReceivedUserId: ReceivedUserId,
        NoKeySlot: numberSeq,
        CreatedBy: CreatedBy,
        foto1: photoPaths[0],
        foto2: photoPaths[1],
        foto3: photoPaths[2],
        foto4: photoPaths[3],
        foto5: photoPaths[4],
        foto6: photoPaths[5],
        RecordStatus: 1,
      });

      if (addTransaction) {
        await transactionValetHistory.create({
          LocationCode: LocationCode,
          TransactionParkingValetId: addTransaction.Id,
          Description: "Create New Transaction",
          CreatedOn: new Date(),
          CreatedBy: CreatedBy,
          RecordStatus: 1,
        });

        res.status(201).json({
          success: true,
          message: "Insert data successfully",
          data: addTransaction,
          paymentData: resultQris,
        });
      } else {
        res.status(500).json({ success: false, message: "Insert data failed" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

export const getNumberKyeSlot = async (req, res) => {
  const { LocationCode, ParkingType } = req.query;
  const todayDate = new Date().toISOString().split("T")[0];
  try {
    const countTransaction = await TransactionValet.findAndCountAll({
      where: {
        LocationCode: LocationCode,
        ParkingType: ParkingType,
        InTime: {
          [Op.between]: [`${todayDate} 00:00:00`, `${todayDate} 23:59:59`],
        },
      },
    });
    res.json({ numberCode: countTransaction?.count });
  } catch (error) {
    console.log(error);
  }
};

export const updatePayment = async (req, res) => {
  upload.fields([{ name: "payment1" }])(req, res, async (err) => {
    const { PaymentBy, userName } = req.body;
    const { id } = req.params;

    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ success: false, message: "Error uploading files" });
    } else if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }

    const photoPaths = [];

    for (let i = 1; i <= 6; i++) {
      let fieldName = "payment1";
      if (req.files[fieldName] && req.files[fieldName].length > 0) {
        photoPaths.push(req.files[fieldName][0].path);
      } else {
        photoPaths.push(null);
      }
    }

    try {
      const updateResult = await TransactionValet.update(
        {
          PaymentOn: new Date(),
          OutTime: new Date(),
          UpdatedOn: new Date(),
          UpdatedBy: userName,
          PaymentBy: PaymentBy,
          fotoBuktiPayment1: photoPaths[0],
        },
        {
          where: {
            Id: id,
          },
        }
      );

      // Cek apakah pembaruan berhasil
      if (updateResult[0] === 1) {
        console.log("Data berhasil diperbarui.");

        // Ambil data hasil pembaruan
        const updatedTransaction = await TransactionValet.findOne({
          where: { Id: id },
        });

        res.status(200).json({
          message: "Payment Success",
          data: updatedTransaction,
        });

        await transactionValetHistory.create({
          LocationCode: updatedTransaction.LocationCode,
          TransactionParkingValetId: updatedTransaction.Id,
          Description: "Paid Transaction and Out",
          CreatedOn: new Date(),
          CreatedBy: PaymentBy,
          RecordStatus: 1,
        });
      } else {
        console.log(
          "Data tidak ditemukan atau tidak ada perubahan yang dilakukan."
        );
        res.status(404).json({
          message:
            "Data tidak ditemukan atau tidak ada perubahan yang dilakukan.",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Terjadi kesalahan pada server", error });
    }
  });
};

export const cancelTransaction = async (req, res) => {
  const { id } = req.params;
  const userName = req.body.userName;

  try {
    const updatedTransaction = await TransactionValet.update(
      {
        DeletedOn: new Date(),
        DeletedBy: userName,
        RecordStatus: 0,
      },
      {
        where: {
          Id: id,
        },
      }
    );
    await transactionValetHistory.create({
      LocationCode: updatedTransaction.LocationCode,
      TransactionParkingValetId: updatedTransaction.Id,
      Description: "Cancel Transaction",
      CreatedOn: new Date(),
      CreatedBy: CreatedBy,
      RecordStatus: 1,
    });
    // Cek apakah pembaruan berhasil
    if (updatedTransaction[0] === 1) {
      console.log("Data berhasil diperbarui.");
    } else {
      console.log(
        "Data tidak ditemukan atau tidak ada perubahan yang dilakukan."
      );
    }

    res.status(200).json({ message: "Transaction Cancel" });
  } catch (error) {
    console.log(error);
  }
};

export const getTransaskiHistory = async (req, res) => {
  const { LocationCode, startDate, endDate } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 3;
  const orderBy = req.query.orderBy || "CreatedOn";
  const sortBy = req.query.sortBy || "DESC";
  const keyword = req.query.keyword || "";

  try {
    // Tentukan tanggal default jika tidak ada filter tanggal
    let filterStartDate, filterEndDate;
    if (startDate && endDate) {
      filterStartDate = new Date(startDate);
      filterEndDate = new Date(endDate);
    } else {
      // Set ke tanggal hari ini
      const today = new Date();
      filterStartDate = new Date(today.setHours(0, 0, 0, 0)); // Mulai hari ini
      filterEndDate = new Date(today.setHours(23, 59, 59, 999)); // Akhir hari ini
    }

    // Bangun kondisi where
    const whereConditions = {
      LocationCode: LocationCode,
      CreatedOn: {
        // Gantilah 'TransactionDate' dengan nama kolom tanggal Anda
        [Op.between]: [filterStartDate, filterEndDate],
      },
    };

    // Tambahkan kondisi keyword jika ada
    if (keyword) {
      whereConditions[Op.or] = [
        { LocationCode: { [Op.like]: `%${keyword}%` } },
        { Description: { [Op.like]: `%${keyword}%` } },
        // Tambahkan kolom lainnya jika diperlukan
      ];
    }

    const queries = {
      where: whereConditions,
      offset: (page - 1) * limit,
      limit,
      attributes: [
        "LocationCode",
        "TransactionParkingValetId",
        "Description",
        "CreatedOn",
        "CreatedBy",
      ],
      include: [
        {
          model: TransactionValet,
          attributes: [
            "Id",
            "TrxNo",
            "TicketNumber",
            "VehiclePlate",
            "ParkingType",
            "InTime",
            "OutTime",
          ],
        },
      ],
    };

    if (orderBy) {
      queries.order = [[orderBy, sortBy]];
    }

    const result = await transactionValetHistory.findAndCountAll(queries);

    if (result) {
      const response = {
        success: true,
        totalPages: Math.ceil(result.count / limit),
        totalItems: result.count,
        currentPage: page,
        data: result.rows,
      };
      res.status(200).json(response); // Ubah status ke 200 untuk permintaan GET yang berhasil
    } else {
      res.status(400).json({ success: false, message: "Get data failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
