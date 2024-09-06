import { DataTypes } from "sequelize";
import dbOCC from "../../config/dbLocal.js";

export const LocationCCC = dbOCC.define(
  "tbl_lokasi",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    Code: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Region: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Vendor: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    VendorParkingCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ShortName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    StartTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    EndTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    DateNext: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TimeZone: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    paranoid: true, // Enable soft delete
    tableName: "tbl_lokasi", // Customize table name
  }
);
