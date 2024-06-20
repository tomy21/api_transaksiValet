import cron from "node-cron";
import { Op } from "sequelize";
import moment from "moment";
import { TransactionOverNights } from "../models/TransactionOverNights.js";

// Fungsi untuk memperbarui `outTime`
export const updateOutTime = async () => {
  const yesterdayStart = moment().subtract(1, "days").startOf("day").toDate();
  const yesterdayEnd = moment().subtract(1, "days").endOf("day").toDate();

  try {
    await TransactionOverNights.update(
      {
        OutTime: new Date(),
        Status: "Out",
        Remaks: "Update By System",
      },
      {
        where: {
          ModifiedOn: {
            [Op.between]: [yesterdayStart, yesterdayEnd], // Rentang kemarin
          },
          OutTime: null,
        },
      }
    );
    console.log("OutTime updated successfully.");
  } catch (error) {
    console.error("Error updating outTime:", error);
  }
};

// Jadwal tugas setiap hari pada pukul 10 pagi
cron.schedule("0 9 * * *", updateOutTime, {
  scheduled: true,
  timezone: "Asia/Jakarta",
});

// Pastikan scheduler tetap berjalan
console.log("Scheduler is running...");
