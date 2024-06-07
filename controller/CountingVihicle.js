import { CountingVihicle } from "../models/CountingVihicle.js";
import { Op } from "sequelize";
import db from "../config/dbConfig.js";
import ExcelJs from "exceljs";
import XLSX from "xlsx";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

export const getAllData = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const orderBy = req.query.orderBy || "UpdatedAt";
  const sortBy = req.query.sortBy || "DESC";
  const keyword = req.query.keyword || "";
  const startDate = req.query.startDate || "";
  const endDate = req.query.endDate || "";

  try {
    const queries = {
      offset: (page - 1) * limit,
      limit,
    };

    if (keyword) {
      queries.where = {
        [Op.or]: [
          { LocationName: { [Op.like]: `%${keyword}%` } },
          { VihiclePlate: { [Op.like]: `%${keyword}%` } },
          { Status: { [Op.like]: `%${keyword}%` } },
          { InTime: { [Op.like]: `%${keyword}%` } },
          // Tambahkan kolom lainnya jika diperlukan
        ],
      };
    }

    if (startDate && endDate) {
      queries.where = {
        ...queries.where,
        InTime: {
          [Op.between]: [startDate, endDate],
        },
      };
    }

    if (orderBy) {
      queries.order = [[orderBy, sortBy]];
    }

    const result = await CountingVihicle.findAndCountAll({
      ...queries,
    });

    if (result) {
      const response = {
        success: true,
        totalPages: Math.ceil(result?.count / limit),
        totalItems: result?.count,
        // summary: summary,
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

export const storeGateIn = async (req, res) => {
  upload.fields([{ name: "foto1" }, { name: "foto2" }])(
    req,
    res,
    async (err) => {
      const { LocationName, InTime, Gate } = req.body;

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
      const plateRecognizeResults = [];

      for (let i = 1; i <= 2; i++) {
        let fieldName = "foto" + i;
        if (req.files[fieldName] && req.files[fieldName].length > 0) {
          let body = new FormData();
          body.append(
            "upload",
            fs.createReadStream(req.files[fieldName][0].path)
          );
          body.append("regions", "id");
          body.append("camera_id", "MAXXBOX-VIP-1");

          try {
            const plateRecognizeResponse = await fetch(
              "https://api.platerecognizer.com/v1/plate-reader/",
              {
                method: "POST",
                headers: {
                  Authorization:
                    "Token 2ee83fb34e74d1bd32772ac11129862e8f8161e1",
                },
                body: body,
              }
            );

            console.log(plateRecognizeResponse);

            if (!plateRecognizeResponse.ok) {
              throw new Error(
                `Error from Plate Recognizer API: ${plateRecognizeResponse.statusText}`
              );
            }

            const result = await plateRecognizeResponse.json();
            plateRecognizeResults.push(result);
            photoPaths.push(req.files[fieldName][0].path);
          } catch (error) {
            console.error(
              `Error from Plate Recognizer API for file ${req.files[fieldName][0].path}:`,
              error.message
            );
            plateRecognizeResults.push(null);
            photoPaths.push(null);
          }
        } else {
          plateRecognizeResults.push(null);
          photoPaths.push(null);
        }
      }

      const VihiclePlate1 = plateRecognizeResults[0].results[0].plate
        .toUpperCase()
        .replace(/\s/g, "");
      const VihiclePlate2 = plateRecognizeResults[1].results[0].plate
        .toUpperCase()
        .replace(/\s/g, "");
      const VihiclePlate =
        VihiclePlate1 != VihiclePlate2 ? VihiclePlate1 : VihiclePlate1;

      try {
        const findPlate = await RefCountingVIP.findAll({
          where: {
            VihiclePlate: VihiclePlate,
          },
        });

        let existingPlate = null;

        if (findPlate.length > 0) {
          existingPlate = findPlate.find(
            (entry) => entry.InTime && !entry.OutTime
          );
        }

        if (existingPlate) {
          const InTimeDate = new Date(existingPlate.dataValues.InTime);
          const OutTimeDate = new Date(InTime);
          const durationDate = OutTimeDate - InTimeDate;

          await existingPlate.update({
            Status: "Out",
            OutTime: InTime,
            Duration: durationDate,
            PathPhotoOut01: photoPaths[0],
            PathPhotoOut02: photoPaths[1],
            GateOut: Gate,
            UpdatedAt: new Date(),
          });
        } else {
          const insertData = {
            LocationName: LocationName,
            VihiclePlate: VihiclePlate1,
            InTime: InTime,
            PathPhotoIn01: photoPaths[0],
            PathPhotoIn02: photoPaths[1],
            GateIn: Gate,
            Status: "In",
          };

          const resultsData = await RefCountingVIP.create(insertData);

          const response = {
            code: 200,
            success: true,
            data: resultsData,
          };
          res.status(200).json(response);
        }
      } catch (error) {
        res.status(500).json({ message: `Terjadi kesalahan ${error}` });
      }
    }
  );
};
