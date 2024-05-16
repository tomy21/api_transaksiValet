import { DataTypes } from "sequelize";
import db from "../config/dbConfig.js";

export const Qris = db.define(
  "RefQris",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    LocationCode: {
      type: DataTypes.STRING(10),
    },
    TypeValet: {
      type: DataTypes.STRING(20),
    },
    Name: {
      type: DataTypes.STRING(50),
    },
    QrisCode: {
      type: DataTypes.STRING(250),
    },
    NMID: {
      type: DataTypes.STRING(250),
    },
    Tariff: {
      type: DataTypes.DOUBLE,
    },
    CreatedBy: {
      type: DataTypes.STRING(50),
    },
    CreatedOn: {
      type: DataTypes.DATE,
      field: "CreatedOn",
      defaultValue: DataTypes.NOW,
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
  },
  {
    paranoid: true,
    timestamps: false,
    tableName: "RefQris",
  }
);
