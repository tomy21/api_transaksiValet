import { DataTypes } from "sequelize";
import db from "../config/dbConfig.js";
import { Location } from "./RefLocation.js";
import { Users } from "./Users.js";
import { TransactionValet } from "./TransactionValet.js";

export const transactionValetHistory = db.define(
  "TransactionParkingValetHistory",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    LocationCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    TransactionParkingValetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CreatedOn: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    CreatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    RecordStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "TransactionParkingValetHistory",
  }
);

transactionValetHistory.belongsTo(TransactionValet, {
  foreignKey: "TransactionParkingValetId",
  targetKey: "Id",
});
