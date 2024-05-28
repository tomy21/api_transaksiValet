import { TransactionOverNights } from "../models/TransactionOverNights.js";
import { TransactionOverNightOficcers } from "../models/TransactionOverNightOficcers.js";
import XLSX from "xlsx";
import { Location } from "../models/RefLocation.js";
import { Op } from "sequelize";
import db from "../config/dbConfig.js";
import ExcelJs from "exceljs";

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
        COUNT(VehiclePlateNo) AS TotalCount,
        SUM(CASE WHEN Status = 'In Area' THEN 1 ELSE 0 END) AS InareaCount,
        SUM(CASE WHEN Status = 'No vehicle' THEN 1 ELSE 0 END) AS NovihicleCount,
        SUM(CASE WHEN Status = 'Out' THEN 1 ELSE 0 END) AS OutCount
    FROM TransactionOverNights
    WHERE DATE(ModifiedOn) = CURDATE() AND LocationCode = :locationCode;
    `;

    const summary = await db.query(query, {
      type: db.QueryTypes.SELECT,
      replacements: { locationCode },
    });

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
      const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Adjusted for Excel's epoch bug
      const date = new Date(
        excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000
      );
      return date;
    };

    // Iterasi data dan simpan ke database
    for (const row of worksheet) {
      const inTimeJSDate = excelDateToJSDate(row.InTime);
      const vehiclePlateNo = row["License Plate"]
        ? row["License Plate"].replace(/\s+/g, "").toUpperCase()
        : "-";

      const existingRecord = await TransactionOverNights.findOne({
        where: {
          [Op.and]: [
            { VehiclePlateNo: vehiclePlateNo },
            { LocationCode: locationCode },
            { ModifiedBy: null },
            {
              [Op.or]: [{ Status: "No vehicle" }, { Status: "In Area" }],
            },
          ],
        },
      });

      if (existingRecord) {
        await existingRecord.update({
          Status: "No vehicle",
          TransactionNo: row["Ticket Number"],
        });
      } else {
        const insertData = {
          TransactionNo: row["Ticket Number"],
          LocationCode: locationCode,
          VehiclePlateNo: vehiclePlateNo,
          InTime: inTimeJSDate,
          Status: "No vehicle",
        };
        await TransactionOverNights.create(insertData);
      }
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
        PathPhotoImage: "/uploads/" + file.originalname,
      });

      await TransactionOverNightOficcers.create({
        LocationCode: locationCode,
        Status: "In Area",
        ModifiedBy: officer,
        VehiclePlateNo: plateNo,
        PhotoImage: file.buffer,
        PathPhotoImage: "/uploads/" + file.filename,
      });

      res.status(200).send("Data berhasil diperbarui!");
    } else {
      TransactionOverNights.create({
        LocationCode: locationCode,
        VehiclePlateNo: plateNo,
        ModifiedBy: officer,
        PhotoImage: file.buffer,
        PathPhotoImage: "/uploads/" + file.filename,
        Status: "In Area",
      });

      await TransactionOverNightOficcers.create({
        LocationCode: locationCode,
        Status: "In Area",
        ModifiedBy: officer,
        VehiclePlateNo: plateNo,
        PathPhotoImage: "/uploads/" + file.filename,
        PhotoImage: file.buffer,
      });
      res.status(200).send("Data berhasil disimpan!");
    }
  } catch (error) {
    console.error("Error menyimpan data:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat menyimpan data" });
  }
};

export const getDataOverNightLocation = async (req, res) => {
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
        COUNT(VehiclePlateNo) AS TotalCount,
        SUM(CASE WHEN Status = 'In Area' THEN 1 ELSE 0 END) AS InareaCount,
        SUM(CASE WHEN Status = 'No vehicle' THEN 1 ELSE 0 END) AS NovihicleCount,
        SUM(CASE WHEN Status = 'Out' THEN 1 ELSE 0 END) AS OutCount
    FROM TransactionOverNights
    WHERE DATE(ModifiedOn) = CURDATE();
    `;

    const summary = await db.query(query, { type: db.QueryTypes.SELECT });
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

export const getDataOverNightPetugas = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const orderBy = req.query.orderBy || "ModifiedOn";
  const sortBy = req.query.sortBy || "DESC";
  const keyword = req.query.keyword || "";
  const locationCode = req.query.location || "";
  const startDate =
    req.query.startDate || new Date().toISOString().split("T")[0];
  const endDate = req.query.endDate || new Date().toISOString().split("T")[0];
  const formatDate = (date) => date.toISOString().split("T")[0];

  const currentDate = new Date();
  const formattedCurrentDate = formatDate(currentDate);
  const startOfDay = new Date(formattedCurrentDate);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

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
          [Op.between]: [startOfDay, endOfDay],
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
        COUNT(VehiclePlateNo) AS TotalCount,
        SUM(CASE WHEN Status = 'In Area' THEN 1 ELSE 0 END) AS InareaCount,
        SUM(CASE WHEN Status = 'No vehicle' THEN 1 ELSE 0 END) AS NovihicleCount,
        SUM(CASE WHEN Status = 'Out' THEN 1 ELSE 0 END) AS OutCount
    FROM TransactionOverNights
    WHERE DATE(ModifiedOn) = CURDATE();
    `;

    const summary = await db.query(query, { type: db.QueryTypes.SELECT });
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

export const exportDataOverNight = async (req, res) => {
  try {
    const sequelize = db;
    const locationCode = req.query.LocationCode || null;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    const query = {
      where: [locationCode ? { LocationCode: locationCode } : {}],
      include: [
        {
          model: Location,
          attributes: ["Name"],
        },
      ],
    };

    if (startDate && endDate) {
      query.where = {
        ...query.where,
        InTime: {
          [Op.between]: [startDate, endDate],
        },
      };
    }

    const result = await TransactionOverNights.findAll({ ...query });

    if (result) {
      const workbook = new ExcelJs.Workbook();
      const worksheet = workbook.addWorksheet("TransactionValet");

      worksheet.columns = [
        { header: "No", key: "No", width: 5 },
        { header: "Date In", width: 20, key: "InTime" },
        { header: "Transaction No", width: 20, key: "TransactionNo" },
        { header: "Location Name", width: 15, key: "LocationCode" },
        { header: "Vehicle Plate", width: 15, key: "VehiclePlateNo" },
        { header: "Status", width: 10, key: "Status" },
        { header: "Officer", width: 15, key: "ModifiedBy" },
        { header: "Last Update", width: 15, key: "ModifiedOn" },
      ];

      result.forEach((value, index) => {
        worksheet.addRow({
          No: index + 1,
          InTime: value.InTime,
          TransactionNo: value.TransactionNo,
          LocationCode: value.LocationCode ? value.RefLocation.Name : "-",
          VehiclePlateNo: value.VehiclePlateNo ? value.VehiclePlateNo : "-",
          Status: value.Status,
          Officer: value.Officer,
          ModifiedBy: value.ModifiedBy,
          ModifiedOn: value.ModifiedOn,
        });
      });

      const fileName =
        locationCode && startDate && endDate
          ? `${locationCode}_${startDate}_sd_${endDate}.xlsx`
          : `${locationCode}_alldate.xlsx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.status(400).json({ success: false, message: "Get data failed" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateOutAndRemaks = async (req, res) => {
  const { outTime, remaks, idTransaction, officer } = req.body;

  try {
    const existingRecord = await TransactionOverNights.findOne({
      where: { Id: idTransaction },
    });

    if (existingRecord) {
      await existingRecord.update({
        Status: "Out",
        ModifiedBy: officer,
        Remaks: remaks,
        OutTime: outTime,
      });
      res.status(200).json({ message: "Record updated successfully" });
    } else {
      res.status(404).json({ message: "Record not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};
