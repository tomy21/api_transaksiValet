import { Sequelize, DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const MemberProduct = db.define(
  "MemberProducts",
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ProductName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ProductDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    VehicleType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DateActive: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    MaxQuote: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CurrentQuote: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Price: {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: false,
    },
    IsActive: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    LocationCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    LocationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CreatedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    UpdatedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    DeletedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    CreatedOn: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    DeletedOn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  }
);

export default MemberProduct;
