import { DataTypes } from "sequelize";
import db from "../config/dbConfig.js";

export const TicketCategory = db.define(
  "RefTicketCategory",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Code: {
      type: DataTypes.STRING(50),
    },
    Name: {
      type: DataTypes.STRING(50),
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
    RecordStatus: {
      type: DataTypes.INTEGER,
    },
  },
  {
    paranoid: true,
    timestamps: false,
    tableName: "RefTicketCategory",
  }
);
