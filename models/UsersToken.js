import { DataTypes } from "sequelize";
import db from "../config/dbConfig.js";

export const UsersToken = db.define(
  "UsersToken",
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UserId: {
      type: DataTypes.INTEGER,
    },
    OperatingSystem: {
      type: DataTypes.ENUM("Android", "IOS", "Website"),
    },
    App: {
      type: DataTypes.STRING(50),
    },
    TokenFCM: {
      type: DataTypes.TEXT,
    },
    RefreshToken: {
      type: DataTypes.TEXT,
    },
    Device: {
      type: DataTypes.STRING(50),
    },
    Detail_Device: {
      type: DataTypes.STRING(250),
    },
    Version: {
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
  },
  { timestamps: false, tableName: "UsersToken" }
);
