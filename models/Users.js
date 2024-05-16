import { DataTypes } from "sequelize";
import db from "../config/dbConfig.js";

export const Users = db.define(
  "Users",
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    SetupRoleId: {
      type: DataTypes.INTEGER,
    },
    IpAddress: {
      type: DataTypes.STRING(15),
    },
    UserCode: {
      type: DataTypes.STRING(50),
    },
    Name: {
      type: DataTypes.STRING(150),
    },
    Gender: {
      type: DataTypes.STRING(5),
    },
    Birthdate: {
      type: DataTypes.DATE,
    },
    Username: {
      type: DataTypes.STRING(100),
    },
    Email: {
      type: DataTypes.STRING(100),
    },
    Phone: {
      type: DataTypes.STRING(20),
    },
    HandPhone: {
      type: DataTypes.STRING(20),
    },
    Whatsapp: {
      type: DataTypes.STRING(20),
    },
    Photo: {
      type: DataTypes.TEXT,
    },
    Password: {
      type: DataTypes.STRING(255),
    },
    PasswordExpired: {
      type: DataTypes.DATE,
    },
    IsFirstpassword: {
      type: DataTypes.INTEGER,
    },
    FlagAllLocation: {
      type: DataTypes.INTEGER(2),
    },
    MerchantId: {
      type: DataTypes.INTEGER,
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
    UserStatus: {
      type: DataTypes.INTEGER,
    },
    ResetPassword: {
      type: DataTypes.STRING(30),
    },
    ResetPasswordExpired: {
      type: DataTypes.DATE,
    },
    DeleteAccountOTP: {
      type: DataTypes.STRING(30),
    },
    DeleteStatus: {
      type: DataTypes.INTEGER,
    },
    DeleteReason: {
      type: DataTypes.TEXT,
    },
    LastActivity: {
      type: DataTypes.DATE,
    },
  },
  { timestamps: false }
);
