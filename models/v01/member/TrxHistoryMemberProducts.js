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
        model: MemberUserProduct,
        key: "Id",
      },
    },
    MemberProductId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
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

// Define the association
MemberUserProduct.hasMany(TrxHistoryMemberProducts, {
  foreignKey: "MemberUserProductId",
  as: "TrxHistoryMemberProduct",
});

TrxHistoryMemberProducts.belongsTo(MemberUserProduct, {
  foreignKey: "MemberUserProductId",
  as: "MemberUserProduct", // Use singular alias
});

export default TrxHistoryMemberProducts;
