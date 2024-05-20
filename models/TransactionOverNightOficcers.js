import { DataTypes } from "sequelize";
import db from "../config/dbConfig.js";

export const TransactionOverNightOficcers = db.define(
  "TransactionOverNightOficcers",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    LocationCode: {
      type: DataTypes.STRING(25),
    },
    VehiclePlateNo: {
      type: DataTypes.STRING(25),
    },
    Status: {
      type: DataTypes.STRING(10),
    },
    PhotoImage: {
      type: DataTypes.BLOB,
    },
    Remarks: {
      type: DataTypes.STRING(1000),
    },
    RecordStatus: {
      type: DataTypes.INTEGER(10),
    },
    ModifiedBy: {
      type: DataTypes.STRING(255),
    },
    ModifiedOn: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: false,
    tableName: "TransactionOverNightOficcers",
  }
);
