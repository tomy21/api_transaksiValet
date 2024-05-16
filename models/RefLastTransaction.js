import { DataTypes } from "sequelize";
import db from "../config/dbConfig.js";

export const RefLastTransaction = db.define(
  "RefSeqNo_TicketValet",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Code: {
      type: DataTypes.STRING(45),
    },
    Name: {
      type: DataTypes.STRING(50),
    },
    Numbers: {
      type: DataTypes.INTEGER,
    },
    Description: {
      type: DataTypes.STRING(200),
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
    RecordStatus: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: false,
    tableName: "RefSeqNo_TicketValet",
  }
);

// Location.
