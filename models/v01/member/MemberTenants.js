import { Sequelize, DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const MemberTenant = db.define(
  "MemberTenant",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    PhoneNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    Address: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    City: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    Region: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    PostalCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    Country: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    Fax: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    Status: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    CreatedBy: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    UpdatedBy: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    DeletedBy: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    CreatedOn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    UpdatedOn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    DeletedOn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "MemberTenants",
  }
);

export default MemberTenant;
