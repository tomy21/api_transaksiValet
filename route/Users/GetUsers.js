const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = express.Router();
const connection = require("../../config/dbConfig.js");

router.use(bodyParser.json());
router.use(cors());

router.get("/getUsers", (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const query = `
    SELECT 
        U.Id, 
        U.SetupRoleId, 
        U.IpAddress,
        U.UserCode, 
        U.Name, 
        U.Gender,
        U.Birthdate,
        U.Username, 
        U.Email, 
        U.Phone,
        U.HandPhone, 
        U.Whatsapp, 
        U.Photo,
        U.Password, 
        U.PasswordExpired,
        U.IsFirstpassword, 
        U.FlagAllLocation, 
        U.MerchantId, 
        U.CreatedOn,
        U.CreatedBy, 
        U.UpdatedOn, 
        U.UpdatedBy,
        U.UserStatus,
        U.ResetPassword,
        U.ResetPasswordExpired,
        U.DeleteAccountOTP, 
        U.DeleteStatus, 
        U.DeleteReason,
        U.LastActivity,
        SetupRole.Description
    FROM
        Users U
    JOIN
        SetupRole ON U.SetupRoleId = SetupRole.Id        
    WHERE
        (U.Name LIKE ? OR U.Username LIKE ? OR U.Email LIKE ?)
    ORDER BY 
        U.UpdatedOn DESC
    LIMIT ?, ?`;

    const queryCount = `
        SELECT 
            COUNT(1) AS totalRows
        FROM
            Users U
        WHERE
            (U.Name LIKE ? OR U.Username LIKE ? OR U.Email LIKE ?)
      `;

    connection.connection.query(
      query,
      [`%${search}%`, `%${search}%`, `%${search}%`, offset, limit],
      (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send("Internal server error");
          return;
        }

        connection.connection.query(
          queryCount,
          [`%${search}%`, `%${search}%`, `%${search}%`],
          (err, countResult) => {
            if (err) {
              console.error(err);
              res.status(500).send("Internal server error");
              return;
            }

            const totalRows = countResult[0].totalRows;
            const totalPages = Math.ceil(totalRows / limit);

            const response = {
              code: 200,
              message: "Success Get users",
              totalPages: totalPages,
              totalRows: totalRows,
              limit: limit,
              currentPage: page,
              data: results,
            };
            res.status(200).json(response);
          }
        );
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
