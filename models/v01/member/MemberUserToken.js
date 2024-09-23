import { DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const MemberUserToken = db.define(
  "MemberUserToken",
  {
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    LoginProvider: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    Name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    Value: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    ExpiredDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CreatedOn: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    timestamps: false, // Nonaktifkan timestamps otomatis jika tidak dibutuhkan
    tableName: "MemberUserTokens", // Sesuaikan dengan nama tabel di database kamu
  }
);

export default MemberUserToken;
