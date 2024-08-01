// models/TrxHistoryMemberProducts.js
import { DataTypes } from "sequelize";
import db from "../../../config/dbConfig.js";
import MemberUserProduct from "./MemberUserProduct.js";

const TrxHistoryMemberProducts = db.define(
  "TrxHistoryMemberProduct",
  {
    Id: {
      type: DataTypes.BIGINT(20),
      autoIncrement: true,
      primaryKey: true,
    },
    ExpiredDate: {
      type: DataTypes.DATE(6),
      allowNull: false,
    },
    IsPaid: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
    },
    Status: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    TransactionDate: {
      type: DataTypes.DATE(6),
      allowNull: false,
    },
    MemberUserProductId: {
      type: DataTypes.BIGINT(20),
      allowNull: false,
      references: {
        model: "MemberUserProducts",
        key: "Id",
      },
    },
    MemberProductId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: "MemberProducts",
        key: "Id",
      },
    },
    TrxId: {
      type: DataTypes.STRING(18),
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export default TrxHistoryMemberProducts;
