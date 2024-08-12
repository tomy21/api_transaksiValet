import { DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const TrxMemberQuota = db.define(
  "TrxMemberQuote",
  {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CurrentQuota: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MemberProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export default TrxMemberQuota;
