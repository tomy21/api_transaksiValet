const mysql = require("mysql");
require("dotenv").config();

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  multipleStatements: true,
});

function generateUniqueTransactionCode(locationCode) {
  return new Promise((resolve, reject) => {
    const countQuery = "SELECT COUNT(1) AS total_rows FROM Users";

    connection.query(countQuery, (error, results) => {
      if (error) {
        reject(error);
        return;
      }

      const totalRows = results[0].total_rows;

      const transactionCode = generateTransactionCode(
        totalRows + 1,
        locationCode
      );

      resolve(transactionCode);
    });
  });
}

//generate transaksi valet
function generateUniqueTransactionCodeValet() {
  return new Promise((resolve, reject) => {
    const countQuery =
      "SELECT COUNT(1) AS total_rows FROM TransactionParkingValet";

    connection.query(countQuery, (error, results) => {
      if (error) {
        reject(error);
        return;
      }

      const totalRows = results[0].total_rows;

      const transactionCode = generateTransactionCodeValet(totalRows + 1);

      resolve(transactionCode);
    });
  });
}

function generateTransactionCode(totalRow, locationCode) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  const day = ("0" + currentDate.getDate()).slice(-2);
  const dateCode = year + month + day;

  const randomCode = locationCode;

  const transactionCode = `${dateCode}${randomCode}${totalRow}`;

  return transactionCode;
}

//Generate code valet
function generateTransactionCodeValet(totalRow) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  const day = ("0" + currentDate.getDate()).slice(-2);
  const hours = ("0" + currentDate.getHours()).slice(-2);
  const minutes = ("0" + currentDate.getMinutes()).slice(-2);
  const seconds = ("0" + currentDate.getSeconds()).slice(-2);

  const dateCode = `${year}${month}${day}${hours}${minutes}${seconds}`;

  const paddedTotalRow = ("00000000" + totalRow).slice(-8); // Mengisi nol di depan

  const transactionCode = `${dateCode}${paddedTotalRow}`;

  return transactionCode;
}

function generateKeyNumber(locationCode) {
  return new Promise((resolve, reject) => {
    const today = new Date().toISOString().split("T")[0];

    const query = `SELECT NoKeySlot FROM TransactionParkingValet WHERE DATE(InTime) = '${today}' AND LocationCode = '${locationCode}'`;

    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        const usedKeyNumbers = results.map((row) => row.NoKeySlot);
        const allKeyNumbers = new Set([...Array(300).keys()].map((i) => i + 1));

        // Temukan nomor kunci yang tersedia
        usedKeyNumbers.forEach((used) => allKeyNumbers.delete(used));

        // Jika masih ada nomor kunci yang tersedia, kembalikan nomor kunci terkecil
        if (allKeyNumbers.size > 0) {
          resolve(allKeyNumbers.values().next().value);
        } else {
          // Jika semua nomor kunci terpakai, kembalikan nomor kunci terakhir + 1
          const lastUsedKeyNumber = Math.max(...usedKeyNumbers);
          resolve(lastUsedKeyNumber + 1);
        }
      }
    });
  });
}

module.exports = {
  connection,
  generateUniqueTransactionCode,
  generateKeyNumber,
  // generateTransactionCode,
  generateUniqueTransactionCodeValet,
};
