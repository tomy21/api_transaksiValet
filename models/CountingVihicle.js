import { DataTypes } from "sequelize";
import db from "../config/dbConfig.js";

export const CountingVihicle = db.define(
  "OCCRefCountingVIPs",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    LocationName: {
      type: DataTypes.STRING(255),
    },
    VihiclePlate: {
      type: DataTypes.STRING(255),
    },
    GateIn: {
      type: DataTypes.STRING(10),
    },
    GateOut: {
      type: DataTypes.STRING(10),
    },
    InTime: {
      type: DataTypes.DATE,
    },
    OutTime: {
      type: DataTypes.DATE,
    },
    Duration: {
      type: DataTypes.TIME,
    },
    PathPhotoIn01: {
      type: DataTypes.STRING(255),
    },
    PathPhotoIn02: {
      type: DataTypes.STRING(255),
    },
    PathPhotoOut01: {
      type: DataTypes.STRING(255),
    },
    PathPhotoOut02: {
      type: DataTypes.STRING(255),
    },
    Status: {
      type: DataTypes.STRING(45),
    },
    CreatedAt: {
      type: DataTypes.DATE,
      field: "CreatedAt",
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      field: "UpdatedAt",
      defaultValue: DataTypes.NOW,
    },
    RecordStatus: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: true,
    tableName: "OCCRefCountingVIPs",
  }
);
