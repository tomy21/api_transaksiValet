import { TransactionValet } from "../models/TransactionValet.js";
import { Op, Sequelize, where, QueryTypes } from "sequelize";
import db from "../config/dbConfig.js";
import { Location } from "../models/RefLocation.js";
import ExcelJs from "exceljs";

export const ReportInOut = async (req, res) => {
  try {
    const LocationCode = req.body.LocationCode;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    console.log(LocationCode);
    const allTransaction = await TransactionValet.findAll({
      where: {
        LocationCode: LocationCode,
        CreatedOn: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ["Id", "LocationCode", "CreatedOn"],
    });
    res.status(200).json({ data: allTransaction });
  } catch (error) {
    console.log(error);
  }
};

export const dataDailyDashboard = async (req, res) => {
  const LocationCode = req.query.locationCode || null;
  const date = req.query.date || new Date();

  const dateObject = new Date(date.toString());
  const year = dateObject.getFullYear();
  const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObject.getDate().toString().padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  try {
    const sequelize = db;

    if (!formattedDate) {
      return res.status(400).send("Date parameter is required");
    }

    const whereClause = LocationCode ? { LocationCode: LocationCode } : {};

    const data = await TransactionValet.findAll({
      attributes: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("InTime"), "%Y-%m-%d"),
          "Date",
        ],
        [sequelize.fn("DATE_FORMAT", sequelize.col("InTime"), "%H"), "Hour"],
        [sequelize.fn("COUNT", sequelize.col("TrxNo")), "TotalTrx"],
        [sequelize.fn("SUM", sequelize.col("Tariff")), "TotalTariff"],
        [
          sequelize.literal(
            "SUM(CASE WHEN OutTime IS NOT NULL THEN 1 ELSE 0 END)"
          ),
          "TotalOut",
        ],
        [
          sequelize.literal(
            "SUM(CASE WHEN InTime IS NOT NULL THEN 1 ELSE 0 END)"
          ),
          "TotalIn",
        ],
        [
          sequelize.literal("SUM(CASE WHEN OutTime IS NULL THEN 1 ELSE 0 END)"),
          "TotalON",
        ],
        [
          sequelize.literal(
            "SUM(CASE WHEN OutTime IS NOT NULL AND DATE(InTime) != DATE(OutTime) THEN 1 ELSE 0 END)"
          ),
          "TotalTrxPrevious",
        ],
      ],

      where: {
        ...whereClause,
        InTime: {
          [Op.gte]: sequelize.fn("DATE", formattedDate),
          [Op.lt]: sequelize.fn(
            "DATE_ADD",
            sequelize.fn("DATE", formattedDate),
            sequelize.literal("INTERVAL 1 DAY")
          ),
        },
      },
      group: [
        sequelize.fn("DATE_FORMAT", sequelize.col("InTime"), "%Y-%m-%d"),
        sequelize.fn("DATE_FORMAT", sequelize.col("InTime"), "%H"),
      ],
    });

    const locationCondition = LocationCode
      ? `LocationCode = :LocationCode`
      : `1=1`;

    const inQuery = `
    SELECT
      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = :formattedDate AND ${locationCondition} ) AS totalTrxIn,
      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = DATE_SUB(:formattedDate, INTERVAL 1 DAY) AND ${locationCondition} ) AS previousIn,

      (SELECT SUM(Tariff) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = :formattedDate AND ${locationCondition} ) AS totalTariff,
      (SELECT SUM(Tariff) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = DATE_SUB(:formattedDate, INTERVAL 1 DAY) AND ${locationCondition} ) AS previousTariff,

      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(OutTime) = :formattedDate AND DATE(OutTime) IS NOT NULL AND ${locationCondition} ) AS totalTrxOut,
      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(OutTime) = DATE_SUB(:formattedDate, INTERVAL 1 DAY) AND DATE(OutTime) IS NOT NULL AND ${locationCondition} ) AS previousOut,
      
      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = :formattedDate AND ParkingType = 1 AND ${locationCondition} ) AS Valet,
      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = DATE_SUB(:formattedDate, INTERVAL 1 DAY) AND ParkingType = 1 AND ${locationCondition} ) AS previousValet,
      
      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = :formattedDate AND ParkingType = 2  AND ${locationCondition} ) AS VIP,
      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = DATE_SUB(:formattedDate, INTERVAL 1 DAY) AND ParkingType = 2 AND ${locationCondition} ) AS previousVIP,
      
      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = :formattedDate AND ParkingType = 3 AND ${locationCondition} ) AS VVIP,
      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = DATE_SUB(:formattedDate, INTERVAL 1 DAY) AND ParkingType = 3 AND ${locationCondition} ) AS previousVVIP,

      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = :formattedDate AND DATE(InTime) > DATE(OutTime) AND ${locationCondition} ) AS totalOverDay,
      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = DATE_SUB(:formattedDate, INTERVAL 1 DAY) AND DATE(InTime) > DATE(OutTime) AND ${locationCondition} ) AS previousOverDay,

      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = :formattedDate AND DATE(OutTime) IS NULL AND ${locationCondition} ) AS totalON,
      (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = DATE_SUB(:formattedDate, INTERVAL 1 DAY) AND DATE(OutTime) IS NULL AND ${locationCondition} ) AS previousON,

      (SELECT AVG(TIMESTAMPDIFF(MINUTE, InTime, OutTime)) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = :formattedDate AND OutTime IS NOT NULL AND ${locationCondition} ) AS DurationAvg,

      (SELECT AVG(TIMESTAMPDIFF(MINUTE, InTime, OutTime)) FROM skybillingdb.TransactionParkingValet WHERE DATE(InTime) = DATE_SUB(:formattedDate, INTERVAL 1 DAY) AND DATE(OutTime) IS NOT NULL AND ${locationCondition} ) AS previousDurationAvg;
    `;

    const summary = await sequelize.query(inQuery, {
      type: QueryTypes.SELECT,
      replacements: { formattedDate, LocationCode },
    });

    const sqlQuery = `
      SELECT 
          COUNT(TrxNo) AS TotalTrx,
          SUM(Tariff) AS TotalTariff,
          RefLocation.Name
      FROM skybillingdb.TransactionParkingValet
      JOIN skybillingdb.RefLocation ON TransactionParkingValet.LocationCode = RefLocation.Code
      WHERE DATE(InTime) = :formattedDate 
      GROUP BY RefLocation.Name
      ORDER BY TotalTrx DESC;
      `;

    const result = await sequelize.query(sqlQuery, {
      type: QueryTypes.SELECT,
      replacements: { formattedDate },
    });

    const sqlListOfficer = `
      SELECT 
          COUNT(TrxNo) AS TotalTrx,
          SUM(Tariff) AS TotalTariff,
          Users.Name,
          RefLocation.ShortName
      FROM skybillingdb.TransactionParkingValet
      JOIN skybillingdb.Users ON TransactionParkingValet.ReceivedUserId = Users.Id
      JOIN skybillingdb.RefLocation ON TransactionParkingValet.LocationCode = RefLocation.Code
      WHERE DATE(InTime) = :formattedDate 
      GROUP BY Users.Name
      ORDER BY TotalTrx DESC;
      `;

    const resultOfficer = await sequelize.query(sqlListOfficer, {
      type: QueryTypes.SELECT,
      replacements: { formattedDate },
    });

    const calculatePercentage = (current, previous) => {
      if (previous === 0) return 0; // Menghindari pembagian dengan nol
      return ((current - previous) / previous) * 100;
    };

    const duration =
      summary[0].DurationAvg === null ? 0 : parseFloat(summary[0].DurationAvg);
    const prevDuration =
      summary[0].previousDurationAvg === null
        ? 0
        : parseFloat(summary[0].previousDurationAvg);

    const response = {
      summary: summary,
      detail: data,
      comparison: {
        tariff: calculatePercentage(
          summary[0].totalTariff,
          summary[0].previousTariff
        ),
        trxIn: calculatePercentage(
          summary[0].totalTrxIn,
          summary[0].previousIn
        ),
        trxOut: calculatePercentage(
          summary[0].totalTrxOut,
          summary[0].previousOut
        ),
        valet: calculatePercentage(summary[0].Valet, summary[0].previousValet),
        vip: calculatePercentage(summary[0].VIP, summary[0].previousVIP),
        vvip: calculatePercentage(summary[0].VVIP, summary[0].previousVVIP),
        totalON: calculatePercentage(summary[0].totalON, summary[0].previousON),
        totalOverDay: calculatePercentage(
          summary[0].totalOverDay,
          summary[0].previousOverDay
        ),
        duration: calculatePercentage(duration, prevDuration),
      },
      listLocation: result,
      listOfficer: resultOfficer,
    };
    res.status(200).json({ response });
  } catch (error) {
    console.log(error);
  }
};

export const dataMonthDashboard = async (req, res) => {
  const LocationCode = req.query.locationCode || null;
  const month = req.query.month || new Date().getMonth() + 1; // Default ke bulan saat ini jika tidak ada parameter
  const year = req.query.year || new Date().getFullYear(); // Default ke tahun saat ini jika tidak ada parameter

  const formattedMonth = `${year}-${month.toString().padStart(2, "0")}`;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  try {
    const sequelize = db;

    const whereClause = LocationCode ? { LocationCode: LocationCode } : {};

    const data = await TransactionValet.findAll({
      attributes: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("InTime"), "%Y-%m-%d"),
          "Date",
        ],
        [sequelize.fn("COUNT", sequelize.col("TrxNo")), "TotalTrx"],
        [sequelize.fn("SUM", sequelize.col("Tariff")), "TotalTariff"],
        [
          sequelize.literal(
            "SUM(CASE WHEN OutTime IS NOT NULL THEN 1 ELSE 0 END)"
          ),
          "TotalOut",
        ],
        [
          sequelize.literal(
            "SUM(CASE WHEN InTime IS NOT NULL THEN 1 ELSE 0 END)"
          ),
          "TotalIn",
        ],
        [
          sequelize.literal("SUM(CASE WHEN OutTime IS NULL THEN 1 ELSE 0 END)"),
          "TotalON",
        ],
        [
          sequelize.literal(
            "SUM(CASE WHEN OutTime IS NOT NULL AND DATE(InTime) != DATE(OutTime) THEN 1 ELSE 0 END)"
          ),
          "TotalTrxPrevious",
        ],
      ],
      where: {
        ...whereClause,
        InTime: {
          [Op.between]: [startDate, endDate], // sesuaikan dengan rentang waktu bulanan yang sesuai
        },
      },
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("InTime"), "%Y-%m-%d")], // grup berdasarkan tanggal
    });

    if (data.length === 0) {
      return res.status(404).send("No data found for the given month");
    }

    const locationCondition = LocationCode
      ? `LocationCode = :LocationCode`
      : `1=1`;

    const inQuery = `
      SELECT
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :month AND YEAR(InTime) = :year AND ${locationCondition} ) AS totalTrxIn,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :previousMonth AND YEAR(InTime) = :previousYear AND ${locationCondition} ) AS previousIn,

        (SELECT SUM(Tariff) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :month AND YEAR(InTime) = :year AND ${locationCondition} ) AS totalTariff,
        (SELECT SUM(Tariff) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :previousMonth AND YEAR(InTime) = :previousYear AND ${locationCondition} ) AS previousTariff,

        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(OutTime) = :month AND YEAR(OutTime) = :year AND ${locationCondition} AND DATE(OutTime) IS NOT NULL ) AS totalTrxOut,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(OutTime) = :previousMonth AND YEAR(OutTime) = :previousYear AND ${locationCondition} AND DATE(OutTime) IS NOT NULL ) AS previousOut,
        
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :month AND YEAR(InTime) = :year AND ParkingType = 1 AND ${locationCondition} ) AS Valet,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :previousMonth AND YEAR(InTime) = :previousYear AND ParkingType = 1 AND ${locationCondition} ) AS previousValet,
        
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :month AND YEAR(InTime) = :year AND ParkingType = 2 AND ${locationCondition} ) AS VIP,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :previousMonth AND YEAR(InTime) = :previousYear AND ParkingType = 2 AND ${locationCondition} ) AS previousVIP,
        
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :month AND YEAR(InTime) = :year AND ParkingType = 3 AND ${locationCondition} ) AS VVIP,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :previousMonth AND YEAR(InTime) = :previousYear AND ParkingType = 3 AND ${locationCondition} ) AS previousVVIP,

        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :month AND YEAR(InTime) = :year AND DATE(InTime) > DATE(OutTime) AND ${locationCondition} ) AS totalOverDay,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :previousMonth AND YEAR(InTime) = :previousYear AND DATE(InTime) > DATE(OutTime) AND ${locationCondition} ) AS previousOverDay,

        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :month AND YEAR(InTime) = :year AND DATE(OutTime) IS NULL AND ${locationCondition} ) AS totalON,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :previousMonth AND YEAR(InTime) = :previousYear AND DATE(OutTime) IS NULL AND ${locationCondition} ) AS previousON,

        (SELECT AVG(TIMESTAMPDIFF(MINUTE, InTime, OutTime)) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :month AND YEAR(InTime) = :year AND OutTime IS NOT NULL AND ${locationCondition} ) AS DurationAvg,
        (SELECT AVG(TIMESTAMPDIFF(MINUTE, InTime, OutTime)) FROM skybillingdb.TransactionParkingValet WHERE MONTH(InTime) = :previousMonth AND YEAR(InTime) = :previousYear AND DATE(OutTime) IS NOT NULL AND ${locationCondition} ) AS previousDurationAvg;
    `;

    const previousMonth = month === 1 ? 12 : month - 1;
    const previousYear = month === 1 ? year - 1 : year;

    const summary = await sequelize.query(inQuery, {
      type: QueryTypes.SELECT,
      replacements: { month, year, previousMonth, previousYear, LocationCode },
    });

    const sqlQuery = `
      SELECT 
          COUNT(TrxNo) AS TotalTrx,
          SUM(Tariff) AS TotalTariff,
          RefLocation.Name
      FROM skybillingdb.TransactionParkingValet
      JOIN skybillingdb.RefLocation ON TransactionParkingValet.LocationCode = RefLocation.Code
      WHERE MONTH(InTime) = :month AND YEAR(InTime) = :year AND ${locationCondition}
      GROUP BY RefLocation.Name
      ORDER BY TotalTrx DESC;
    `;

    const result = await sequelize.query(sqlQuery, {
      type: QueryTypes.SELECT,
      replacements: { month, year, LocationCode },
    });

    const sqlListOfficer = `
      SELECT 
          COUNT(TrxNo) AS TotalTrx,
          SUM(Tariff) AS TotalTariff,
          Users.Name,
          RefLocation.ShortName
      FROM skybillingdb.TransactionParkingValet
      JOIN skybillingdb.Users ON TransactionParkingValet.ReceivedUserId = Users.Id
      JOIN skybillingdb.RefLocation ON TransactionParkingValet.LocationCode = RefLocation.Code
      WHERE MONTH(InTime) = :month AND YEAR(InTime) = :year AND ${locationCondition}
      GROUP BY Users.Name
      ORDER BY TotalTrx DESC;
    `;

    const resultOfficer = await sequelize.query(sqlListOfficer, {
      type: QueryTypes.SELECT,
      replacements: { month, year, LocationCode },
    });

    const calculatePercentage = (current, previous) => {
      if (previous === 0) return 0; // Menghindari pembagian dengan nol
      return ((current - previous) / previous) * 100;
    };

    const duration =
      summary[0].DurationAvg === null ? 0 : parseFloat(summary[0].DurationAvg);
    const prevDuration =
      summary[0].previousDurationAvg === null
        ? 0
        : parseFloat(summary[0].previousDurationAvg);

    const response = {
      summary: summary,
      detail: data,
      comparison: {
        tariff: calculatePercentage(
          summary[0].totalTariff,
          summary[0].previousTariff
        ),
        trxIn: calculatePercentage(
          summary[0].totalTrxIn,
          summary[0].previousIn
        ),
        trxOut: calculatePercentage(
          summary[0].totalTrxOut,
          summary[0].previousOut
        ),
        valet: calculatePercentage(summary[0].Valet, summary[0].previousValet),
        vip: calculatePercentage(summary[0].VIP, summary[0].previousVIP),
        vvip: calculatePercentage(summary[0].VVIP, summary[0].previousVVIP),
        totalON: calculatePercentage(summary[0].totalON, summary[0].previousON),
        totalOverDay: calculatePercentage(
          summary[0].totalOverDay,
          summary[0].previousOverDay
        ),
        duration: calculatePercentage(duration, prevDuration),
      },
      listLocation: result,
      listOfficer: resultOfficer,
    };

    res.status(200).json({ response });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const dailyDasboard = async (req, res) => {
  try {
    const sequelize = db;
    const locationCode = req.query.locationCode ? req.query.locationCode : "*";
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    // Summary InTime
    const results = await TransactionValet.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("InTime"), "%H:00"), "Jam"],
        [sequelize.fn("SUM", sequelize.col("Tariff")), "TotalIncome"],
        [sequelize.fn("COUNT", sequelize.col("TrxNo")), "TotalTrx"],
        [
          sequelize.literal(
            "SUM(CASE WHEN DATE(OutTime) != DATE(InTime) THEN 1 ELSE 0 END)"
          ),
          "TotalON",
        ],
      ],
      where: {
        InTime: {
          [Op.eq]: date,
        },
        ...(locationCode !== "*" && { LocationCode: locationCode }),
      },
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("InTime"), "%H")],
    });

    // Summary OutTime
    const listOut = await TransactionValet.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("OutTime"), "%H:00"), "Jam"],
        [sequelize.fn("SUM", sequelize.col("Tariff")), "TotalIncome"],
        [sequelize.fn("COUNT", sequelize.col("TrxNo")), "TotalTrx"],
      ],
      where: {
        OutTime: {
          [Op.eq]: date,
        },
        [Op.and]: [
          sequelize.where(
            sequelize.fn("DATE", sequelize.col("OutTime")),
            sequelize.fn("DATE", sequelize.col("InTime"))
          ),
          sequelize.where(
            sequelize.fn("HOUR", sequelize.col("InTime")),
            sequelize.fn("HOUR", sequelize.col("OutTime"))
          ),
        ],
        ...(locationCode !== "*" && { LocationCode: locationCode }),
      },
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("OutTime"), "%H")],
    });

    // Query Count
    const queryCount = await sequelize.query(
      `
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
        COALESCE(AVG(DurationAvgPrevious), 0) AS DurationAvgPrevious,
        COALESCE(SUM(TotalTrxOut), 0) AS TotalTrxOut,
        COALESCE(SUM(TotalTrxOutPrevious), 0) AS TotalTrxOutPrevious,
        COALESCE(SUM(TotalOn), 0) AS TotalOn,
        COALESCE(SUM(TotalOut_H1), 0) AS TotalOut_H1
      FROM (
        SELECT 
          SUM(CASE WHEN DATE(InTime) = :selectedDate THEN Tariff ELSE 0 END) AS TotalIncome,
          SUM(CASE WHEN DATE(InTime) = DATE_SUB(:selectedDate, INTERVAL 1 DAY) THEN Tariff ELSE 0 END) AS TotalIncomePrevious,
          COUNT(CASE WHEN DATE(InTime) = :selectedDate THEN TrxNo END) AS TotalTrx,
          COUNT(CASE WHEN DATE(InTime) = DATE_SUB(:selectedDate, INTERVAL 1 DAY) THEN TrxNo END) AS TotalTrxPrevious,
          COUNT(CASE WHEN DATE(OutTime) = :selectedDate THEN TrxNo END) AS TotalTrxOut,
          COUNT(CASE WHEN DATE(OutTime) = DATE_SUB(:selectedDate, INTERVAL 1 DAY) THEN TrxNo END) AS TotalTrxOutPrevious,
          COUNT(CASE WHEN DATE(InTime) = :selectedDate AND ParkingType = '3' THEN TrxNo END) AS TotalVIPTrx,
          COUNT(CASE WHEN DATE(InTime) = DATE_SUB(:selectedDate, INTERVAL 1 DAY) AND ParkingType = '3' THEN TrxNo END) AS TotalVIPTrxPrevious,
          COUNT(CASE WHEN DATE(InTime) = :selectedDate AND ParkingType IN ('1', '2') THEN TrxNo END) AS TotalValetTrx,
          COUNT(CASE WHEN DATE(InTime) = DATE_SUB(:selectedDate, INTERVAL 1 DAY) AND ParkingType IN ('1', '2') THEN TrxNo END) AS TotalValetTrxPrevious,
          AVG(CASE WHEN DATE(InTime) = :selectedDate THEN TIMESTAMPDIFF(SECOND, InTime, OutTime) END) AS DurationAvg,
          AVG(CASE WHEN DATE(InTime) = DATE_SUB(:selectedDate, INTERVAL 1 DAY) THEN TIMESTAMPDIFF(SECOND, InTime, OutTime) END) AS DurationAvgPrevious,
          COUNT(CASE WHEN DATE(InTime) = :selectedDate AND DATE(OutTime) > DATE(InTime) AND DATE(InTime) IS NOT NULL THEN TrxNo END ) AS TotalOut_H1,
          COUNT(CASE WHEN DATE(InTime) = :selectedDate AND DATE(OutTime) IS NULL THEN TrxNo END ) AS TotalOn
        FROM TransactionParkingValet
        WHERE ${locationCode === "*" ? "1" : "LocationCode = :locationCode "}
        AND DATE(InTime) IN (:selectedDate, DATE_SUB(:selectedDate, INTERVAL 1 DAY))
      ) AS subquery;
      `,
      {
        replacements: { selectedDate: date, locationCode },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // List Location
    const listLocation = await TransactionValet.findAll({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("TrxNo")), "TotalTrx"],
        [sequelize.fn("SUM", sequelize.col("Tariff")), "TotalTariff"],
        [sequelize.col("RefLocation.Name"), "Name"],
      ],
      include: [
        {
          model: Location,
          attributes: [],
        },
      ],
      where: {
        InTime: {
          [Op.eq]: date,
        },
        ...(locationCode !== "*" && { LocationCode: locationCode }),
      },
      group: ["RefLocation.Name"],
      order: [[sequelize.fn("COUNT", sequelize.col("TrxNo")), "DESC"]],
    });

    // Response construction
    const response = {
      code: 200,
      message: "Success Get Report",
      totalTrx: queryCount[0],
      summary: results,
      summaryOut: listOut,
      listArea: listLocation,
    };
    res.status(200).json(response);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Failed to process request");
  }
};

export const exportExcel = async (req, res) => {
  try {
    const sequelize = db;
    const locationCode = req.query.LocationCode || null;
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    const query = {
      where: {},
    };

    if (locationCode) {
      query.where.LocationCode = locationCode;
    }

    if (startDate && endDate) {
      const startDateUTC = new Date(startDate).toISOString();
      const endDatePlusOneDay = new Date(endDate);
      endDatePlusOneDay.setDate(endDatePlusOneDay.getDate() + 1);

      query.where = {
        ...query.where,
        InTime: {
          [Op.between]: [startDateUTC, endDatePlusOneDay.toISOString()],
        },
      };
    }

    const result = await TransactionValet.findAll({ ...query });

    if (result) {
      const workbook = new ExcelJs.Workbook();
      const worksheet = workbook.addWorksheet("TransactionValet");

      worksheet.columns = [
        { header: "No", key: "No", width: 5 },
        { header: "Transaction Code", width: 20, key: "TrxNo" },
        { header: "Location Code", width: 15, key: "LocationCode" },
        { header: "Ticket Number", width: 30, key: "TicketNumber" },
        { header: "Vehicle Plate", width: 15, key: "VehiclePlate" },
        { header: "Tariff", width: 10, key: "Tariff" },
        { header: "Parking Type", width: 15, key: "ParkingType" },
        { header: "In Time", width: 15, key: "InTime" },
        { header: "Out Time", width: 15, key: "OutTime" },
        { header: "Payment Time", width: 15, key: "Payment" },
      ];

      result.forEach((value, index) => {
        worksheet.addRow({
          No: index + 1,
          TrxNo: value.TrxNo,
          LocationCode: value.LocationCode,
          TicketNumber: value.TicketNumber,
          Tariff: value.Tariff,
          VehiclePlate: value.VehiclePlate ? value.VehiclePlate : "-",
          ParkingType:
            value.ParkingType === 1
              ? "Casual"
              : value.ParkingType === 2
              ? "VIP"
              : "VVIP",
          InTime: value.InTime,
          OutTime: value.OutTime,
          Payment: value.PaymentOn,
        });
      });

      const fileName =
        locationCode && startDate
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

export const dataYearlyDashboard = async (req, res) => {
  const LocationCode = req.query.locationCode || null;
  const year = req.query.year || new Date().getFullYear();
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  try {
    const sequelize = db;

    const whereClause = LocationCode ? { LocationCode: LocationCode } : {};

    const data = await TransactionValet.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("InTime"), "%Y-%m"), "Year"],
        [sequelize.fn("COUNT", sequelize.col("TrxNo")), "TotalTrx"],
        [sequelize.fn("SUM", sequelize.col("Tariff")), "TotalTariff"],
        [
          sequelize.literal(
            "SUM(CASE WHEN OutTime IS NOT NULL THEN 1 ELSE 0 END)"
          ),
          "TotalOut",
        ],
        [
          sequelize.literal(
            "SUM(CASE WHEN InTime IS NOT NULL THEN 1 ELSE 0 END)"
          ),
          "TotalIn",
        ],
        [
          sequelize.literal("SUM(CASE WHEN OutTime IS NULL THEN 1 ELSE 0 END)"),
          "TotalON",
        ],
        [
          sequelize.literal(
            "SUM(CASE WHEN OutTime IS NOT NULL AND DATE(InTime) != DATE(OutTime) THEN 1 ELSE 0 END)"
          ),
          "TotalTrxPrevious",
        ],
      ],
      where: {
        ...whereClause,
        InTime: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("InTime"), "%Y-%m")],
    });

    if (data.length === 0) {
      return res.status(404).send("No data found for the given year");
    }

    const locationCondition = LocationCode
      ? `LocationCode = :LocationCode`
      : `1=1`;

    const inQuery = `
      SELECT
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :year AND ${locationCondition} ) AS totalTrxIn,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :previousYear AND ${locationCondition} ) AS previousIn,

        (SELECT SUM(Tariff) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :year AND ${locationCondition} ) AS totalTariff,
        (SELECT SUM(Tariff) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :previousYear AND ${locationCondition} ) AS previousTariff,

        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(OutTime) = :year AND ${locationCondition} AND DATE(OutTime) IS NOT NULL ) AS totalTrxOut,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(OutTime) = :previousYear AND ${locationCondition} AND DATE(OutTime) IS NOT NULL ) AS previousOut,

        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :year AND ParkingType = 1 AND ${locationCondition} ) AS Valet,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :previousYear AND ParkingType = 1 AND ${locationCondition} ) AS previousValet,

        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :year AND ParkingType = 2 AND ${locationCondition} ) AS VIP,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :previousYear AND ParkingType = 2 AND ${locationCondition} ) AS previousVIP,

        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :year AND ParkingType = 3 AND ${locationCondition} ) AS VVIP,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :previousYear AND ParkingType = 3 AND ${locationCondition} ) AS previousVVIP,

        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :year AND DATE(InTime) > DATE(OutTime) AND ${locationCondition} ) AS totalOverDay,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :previousYear AND DATE(InTime) > DATE(OutTime) AND ${locationCondition} ) AS previousOverDay,

        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :year AND DATE(OutTime) IS NULL AND ${locationCondition} ) AS totalON,
        (SELECT COUNT(TrxNo) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :previousYear AND DATE(OutTime) IS NULL AND ${locationCondition} ) AS previousON,

        (SELECT AVG(TIMESTAMPDIFF(MINUTE, InTime, OutTime)) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :year AND OutTime IS NOT NULL AND ${locationCondition} ) AS DurationAvg,
        (SELECT AVG(TIMESTAMPDIFF(MINUTE, InTime, OutTime)) FROM skybillingdb.TransactionParkingValet WHERE YEAR(InTime) = :previousYear AND DATE(OutTime) IS NOT NULL AND ${locationCondition} ) AS previousDurationAvg;
    `;

    const previousYear = year - 1;

    const summary = await sequelize.query(inQuery, {
      type: QueryTypes.SELECT,
      replacements: { year, previousYear, LocationCode },
    });

    // console.log("Summary found:", summary);

    const sqlQuery = `
      SELECT 
          COUNT(TrxNo) AS TotalTrx,
          SUM(Tariff) AS TotalTariff,
          RefLocation.Name
      FROM skybillingdb.TransactionParkingValet
      JOIN skybillingdb.RefLocation ON TransactionParkingValet.LocationCode = RefLocation.Code
      WHERE YEAR(InTime) = :year AND ${locationCondition}
      GROUP BY RefLocation.Name
      ORDER BY TotalTrx DESC;
    `;

    const result = await sequelize.query(sqlQuery, {
      type: QueryTypes.SELECT,
      replacements: { year, LocationCode },
    });

    const sqlListOfficer = `
      SELECT
          COUNT(TrxNo) AS TotalTrx,
          SUM(Tariff) AS TotalTariff,
          Users.Name,
          RefLocation.ShortName
      FROM skybillingdb.TransactionParkingValet
      JOIN skybillingdb.Users ON TransactionParkingValet.ReceivedUserId = Users.Id
      JOIN skybillingdb.RefLocation ON TransactionParkingValet.LocationCode = RefLocation.Code
      WHERE YEAR(InTime) = :year AND ${locationCondition}
      GROUP BY Users.Name
      ORDER BY TotalTrx DESC;
    `;

    const resultOfficer = await sequelize.query(sqlListOfficer, {
      type: QueryTypes.SELECT,
      replacements: { year, LocationCode },
    });

    const calculatePercentage = (current, previous) => {
      if (previous === 0) return 0; // Menghindari pembagian dengan nol
      return ((current - previous) / previous) * 100;
    };

    const duration =
      summary[0].DurationAvg === null ? 0 : parseFloat(summary[0].DurationAvg);
    const prevDuration =
      summary[0].previousDurationAvg === null
        ? 0
        : parseFloat(summary[0].previousDurationAvg);

    const response = {
      summary: summary,
      detail: data,
      comparison: {
        tariff: calculatePercentage(
          summary[0].totalTariff,
          summary[0].previousTariff
        ),
        trxIn: calculatePercentage(
          summary[0].totalTrxIn,
          summary[0].previousIn
        ),
        trxOut: calculatePercentage(
          summary[0].totalTrxOut,
          summary[0].previousOut
        ),
        valet: calculatePercentage(summary[0].Valet, summary[0].previousValet),
        vip: calculatePercentage(summary[0].VIP, summary[0].previousVIP),
        vvip: calculatePercentage(summary[0].VVIP, summary[0].previousVVIP),
        totalON: calculatePercentage(summary[0].totalON, summary[0].previousON),
        totalOverDay: calculatePercentage(
          summary[0].totalOverDay,
          summary[0].previousOverDay
        ),
        duration: calculatePercentage(duration, prevDuration),
      },
      listLocation: result,
      listOfficer: resultOfficer,
    };

    res.status(200).json({ response });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
