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

function generateUniqueTransactionCode() {
  return new Promise((resolve, reject) => {
    const countQuery = "SELECT COUNT(1) AS total_rows FROM TransactionParking";

    connection.query(countQuery, (error, results) => {
      if (error) {
        reject(error);
        return;
      }

      const totalRows = results[0].total_rows;

      const transactionCode = generateTransactionCode(totalRows + 1);

      resolve(transactionCode);
    });
  });
}
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

function generateTransactionCode(totalRow) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  const day = ("0" + currentDate.getDate()).slice(-2);
  const dateCode = year + month + day;

  const randomCode = "ABC";

  const transactionCode = `${dateCode}${randomCode}${totalRow}`;

  return transactionCode;
}
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

module.exports = {
  connection,
  generateUniqueTransactionCode,
  generateTransactionCode,
  generateUniqueTransactionCodeValet,
};
