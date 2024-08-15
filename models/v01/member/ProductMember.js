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
    isDeleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export default MemberProduct;
