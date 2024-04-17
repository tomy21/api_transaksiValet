const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = express.Router();
const connection = require("../../config/dbConfig.js");
const dateTimeCurrent = require("../../config/currentDateTime.js");

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
        U.DeleteStatus = 0 AND
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
            U.DeleteStatus = 0 AND
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

router.get("/editUsers/:id", (req, res) => {
  try {
    const { id } = req.params;
    const query = `
    SELECT 
        U.Username, 
        U.Name, 
        U.Email,
        RefLocation.Name as LocationName,
        UsersLocation.qrisVVIP,
        UsersLocation.NMIDVIP,
        UsersLocation.NameRekVIP,
        UsersLocation.tariffVVIP,
        UsersLocation.qrisCasualValet,
        UsersLocation.NMIDValet,
        UsersLocation.NameRekValet,
        UsersLocation.tariffCasualValet,
        U.HandPhone,
        U.Gender,
        U.SetupRoleId,
        U.Photo,
        UsersLocation.typeValet
    FROM
        Users U
    JOIN
        SetupRole ON U.SetupRoleId = SetupRole.Id
    JOIN
        UsersLocation ON U.Id = UsersLocation.UserId 
    JOIN
        RefLocation ON UsersLocation.LocationCode = RefLocation.Code            
    WHERE
        U.Id = ?`;

    connection.connection.query(query, id, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal server error");
        return;
      }

      const response = {
        code: 200,
        message: `Success get id:${id}`,
        data: results,
      };

      res.status(200).json(response); // Kirim respon ke klien
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.put("/editUsers/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const dateCurrent = dateTimeCurrent("Asia/Jakarta");
  const updatedOn = dateCurrent.date_time;

  connection.connection.beginTransaction((err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal server error");
      return;
    }

    // Query untuk melakukan update data pada tabel Users
    const updateUsersQuery = `
        UPDATE Users
        SET Username = ?, Name = ?, Email = ?, UpdatedOn = ?
        WHERE Id = ?
    `;

    // Query untuk melakukan update data pada tabel UsersLocation
    const updateUsersLocationQuery = `
        UPDATE UsersLocation
        SET qrisVVIP = ?, NMIDVIP = ?, NameRekVIP = ?, tariffVVIP = ?, 
            qrisCasualValet = ?, NMIDValet = ?, NameRekValet = ?, tariffCasualValet = ?, typeValet = ?
        WHERE UserId = ?
    `;

    // Eksekusi query update pada tabel Users
    connection.connection.query(
      updateUsersQuery,
      [updateData.Username, updateData.Name, updateData.Email, updatedOn, id],
      (err, result) => {
        if (err) {
          // Rollback transaksi jika terjadi kesalahan
          connection.connection.rollback(() => {
            console.error(err);
            res.status(500).send("Internal server error");
          });
          return;
        }

        // Eksekusi query update pada tabel UsersLocation
        connection.connection.query(
          updateUsersLocationQuery,
          [
            updateData.qrisVVIP,
            updateData.NMIDVIP,
            updateData.NameRekVIP,
            updateData.tariffVVIP,
            updateData.qrisCasualValet,
            updateData.NMIDValet,
            updateData.NameRekValet,
            updateData.tariffCasualValet,
            updateData.typeValet,
            id,
          ],
          (err, result) => {
            if (err) {
              // Rollback transaksi jika terjadi kesalahan
              connection.connection.rollback(() => {
                console.error(err);
                res.status(500).send("Internal server error");
              });
              return;
            }

            // Commit transaksi jika semua query berhasil dieksekusi
            connection.connection.commit((err) => {
              if (err) {
                // Rollback transaksi jika terjadi kesalahan saat commit
                connection.connection.rollback(() => {
                  console.error(err);
                  res.status(500).send("Internal server error");
                });
                return;
              }

              res.status(200).send("Data updated successfully");
            });
          }
        );
      }
    );
  });
});

router.delete("/delete/user/:id", (req, res) => {
  const { id } = req.params;
  const usersName = req.body.usersName;
  const reason = req.body.reason || "No Reason";
  const dateCurrent = dateTimeCurrent("Asia/Jakarta");
  const dateUpdated = dateCurrent.date_time;
  const deletedStatus = 1;
  const userStatus = 0;

  const values = [id];
  const findUserLocationsId = `SELECT Id FROM UsersLocation WHERE UserId = ?`;
  const findUserLocationActiveId = `SELECT Id FROM UsersLocationActive WHERE UserId = ?`;
  const sqlDelete = `UPDATE Users SET DeleteStatus = ${deletedStatus}, DeleteReason = ?, UpdatedBy = ?, UserStatus = ${userStatus}, UpdatedOn = ? WHERE Id = ?`;
  const deletedUsersLocation = `UPDATE UsersLocation SET DeletedOn = ?, DeletedBy = ? WHERE Id = ?`;
  const deletedUsersLocationActive = `UPDATE UsersLocationActive SET DeletedOn = ?, UpdatedOn = ?, DeletedBy = ? WHERE Id = ?`;

  connection.connection.query(findUserLocationsId, values, (err, idUsers) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    const idUsersLocation = idUsers[0] ? idUsers[0].Id : null;
    connection.connection.query(
      findUserLocationActiveId,
      values,
      (err, idUserActive) => {
        if (err) {
          return res.status(500).json({ error: "Internal Server Error" });
        }
        const idUsersLocationActive = idUserActive[0]
          ? idUserActive[0].Id
          : null;

        const dataLocationActive = [
          dateUpdated,
          dateUpdated,
          usersName,
          idUsersLocationActive,
        ];
        connection.connection.query(
          deletedUsersLocationActive,
          dataLocationActive,
          (err, results) => {
            if (err) {
              return res.status(500).json({ error: "Internal Server Error" });
            }
            const dataLocation = [dateUpdated, usersName, idUsersLocation];

            connection.connection.query(
              deletedUsersLocation,
              dataLocation,
              (err, resultUserActive) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ error: "Internal Server Error" });
                }
                const dataUsersUpdated = [
                  reason,
                  usersName,
                  dateUpdated,
                  values[0],
                ];
                connection.connection.query(
                  sqlDelete,
                  dataUsersUpdated,
                  (err, resultUsers) => {
                    if (err) {
                      return res
                        .status(500)
                        .json({ error: "Internal Server Error" });
                    }

                    const response = {
                      code: 200,
                      message: `Successfully deleted user with id: ${id}`,
                      data: resultUsers,
                    };
                    res.status(200).json(response);
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

module.exports = router;
