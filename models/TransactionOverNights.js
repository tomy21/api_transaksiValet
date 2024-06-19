import { DataTypes } from "sequelize";
import db from "../config/dbConfig.js";
import { Location } from "./RefLocation.js";

export const TransactionOverNights = db.define(
  "TransactionOverNights",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    TransactionNo: {
      type: DataTypes.STRING(255),
    },
    ReferenceNo: {
      type: DataTypes.STRING(255),
    },
    LocationCode: {
      type: DataTypes.STRING(25),
    },
    VehiclePlateNo: {
      type: DataTypes.STRING(25),
    },
    TypeVehicle: {
      type: DataTypes.STRING(25),
    },
    Plateregognizer: {
      type: DataTypes.STRING(25),
    },
    Status: {
      type: DataTypes.STRING(10),
    },
    InTime: {
      type: DataTypes.DATE,
    },
    GateInCode: {
      type: DataTypes.STRING(255),
    },
    OutTime: {
      type: DataTypes.DATE,
    },
    PhotoImage: {
      type: DataTypes.BLOB,
    },
    PathPhotoImage: {
      type: DataTypes.STRING(255),
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
      field: "ModifiedOn",
      defaultValue: DataTypes.NOW,
    },
    UploadedAt: {
      type: DataTypes.DATE,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      field: "CreatedAt",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "TransactionOverNights",
  }
);

TransactionOverNights.belongsTo(Location, {
  foreignKey: "LocationCode",
  targetKey: "Code",
});
