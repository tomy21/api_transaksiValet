import { TransactionOverNights } from "../models/TransactionOverNights.js";
import { TransactionOverNightOficcers } from "../models/TransactionOverNightOficcers.js";
import XLSX from "xlsx";
import { Location } from "../models/RefLocation.js";
import { Op } from "sequelize";
import db from "../config/dbConfig.js";

export const getDataOverNight = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const orderBy = req.query.orderBy || "ModifiedOn";
  const sortBy = req.query.sortBy || "DESC";
  const keyword = req.query.keyword || "";
  const locationCode = req.query.location || "";
  const startDate = req.query.startDate || "";
  const endDate = req.query.endDate || "";
  try {
    const queries = {
      where: locationCode ? { LocationCode: locationCode } : {},
      offset: (page - 1) * limit,
      limit,
      include: [
        {
          model: Location,
          attributes: ["Name"],
        },
      ],
    };

    if (keyword) {
      queries.where = {
        [Op.or]: [
          { TransactionNo: { [Op.like]: `%${keyword}%` } },
          { ReferenceNo: { [Op.like]: `%${keyword}%` } },
          { VehiclePlateNo: { [Op.like]: `%${keyword}%` } },
          { Status: { [Op.like]: `%${keyword}%` } },
          { InTime: { [Op.like]: `%${keyword}%` } },
          // Tambahkan kolom lainnya jika diperlukan
        ],
      };
    }

    if (startDate && endDate) {
      queries.where = {
        ...queries.where,
        ModifiedOn: {
          [Op.between]: [startDate, endDate],
        },
      };
    }

    if (orderBy) {
      queries.order = [[orderBy, sortBy]];
    }

    const result = await TransactionOverNights.findAndCountAll({
      ...queries,
    });

    const query = `
    SELECT
        COUNT(1) AS TotalCount,
        SUM(CASE WHEN Status = 'In Area' THEN 1 ELSE 0 END) AS InareaCount,
        SUM(CASE WHEN Status = 'No vehicle' THEN 1 ELSE 0 END) AS NovihicleCount,
        SUM(CASE WHEN Status = 'Out' THEN 1 ELSE 0 END) AS OutCount
    FROM TransactionOverNights
    WHERE DATE(InTime) = CURDATE();
    `;

    const summary = await db.query(query, { type: db.QueryTypes.SELECT });
    console.log(summary);
    if (result) {
      const response = {
        success: true,
        totalPages: Math.ceil(result?.count / limit),
        totalItems: result?.count,
        summary: summary,
        data: result?.rows,
      };
      res.status(201).json(response);
    } else {
      res.status(400).json({ success: false, message: "Get data failed" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: "Get data failed" });
  }
};

export const importDataExcel = async (req, res) => {
  try {
    const file = req.file;
    const locationCode = req.query.locationCode;
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // console.log(worksheet);

    const excelDateToJSDate = (serial) => {
      const excelEpoch = new Date(Date.UTC(1900, 0, 1)); // Excel epoch starts at 1 Jan 1900
      const days = Math.floor(serial - 1);
      const msPerDay = 24 * 60 * 60 * 1000;
      const msTime = (serial - days - 1) * msPerDay;
      const date = new Date(excelEpoch.getTime() + days * msPerDay + msTime);
      return date;
    };

    // Iterasi data dan simpan ke database
    for (const row of worksheet) {
      const inTimeJSDate = excelDateToJSDate(row.InTime);

      const insertData = {
        TransactionNo: row["Ticket Number"],
        LocationCode: locationCode,
        VehiclePlateNo: row["License Plate"],
        InTime: inTimeJSDate,
        Status: "No vehicle",
      };
      await TransactionOverNights.create(insertData);
    }
    const response = {
      code: 200,
      message: "Upload successfully",
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("Error mengimpor data:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat mengimpor data" });
  }
};

export const validationData = async (req, res) => {
  try {
    const { locationCode, plateNo, officer } = req.body;
    const file = req.file;

    if (!locationCode || !plateNo || !officer) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    if (!file) {
      return res.status(400).json({ message: "Gambar harus diunggah" });
    }

    const existingRecord = await TransactionOverNights.findOne({
      where: { vehiclePlateNo: plateNo },
    });

    if (existingRecord) {
      await existingRecord.update({
        Status: "In Area",
        ModifiedBy: officer,
        PhotoImage: file.buffer,
      });

      await TransactionOverNightOficcers.create({
        LocationCode: locationCode,
        Status: "In Area",
        ModifiedBy: officer,
        VehiclePlateNo: plateNo,
        PhotoImage: file.buffer,
      });

      res.status(200).send("Data berhasil diperbarui!");
    } else {
      TransactionOverNights.create({
        LocationCode: locationCode,
        VehiclePlateNo: plateNo,
        ModifiedBy: officer,
        PhotoImage: file.buffer,
        Status: "No vehicle",
      });

      await TransactionOverNightOficcers.create({
        LocationCode: locationCode,
        Status: "No vehicle",
        ModifiedBy: officer,
        VehiclePlateNo: plateNo,
        PhotoImage: file.buffer,
      });
      res.status(200).send("Data berhasil disimpan!");
    }
  } catch (error) {
    console.error("Error menyimpan data:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat menyimpan data" });
  }
};
