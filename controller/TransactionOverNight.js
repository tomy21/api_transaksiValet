import { TransactionOverNights } from "../models/TransactionOverNights.js";
import { TransactionOverNightOficcers } from "../models/TransactionOverNightOficcers.js";
import XLSX from "xlsx";
import { Location } from "../models/RefLocation.js";
import { Op, Sequelize } from "sequelize";
import db from "../config/dbConfig.js";
import ExcelJs from "exceljs";
import fs from "fs";
import path from "path";
import moment from "moment/moment.js";
import { UsersLocations } from "../models/UsersLocation.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const { locationCode, plateNo, platerecognizer, officer, typeVehicle } =
      req.body;
    const file = req.file;
    const currentTime = moment().tz("Asia/Jakarta").format();

    if (!locationCode || !plateNo || !officer) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    if (!file) {
      return res.status(400).json({ message: "Gambar harus diunggah" });
    }

    const newFilePath = path.join(__dirname, "../uploads/", file.filename);
    // Membaca file dari disk
    fs.access(newFilePath, fs.constants.F_OK, async (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "File gambar tidak ditemukan." });
      }

      // Cari record yang ada
      const existingRecord = await TransactionOverNights.findOne({
        where: {
          VehiclePlateNo: plateNo,
          LocationCode: locationCode,
          OutTime: null,
        },
      });

      if (existingRecord) {
        // Update record yang ada
        await existingRecord.update({
          Status: "In Area",
          ModifiedBy: officer,
          ModifiedOn: currentTime,
          TypeVehicle: typeVehicle,
          PathPhotoImage: `/uploads/${file.filename}`,
          UploadedAt: currentTime,
        });

        await TransactionOverNightOficcers.create({
          LocationCode: locationCode,
          Status: "In Area",
          ModifiedBy: officer,
          ModifiedOn: currentTime,
          VehiclePlateNo: plateNo,
          TypeVehicle: typeVehicle,
          PathPhotoImage: `/uploads/${file.filename}`,
          PhotoImage: null,
        });

        return res.status(200).send("Data berhasil diperbarui!");
      } else {
        // Buat record baru
        await TransactionOverNights.create({
          LocationCode: locationCode,
          VehiclePlateNo: plateNo,
          Plateregognizer: platerecognizer,
          ModifiedBy: officer,
          TypeVehicle: typeVehicle,
          PathPhotoImage: `/uploads/${file.filename}`,
          Status: "In Area",
          PhotoImage: null,
          ModifiedOn: currentTime,
        });

        await TransactionOverNightOficcers.create({
          LocationCode: locationCode,
          Status: "In Area",
          ModifiedBy: officer,
          VehiclePlateNo: plateNo,
          PathPhotoImage: `/uploads/${file.filename}`,
          TypeVehicle: typeVehicle,
          PhotoImage: null,
          ModifiedOn: currentTime,
        });

        return res.status(200).send("Data berhasil disimpan!");
      }
    });
  } catch (error) {
    console.error("Error menyimpan data:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat menyimpan data" });
  }
};

export const usersIdLocation = async (req, res) => {
  const userId = req.query.id;
  try {
    const userLocations = await UsersLocations.findAll({
      where: {
        UserId: userId,
      },
      attributes: ["LocationCode"],
    });

    const locationCodes = userLocations.map(
      (location) => location.LocationCode
    );

    res.status(200).json({
      success: true,
      locationCodes: locationCodes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to get location codes",
    });
  }
};

export const getDataOverNightLocation = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const orderBy = req.query.orderBy || "Status";
  const sortBy = req.query.sortBy || "ASC";
  const keyword = req.query.keyword || "";
  let locationCodes = [];

  try {
    locationCodes = req.query.location ? JSON.parse(req.query.location) : [];
  } catch (error) {
    console.error("Error parsing location:", error);
  }
  const date = req.query.date || "";

  try {
    // Buat objek where secara dinamis
    const where = {};
    const whereCount = {};

    if (!date) {
      return res.status(400).send("Date parameter is required");
    }

    // Kondisi lokasi
    if (locationCodes.length > 0) {
      where.LocationCode = { [Op.in]: locationCodes };
    }
    if (locationCodes.length > 0) {
      whereCount.LocationCode = { [Op.in]: locationCodes };
    }

    // Kondisi kata kunci
    if (keyword) {
      where[Op.and] = [
        ...Object.keys(where).map((key) => ({ [key]: where[key] })), // Menyalin kondisi where yang ada
        {
          [Op.or]: [
            { TransactionNo: { [Op.like]: `%${keyword}%` } },
            { VehiclePlateNo: { [Op.like]: `%${keyword}%` } },
            { Status: { [Op.like]: `%${keyword}%` } },
            { InTime: { [Op.like]: `%${keyword}%` } },
            // Tambahkan kolom lainnya jika diperlukan
          ],
        },
      ];

      whereCount[Op.and] = [
        ...Object.keys(where).map((key) => ({ [key]: where[key] })),
        {
          [Op.or]: [
            { TransactionNo: { [Op.like]: `%${keyword}%` } },
            { VehiclePlateNo: { [Op.like]: `%${keyword}%` } },
            { Status: { [Op.like]: `%${keyword}%` } },
            { InTime: { [Op.like]: `%${keyword}%` } },
            // Tambahkan kolom lainnya jika diperlukan
          ],
        },
      ];
    }

    // Kondisi tanggal
    if (date) {
      where.UploadedAt = {
        [Op.gte]: Sequelize.literal(`DATE('${date}')`),
        [Op.lt]: Sequelize.literal(`DATE_ADD(DATE('${date}'), INTERVAL 1 DAY)`),
      };

      whereCount.ModifiedOn = {
        [Op.gte]: Sequelize.literal(`DATE('${date}')`),
        [Op.lt]: Sequelize.literal(`DATE_ADD(DATE('${date}'), INTERVAL 1 DAY)`),
      };
    }

    // Buat objek queries untuk findAndCountAll
    const queries = {
      where,
      offset: (page - 1) * limit,
      limit,
      include: [
        {
          model: Location,
          attributes: ["Name"],
        },
      ],
      order: [[orderBy, sortBy]],
    };

    const result = await TransactionOverNights.findAndCountAll(queries);

    const summaryWhere = whereCount;

    const summary = await TransactionOverNightOficcers.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.literal("1")), "TotalCount"],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              "CASE WHEN Status = 'In Area' AND ModifiedOn >= DATE('" +
                date +
                "') AND ModifiedOn < DATE_ADD(DATE('" +
                date +
                "'), INTERVAL 1 DAY) THEN 1 ELSE 0 END"
            )
          ),
          "InAreaCount",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              "CASE WHEN TIMESTAMPDIFF(DAY, `CreatedAt`, `ModifiedOn`) > 1 THEN 1 ELSE 0 END"
            )
          ),
          "MoreThanOneDayCount",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal("CASE WHEN Status = 'Out' THEN 1 ELSE 0 END")
          ),
          "OutCount",
        ],
      ],
      where: {
        LocationCode: whereCount.LocationCode, // Menggunakan LocationCode
        ModifiedOn: {
          [Op.gte]: Sequelize.literal(`DATE('${date}')`),
          [Op.lt]: Sequelize.literal(
            `DATE_ADD(DATE('${date}'), INTERVAL 1 DAY)`
          ),
        },
      },
    });

    if (result) {
      const response = {
        success: true,
        totalPages: Math.ceil(result.count / limit),
        totalItems: result.count,
        summary: summary,
        data: result.rows,
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
  const locationCode = req.query.location || "";

  // Menentukan awal dan akhir hari ini berdasarkan zona waktu Asia/Jakarta
  const startOfDay = moment.tz("Asia/Jakarta").startOf("day").toDate();
  const endOfDay = moment.tz("Asia/Jakarta").endOf("day").toDate();
  // const startOfDay = moment(startDay).format();
  // const endOfDay = moment(endDay).format();

  console.log("Start of Day (Jakarta):", startOfDay); // Format bisa disesuaikan
  console.log("End of Day (Jakarta):", endOfDay);

  try {
    const queries = {
      where: {
        ...(locationCode && { LocationCode: locationCode }),
        ModifiedOn: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      offset: (page - 1) * limit,
      limit,
      order: [[orderBy, sortBy]],
      include: [
        {
          model: Location,
          attributes: ["Name"],
        },
      ],
    };

    const result = await TransactionOverNightOficcers.findAndCountAll(queries);

    const summaryQuery = `
      SELECT
          COALESCE(COUNT(VehiclePlateNo), 0) AS TotalCount,
          COALESCE(SUM(CASE WHEN Status = 'In Area' THEN 1 ELSE 0 END), 0) AS InareaCount,
          COALESCE(SUM(CASE WHEN Status = 'No vehicle' THEN 1 ELSE 0 END), 0) AS NovihicleCount,
          COALESCE(SUM(CASE WHEN Status = 'Out' THEN 1 ELSE 0 END), 0) AS OutCount
      FROM TransactionOverNightOficcers
      WHERE ModifiedOn BETWEEN :startOfDay AND :endOfDay
      ${locationCode ? `AND LocationCode = :locationCode` : ""};
    `;

    const summaryTypeQuery = `
      SELECT
          COALESCE(SUM(CASE WHEN TypeVehicle = 'MOTOR' THEN 1 ELSE 0 END), 0) AS Motor,
          COALESCE(SUM(CASE WHEN TypeVehicle = 'MOBIL' THEN 1 ELSE 0 END), 0) AS Mobil
      FROM TransactionOverNightOficcers
      WHERE ModifiedOn BETWEEN :startOfDay AND :endOfDay
      ${locationCode ? `AND LocationCode = :locationCode` : ""};
    `;

    const summary = await db.query(summaryQuery, {
      replacements: { startOfDay, endOfDay, locationCode },
      type: db.QueryTypes.SELECT,
    });

    const summaryType = await db.query(summaryTypeQuery, {
      replacements: { startOfDay, endOfDay, locationCode },
      type: db.QueryTypes.SELECT,
    });

    if (result) {
      const response = {
        success: true,
        totalPages: Math.ceil(result.count / limit),
        totalItems: result.count,
        summary,
        summaryType,
        data: result.rows,
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
  const locationCodes = req.query.location
    ? JSON.parse(req.query.location)
    : [];
  const date = req.query.date || "";
  try {
    const whereClause = {};

    // Kondisi lokasi
    if (locationCodes.length > 0) {
      whereClause.LocationCode = { [Sequelize.Op.in]: locationCodes };
    }

    // Buat kondisi tanggal menggunakan rentang waktu
    const dateCondition = date
      ? {
          ModifiedOn: {
            [Sequelize.Op.gte]: Sequelize.literal(`'${date} 00:00:00'`),
            [Sequelize.Op.lt]: Sequelize.literal(`'${date} 23:59:59'`),
          },
        }
      : null;
    console.log(dateCondition);
    const result = await TransactionOverNightOficcers.findAndCountAll({
      where: {
        ...whereClause,
        ...(dateCondition ? dateCondition : {}),
      },
      include: [
        {
          model: Location,
          attributes: ["Name"],
        },
      ],
    });

    if (result) {
      const workbook = new ExcelJs.Workbook();
      const worksheet = workbook.addWorksheet("Transaction OverNight");

      worksheet.columns = [
        { header: "No", key: "No", width: 5 },
        { header: "Lokasi", width: 35, key: "LocationCode" },
        { header: "Plat Nomor", width: 15, key: "VehiclePlateNo" },
        { header: "Gambar", width: 30, key: "PathPhotoImage" },
        { header: "Type Kendaraan", width: 20, key: "TypeVehicle" },
        { header: "Status", width: 10, key: "Status" },
        { header: "Petugas", width: 50, key: "ModifiedBy" },
        { header: "Tanggal Update", width: 20, key: "ModifiedOn" },
      ];

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });
      });

      for (const [index, value] of result.rows.entries()) {
        const row = worksheet.addRow({
          No: index + 1,
          LocationCode: value.RefLocation ? value.RefLocation.Name : "-",
          VehiclePlateNo: value.VehiclePlateNo || "-",
          PathPhotoImage: "-",
          TypeVehicle: value.TypeVehicle || "-",
          Status: value.Status,
          ModifiedBy: value.ModifiedBy,
          ModifiedOn: moment(value.ModifiedOn)
            .tz("Asia/Jakarta")
            .format("YYYY-MM-DD HH:mm:ss"),
        });

        if (value.PathPhotoImage) {
          const imagePath = path.join(
            process.cwd(),
            "uploads",
            path.basename(value.PathPhotoImage)
          );

          if (fs.existsSync(imagePath)) {
            const imageId = workbook.addImage({
              filename: imagePath,
              extension: "jpg",
            });

            worksheet.addImage(imageId, {
              tl: { col: 3, row: row.number - 1 },
              ext: { width: 100, height: 100 },
            });

            row.getCell("PathPhotoImage").value = "";
            worksheet.getRow(row.number).height = 80;
          } else {
            row.getCell("PathPhotoImage").value = "Gambar tidak tersedia";
          }
        } else {
          row.getCell("PathPhotoImage").value = "Gambar tidak tersedia";
        }

        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });
      }

      const fileName =
        locationCodes.length > 0 && date ? `${date}.xlsx` : `alldate.xlsx`;

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
    console.log("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
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
