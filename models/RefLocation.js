import { DataTypes } from "sequelize";
import db from "../config/dbConfig.js";

export const Location = db.define(
  "RefLocation",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Code: {
      type: DataTypes.STRING(40),
    },
    Name: {
      type: DataTypes.STRING(150),
    },
    Region: {
      type: DataTypes.STRING(50),
    },
    Vendor: {
      type: DataTypes.STRING(150),
    },
    VendorParkingCode: {
      type: DataTypes.STRING(30),
    },
    ShortName: {
      type: DataTypes.STRING(100),
    },
    Address: {
      type: DataTypes.TEXT,
    },
    StartTime: {
      type: DataTypes.TIME,
    },
    EndTime: {
      type: DataTypes.TIME,
    },
    DateNext: {
      type: DataTypes.INTEGER,
    },
    TimeZone: {
      type: DataTypes.STRING(5),
    },
    CreatedOn: {
      type: DataTypes.DATE,
      field: "CreatedOn",
      defaultValue: DataTypes.NOW,
    },
    CreatedBy: {
      type: DataTypes.STRING(50),
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      field: "UpdatedOn",
      defaultValue: DataTypes.NOW,
    },
    UpdatedBy: {
      type: DataTypes.STRING(50),
    },
    DeletedOn: {
      type: DataTypes.DATE,
      field: "DeletedOn",
    },
    DeletedBy: {
      type: DataTypes.STRING(50),
    },
    RecordStatus: {
      type: DataTypes.INTEGER,
    },
    IsMember: {
      type: DataTypes.BOOLEAN,
    },
  },
  { timestamps: false, tableName: "RefLocation" }
);
