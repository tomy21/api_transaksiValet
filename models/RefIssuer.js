import { DataTypes } from "sequelize";
import db from "../config/dbConfig.js";

export const RefIssuer = db.define(
  "RefIssuer",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    IssuerId: {
      type: DataTypes.STRING(20),
    },
    IssuerName: {
      type: DataTypes.STRING(50),
    },
    IssuerLongName: {
      type: DataTypes.STRING(50),
    },
    Color: {
      type: DataTypes.STRING(15),
    },
    LogoUrl: {
      type: DataTypes.STRING(255),
    },
    SettlementPath: {
      type: DataTypes.STRING(255),
    },
    SettlementExtensionFile: {
      type: DataTypes.STRING(255),
    },
    FlagRecon: {
      type: DataTypes.STRING(2),
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
    timestamps: false,
    tableName: "RefIssuer",
  }
);
