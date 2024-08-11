import { Sequelize, DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";

const TrxMemberPaidAmount = db.define(
  "TrxMemberPaidAmounts",
  {
    Id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    Value: {
      type: DataTypes.DECIMAL(16, 2),
      allowNull: false,
    },
    Currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "TrxMemberPaidAmounts",
  }
);

export default TrxMemberPaidAmount;
