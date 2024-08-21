import { Sequelize, DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const MemberMaster = db.define(
  "MemberMaster",
  {
    TransactionId: {
      type: DataTypes.STRING(18),
      allowNull: false,
      primaryKey: true,
    },
    ProviderName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    CardNo: {
      type: DataTypes.STRING(127),
      allowNull: true,
    },
    TypePayment: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ProductName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    LocationName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    Status: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    CreatedOn: {
      type: DataTypes.DATE(6),
      allowNull: true,
    },
    CreatedBy: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    UpdatedOn: {
      type: DataTypes.DATE(6),
      allowNull: true,
    },
    UpdatedBy: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "MemberMaster", // Sesuaikan dengan nama view di database Anda
  }
);

export default MemberMaster;
